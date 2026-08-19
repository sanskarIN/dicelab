import assert from 'node:assert/strict';
import test from 'node:test';
import { auditFileReference, parseDocumentedPaths } from './check-file-reference.mjs';

test('parses exact file paths from the first column of reference tables', () => {
  const markdown = `
| Path | Purpose |
| --- | --- |
| \`README.md\` | Project entry point |
| \`src/App.tsx\` | Application coordinator |
`;
  assert.deepEqual([...parseDocumentedPaths(markdown)].sort(), ['README.md', 'src/App.tsx']);
});

test('reports tracked files missing from the documentation', () => {
  assert.deepEqual(auditFileReference(['README.md', 'src/App.tsx'], new Set(['README.md'])), {
    missing: ['src/App.tsx'],
    stale: [],
  });
});

test('reports documented paths that are no longer tracked', () => {
  assert.deepEqual(auditFileReference(['README.md'], new Set(['README.md', 'old.md'])), {
    missing: [],
    stale: ['old.md'],
  });
});

test('accepts a synchronized tracked-file reference', () => {
  assert.deepEqual(
    auditFileReference(['README.md', 'src/App.tsx'], new Set(['README.md', 'src/App.tsx'])),
    { missing: [], stale: [] },
  );
});
