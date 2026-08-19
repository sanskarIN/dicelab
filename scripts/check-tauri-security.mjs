import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG_PATH = path.resolve(SCRIPT_DIRECTORY, '../src-tauri/tauri.conf.json');

export function auditTauriSecurityConfig(config, source = 'src-tauri/tauri.conf.json') {
  const findings = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return [`${source}: Tauri configuration root must be an object`];
  }

  const app = config.app;
  const security = app && typeof app === 'object' && !Array.isArray(app) ? app.security : undefined;
  if (!security || typeof security !== 'object' || Array.isArray(security)) {
    return [`${source}: app.security configuration is required`];
  }

  if ('dangerousRemoteDomainIpcAccess' in security) {
    findings.push(`${source}: dangerousRemoteDomainIpcAccess must not be configured`);
  }

  findings.push(...auditCsp(security.csp, `${source}: app.security.csp`));

  if ('devCsp' in security && security.devCsp !== null && security.devCsp !== undefined) {
    findings.push(...auditCsp(security.devCsp, `${source}: app.security.devCsp`));
  }

  return findings;
}

export function auditCsp(csp, source = 'csp') {
  if (typeof csp !== 'string' || csp.trim().length === 0) {
    return [`${source}: a non-empty CSP string is required`];
  }

  const findings = [];
  const directives = parseCsp(csp);
  const defaultSources = directives.get('default-src');

  if (!defaultSources || !defaultSources.includes("'self'")) {
    findings.push(`${source}: default-src must include 'self'`);
  }

  for (const [directive, sources] of directives) {
    if (sources.includes('*')) {
      findings.push(`${source}: wildcard source is not allowed in ${directive}`);
    }
    if (sources.includes("'unsafe-eval'")) {
      findings.push(`${source}: 'unsafe-eval' is not allowed in ${directive}`);
    }
  }

  const scriptSources = directives.get('script-src') ?? defaultSources ?? [];
  for (const sourceToken of scriptSources) {
    if (isRemoteNetworkSource(sourceToken)) {
      findings.push(`${source}: remote network script source is not allowed: ${sourceToken}`);
    }
  }

  return findings;
}

function parseCsp(csp) {
  const directives = new Map();
  for (const segment of csp.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const [name, ...sources] = trimmed.split(/\s+/);
    directives.set(name.toLowerCase(), sources);
  }
  return directives;
}

function isRemoteNetworkSource(source) {
  return /^https?:\/\//i.test(source) && !/^http:\/\/(ipc|asset)\.localhost(?::\d+)?(?:\/|$)/i.test(source);
}

export async function auditTauriSecurityFile(filepath = DEFAULT_CONFIG_PATH) {
  let config;
  try {
    config = JSON.parse(await readFile(filepath, 'utf8'));
  } catch {
    return [`${filepath}: Tauri configuration is not valid JSON`];
  }
  return auditTauriSecurityConfig(config, path.relative(process.cwd(), filepath) || filepath);
}

async function main() {
  const findings = await auditTauriSecurityFile();
  if (findings.length === 0) {
    console.log('Tauri security configuration audit passed.');
    return;
  }

  console.error('Tauri security configuration audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
