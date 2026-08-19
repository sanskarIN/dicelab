import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditCapabilities } from './check-capabilities.mjs';
import { auditLocalizedFormatting } from './check-localized-formatting.mjs';
import { auditRuntimeBoundaries } from './check-runtime-boundaries.mjs';
import { auditTauriSecurityFile } from './check-tauri-security.mjs';

export async function auditPolicyBoundaries() {
  const checks = [
    ['desktop-capabilities', auditCapabilities],
    ['tauri-security', auditTauriSecurityFile],
    ['localized-formatting', auditLocalizedFormatting],
    ['native-runtime', auditRuntimeBoundaries],
  ];

  const findings = [];
  for (const [policy, audit] of checks) {
    try {
      const policyFindings = await audit();
      findings.push(...policyFindings.map((finding) => `${policy}: ${finding}`));
    } catch {
      findings.push(`${policy}: audit could not be completed`);
    }
  }
  return findings;
}

async function main() {
  const findings = await auditPolicyBoundaries();
  if (findings.length === 0) {
    console.log('Repository policy boundary audit passed.');
    return;
  }

  console.error('Repository policy boundary audit failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exitCode = 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) await main();
