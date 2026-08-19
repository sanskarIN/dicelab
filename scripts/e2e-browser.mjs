import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const APP_HOST = '127.0.0.1';
const APP_PORT = 4173;
const APP_URL = `http://${APP_HOST}:${APP_PORT}`;
const STARTUP_TIMEOUT_MS = 30_000;
const STEP_TIMEOUT_MS = 12_000;

let previewProcess;
let browserProcess;
let session;
let temporaryRoot;

try {
  temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'dicelab-e2e-'));
  const downloadsDir = path.join(temporaryRoot, 'downloads');
  const profileDir = path.join(temporaryRoot, 'browser-profile');
  await fs.mkdir(downloadsDir, { recursive: true });

  await ensureProductionBuild();
  previewProcess = startPreview();
  await waitForHttp(APP_URL, STARTUP_TIMEOUT_MS);

  const browserBinary = await findBrowserBinary();
  const debugPort = await getFreePort();
  browserProcess = startBrowser(browserBinary, debugPort, profileDir);
  const pageTarget = await waitForPageTarget(debugPort, STARTUP_TIMEOUT_MS);
  session = await CdpSession.connect(pageTarget.webSocketDebuggerUrl);

  await session.send('Page.enable');
  await session.send('Runtime.enable');
  await session.send('DOM.enable');
  await allowDownloads(downloadsDir);
  await navigate(APP_URL);

  await step('complete first-run onboarding', async () => {
    await waitForText('Welcome to DiceLab');
    await clickButton('Start rolling');
    await waitForText('Roll with confidence.');
    await waitFor(() => !documentContains('Start rolling'), 'onboarding to close');
  });

  await step('roll a custom expression', async () => {
    await setInputValue('#dice-expression', '2d6+1');
    await waitFor(
      async () =>
        Boolean(
          await evaluateValue(`(() => {
            const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.trim() === 'Roll');
            return button && !button.disabled;
          })()`),
        ),
      'Roll button to become enabled',
    );
    await clickButton('Roll');
    await waitFor(
      async () => Boolean(await evaluateValue(`document.querySelector('.roll-total')?.textContent?.trim()`)),
      'roll result',
    );
  });

  await step('verify history and real CSV download', async () => {
    await clickButton('History');
    await waitForText('History & statistics');
    await waitForText('2d6+1');
    await clickButton('CSV');
    const csvPath = await waitForDownloadedFile(downloadsDir, 'dicelab-rolls.csv');
    const csv = await fs.readFile(csvPath, 'utf8');
    assert(csv.includes('2d6+1'), 'CSV export did not contain the rolled expression.');
  });

  await step('verify reload persistence', async () => {
    await session.send('Page.reload', { ignoreCache: true });
    await waitForDocumentReady();
    await waitForText('Roll with confidence.');
    assert(!(await documentContains('Start rolling')), 'Onboarding unexpectedly returned after reload.');
    await clickButton('History');
    await waitForText('2d6+1');
  });

  await step('verify keyboard command palette', async () => {
    await evaluateValue(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      return true;
    })()`);
    await waitForText('Quick actions');
    await waitFor(
      async () => (await evaluateValue(`document.activeElement?.getAttribute('aria-label')`)) === 'Search quick actions',
      'command search focus',
    );
    await evaluateValue(`(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      return true;
    })()`);
    await waitFor(() => !documentContains('Search actions…'), 'command palette to close');
  });

  await step('verify exact probability workflow', async () => {
    await clickButton('Probability');
    await waitForText('Probability calculator');
    await setInputValue('#probability-expression', '2d6');
    await clickButton('Calculate');
    await waitFor(
      async () =>
        Boolean(
          await evaluateValue(`(() => [...document.querySelectorAll('.stat-card')].some((card) => {
            const text = card.textContent?.replace(/\\s+/g, ' ').trim() ?? '';
            return text.includes('Expected value') && text.includes('7.000');
          }))()`),
        ),
      '2d6 expected value',
    );
  });

  let backupPath;
  await step('export backup using the browser download path', async () => {
    await clickButton('Settings');
    await waitForText('Settings');
    await clickButton('Export backup');
    backupPath = await waitForDownloadedFile(downloadsDir, 'dicelab-backup.json');
    const backup = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    assert(backup.schemaVersion === 1, 'Exported backup schema version was not 1.');
    assert(Array.isArray(backup.history) && backup.history.some((item) => item.expression === '2d6+1'), 'Exported backup did not contain roll history.');
  });

  await step('clear local data deliberately', async () => {
    await clickButton('Clear local data');
    await clickButton('Click again to clear');
    await waitForText('Welcome to DiceLab');
    await clickButton('Start rolling');
    await clickButton('History');
    await waitForText('No rolls yet');
  });

  await step('restore exported backup through a real file input', async () => {
    await clickButton('Settings');
    await setFileInput('input[type="file"]', backupPath);
    await waitForText('Backup restored successfully.');
    await clickButton('History');
    await waitForText('2d6+1');
  });

  console.log('DiceLab real-browser E2E passed.');
} catch (error) {
  console.error('DiceLab real-browser E2E failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  session?.close();
  stopProcess(browserProcess);
  stopProcess(previewProcess);
  if (temporaryRoot) await fs.rm(temporaryRoot, { recursive: true, force: true });
}

async function ensureProductionBuild() {
  try {
    await fs.access(path.resolve('dist/index.html'));
  } catch {
    throw new Error('dist/index.html is missing. Run npm run build before npm run test:e2e.');
  }
}

function startPreview() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const child = spawn(command, ['run', 'preview', '--', '--host', APP_HOST, '--port', String(APP_PORT), '--strictPort'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  captureProcessOutput(child, 'preview');
  return child;
}

function startBrowser(binary, debugPort, profileDir) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-allow-origins=*',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    'about:blank',
  ];
  if (process.env.CI && process.platform === 'linux') args.unshift('--no-sandbox');

  const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  captureProcessOutput(child, 'browser');
  return child;
}

async function findBrowserBinary() {
  const configured = process.env.CHROME_BIN;
  const candidates = [
    configured,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next known browser location.
    }
  }
  throw new Error('No Chromium/Chrome binary found. Set CHROME_BIN to a Chromium-compatible browser executable.');
}

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', reject);
    server.listen(0, APP_HOST, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a browser debugging port.'));
        return;
      }
      const { port } = address;
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function waitForPageTarget(debugPort, timeoutMs) {
  const endpoint = `http://${APP_HOST}:${debugPort}/json/list`;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const targets = await fetch(endpoint).then((response) => response.json());
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) return page;
    } catch {
      // Browser is still starting.
    }
    await delay(100);
  }
  throw new Error('Timed out waiting for Chromium DevTools target.');
}

