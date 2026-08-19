import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.resolve(SCRIPT_DIRECTORY, '../src-tauri/tauri.conf.json');
const NETWORK_SCHEMES = new Set(['http:', 'https:', 'ws:', 'wss:']);
const LOCAL_TAURI_URL = /^http:\/\/(?:asset|ipc)\.localhost(?::\d+)?(?:\/|$)/i;
const LOOPBACK_NETWORK_URL = /^(?:https?|wss?):\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i;

export function auditOfflineCsp(csp, source = 'csp', { allowLoopback = false } = {}) {
  if (typeof csp !== 'string' || csp.trim().length === 0) {
    return [`${source}: a non-empty CSP string is required`];
  }

  const findings = [];
  for (const segment of csp.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const [directive, ...sources] = trimmed.split(/\s+/);
    for (const token of sources) {
      if (LOCAL_TAURI_URL.test(token)) continue;
      if (allowLoopback && LOOPBACK_NETWORK_URL.test(token)) continue;
      if (NETWORK_SCHEMES.has(token.toLowerCase())) {
        findings.push(`${source}: remote network scheme source is not allowed in ${directive}: ${token}`);
        continue;
      }
      if (/^(?:https?|wss?):\/\//i.test(token)) {
        findings.push(`${source}: remote network source is not allowed in ${directive}: ${token}`);
      }
    }
  }
  return findings;
}

export function auditOfflineTauriConfig(config, source = 'src-tauri/tauri.conf.json') {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return [`${source}: Tauri configuration root must be an object`];
  }
  const security = config.app?.security;
  if (!security || typeof security !== 'object' || Array.isArray(security)) {
    return [`${source}: app.security configuration is required`];
  }

  const findings = auditOfflineCsp(security.csp, `${source}: app.security.csp`);
  if ('devCsp' in security && security.devCsp !== null && security.devCsp !== undefined) {
    findings.push(
      ...auditOfflineCsp(security.devCsp, `${source}: app.security.devCsp`, { allowLoopback: true }),
    );
  }
  return findings;
}

export async function auditOfflineTauriSecurityFile(filepath = DEFAULT_CONFIG_PATH) {
  let config;
  try {
    config = JSON.parse(await readFile(filepath, 'utf8'));
  } catch {
    return [`${filepath}: Tauri configuration is not valid JSON`];
  }
  return auditOfflineTauriConfig(config, path.relative(process.cwd(), filepath) || filepath);
}

async function main() {
  const findings = await auditOfflineTauriSecurityFile();
  if (findings.length === 0) {
    console.log('Offline CSP network-source audit passed.');
    return;
  }

  console.error('Offline CSP network-source audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
