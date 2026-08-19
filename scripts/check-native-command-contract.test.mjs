import assert from 'node:assert/strict';
import test from 'node:test';
import {
  auditFrontendInvokeSource,
  auditRustHandlerSource,
} from './check-native-command-contract.mjs';

test('accepts approved frontend command routing', () => {
  assert.deepEqual(
    auditFrontendInvokeSource(
      `const result = await invoke<Result>('roll_expression', { expression });`,
      'src/services/roll-service.ts',
    ),
    [],
  );
  assert.deepEqual(
    auditFrontendInvokeSource(
      `return invoke<boolean>('save_text_export', { filename, contents, format });`,
      'src/services/export.ts',
    ),
    [],
  );
});

test('rejects an unknown native command', () => {
  assert.deepEqual(
    auditFrontendInvokeSource(
      `await invoke('read_arbitrary_file', { path });`,
      'src/services/export.ts',
    ),
    ['src/services/export.ts: frontend invokes unapproved native command: read_arbitrary_file'],
  );
});

test('rejects an approved command from the wrong adapter', () => {
  assert.deepEqual(
    auditFrontendInvokeSource(
      `await invoke('save_text_export', payload);`,
      'src/components/Unsafe.tsx',
    ),
    ['src/components/Unsafe.tsx: save_text_export must be invoked only from src/services/export.ts'],
  );
});

test('rejects dynamic native command names', () => {
  assert.deepEqual(
    auditFrontendInvokeSource(`await invoke(commandName, payload);`, 'src/services/export.ts'),
    ['src/services/export.ts: native command name must be a static string literal'],
  );
});

test('accepts the complete approved Rust handler', () => {
  const source = `
    .invoke_handler(tauri::generate_handler![roll_expression, save_text_export])
  `;
  assert.deepEqual(auditRustHandlerSource(source), []);
});

test('rejects missing and unapproved Rust commands', () => {
  const source = `
    .invoke_handler(tauri::generate_handler![roll_expression, arbitrary_write])
  `;
  assert.deepEqual(auditRustHandlerSource(source), [
    'src-tauri/src/lib.rs: native handler exposes unapproved command: arbitrary_write',
    'src-tauri/src/lib.rs: approved native command is missing from handler: save_text_export',
  ]);
});

test('rejects duplicate Rust handler entries', () => {
  const source = `
    .invoke_handler(tauri::generate_handler![roll_expression, save_text_export, save_text_export])
  `;
  assert.deepEqual(auditRustHandlerSource(source), [
    'src-tauri/src/lib.rs: native command handler contains duplicate entries',
  ]);
});