async function allowDownloads(downloadPath) {
  try {
    await session.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath, eventsEnabled: true });
  } catch {
    await session.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath });
  }
}

async function navigate(url) {
  await session.send('Page.navigate', { url });
  await waitForDocumentReady();
}

async function waitForDocumentReady() {
  await waitFor(
    async () => (await evaluateValue('document.readyState')) === 'complete',
    'document ready state',
    STARTUP_TIMEOUT_MS,
  );
}

async function waitForHttp(url, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.ok || (response.status >= 300 && response.status < 400)) return;
    } catch {
      // Preview server is still starting.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for preview server at ${url}.`);
}

async function setInputValue(selector, value) {
  const applied = await evaluateValue(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!(element instanceof HTMLInputElement)) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (!setter) return false;
    setter.call(element, ${JSON.stringify(value)});
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  assert(applied, `Input ${selector} was not found.`);
}

async function setFileInput(selector, filePath) {
  const document = await session.send('DOM.getDocument', { depth: 1 });
  const query = await session.send('DOM.querySelector', { nodeId: document.root.nodeId, selector });
  assert(query.nodeId, `File input ${selector} was not found.`);
  await session.send('DOM.setFileInputFiles', { nodeId: query.nodeId, files: [path.resolve(filePath)] });
  await evaluateValue(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    if (!(input instanceof HTMLInputElement)) return false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
}

async function clickButton(text) {
  const clicked = await evaluateValue(`(() => {
    const normalize = (value) => value?.replace(/\\s+/g, ' ').trim() ?? '';
    const button = [...document.querySelectorAll('button')].find((item) => normalize(item.textContent) === ${JSON.stringify(text)} && !item.disabled);
    if (!button) return false;
    button.click();
    return true;
  })()`);
  assert(clicked, `Enabled button "${text}" was not found.`);
}

async function waitForText(text, timeoutMs = STEP_TIMEOUT_MS) {
  await waitFor(() => documentContains(text), `text ${JSON.stringify(text)}`, timeoutMs);
}

async function documentContains(text) {
  return Boolean(
    await evaluateValue(`document.body?.innerText?.includes(${JSON.stringify(text)}) ?? false`),
  );
}

async function waitForDownloadedFile(directory, filename, timeoutMs = STEP_TIMEOUT_MS) {
  const target = path.join(directory, filename);
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const stat = await fs.stat(target);
      if (stat.isFile() && stat.size > 0) return target;
    } catch {
      // Download is still pending.
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for browser download ${filename}.`);
}

async function evaluateValue(expression) {
  const response = await session.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text || 'Browser evaluation failed.');
  }
  return response.result?.value;
}

async function waitFor(predicate, description, timeoutMs = STEP_TIMEOUT_MS) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      if (await predicate()) return;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${description}.${lastError instanceof Error ? ` Last error: ${lastError.message}` : ''}`);
}

async function step(name, action) {
  process.stdout.write(`E2E: ${name} ... `);
  await action();
  console.log('ok');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function captureProcessOutput(child, label) {
  let stderr = '';
  child.stderr?.on('data', (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-4_000);
  });
  child.once('exit', (code, signal) => {
    if (code && code !== 0 && !process.exitCode) {
      console.error(`${label} exited unexpectedly with code ${code}${signal ? ` (${signal})` : ''}.`);
      if (stderr.trim()) console.error(stderr.trim());
    }
  });
}

function stopProcess(child) {
  if (!child || child.killed) return;
  child.kill('SIGTERM');
}

class CdpSession {
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out opening DevTools WebSocket.')), 10_000);
      socket.addEventListener('open', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      socket.addEventListener('error', () => {
        clearTimeout(timeout);
        reject(new Error('Could not open DevTools WebSocket.'));
      }, { once: true });
    });
    return new CdpSession(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(`${message.error.message} (${message.error.code})`));
      else pending.resolve(message.result ?? {});
    });
    socket.addEventListener('close', () => {
      for (const pending of this.pending.values()) pending.reject(new Error('DevTools WebSocket closed.'));
      this.pending.clear();
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket.close();
  }
}
