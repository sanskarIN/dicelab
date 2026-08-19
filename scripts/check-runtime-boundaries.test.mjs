import assert from 'node:assert/strict';
import test from 'node:test';
import { auditRuntimeBoundarySource } from './check-runtime-boundaries.mjs';

test('accepts Tauri invoke access in approved service adapters', () => {
  const source = `const { invoke } = await import('@tauri-apps/api/core');`;
  assert.deepEqual(auditRuntimeBoundarySource(source, 'src/services/export.ts'), []);
  assert.deepEqual(auditRuntimeBoundarySource(source, 'src/services/roll-service.ts'), []);
});

test('rejects direct Tauri core imports in components', () => {
  const source = `import { invoke } from '@tauri-apps/api/core';`;
  assert.deepEqual(auditRuntimeBoundarySource(source, 'src/components/Unsafe.tsx'), [
    'src/components/Unsafe.tsx: direct Tauri core access is outside the approved service boundary',
  ]);
});

test('accepts runtime marker probing only in the runtime adapter', () => {
  const source = `return '__TAURI_INTERNALS__' in window;`;
  assert.deepEqual(auditRuntimeBoundarySource(source, 'src/services/runtime.ts'), []);
});

test('rejects runtime marker probing outside the runtime adapter', () => {
  const source = `if ('__TAURI_INTERNALS__' in window) native();`;
  assert.deepEqual(auditRuntimeBoundarySource(source, 'src/App.tsx'), [
    'src/App.tsx: direct Tauri runtime probing must stay in src/services/runtime.ts',
  ]);
});

test('reports both violations when a file bypasses both boundaries', () => {
  const source = `
import { invoke } from '@tauri-apps/api/core';
const native = '__TAURI_INTERNALS__' in window;
`;
  assert.deepEqual(auditRuntimeBoundarySource(source, 'src/unsafe.ts'), [
    'src/unsafe.ts: direct Tauri core access is outside the approved service boundary',
    'src/unsafe.ts: direct Tauri runtime probing must stay in src/services/runtime.ts',
  ]);
});
