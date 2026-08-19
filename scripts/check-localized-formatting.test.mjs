import assert from 'node:assert/strict';
import test from 'node:test';
import { auditLocalizedFormattingSource } from './check-localized-formatting.mjs';

test('accepts shared formatter usage in UI source', () => {
  const source = `
    import { formatInteger, formatDateTime } from '../i18n/format';
    export function View({ value, date }) {
      return <span>{formatInteger(value)} {formatDateTime(date)}</span>;
    }
  `;
  assert.deepEqual(auditLocalizedFormattingSource(source, 'View.tsx'), []);
});

test('rejects toLocaleString in UI source', () => {
  const source = `export const value = total.toLocaleString();`;
  assert.deepEqual(auditLocalizedFormattingSource(source, 'View.tsx'), [
    'View.tsx:1: to-locale-string',
  ]);
});

test('rejects direct locale date and time helpers in UI source', () => {
  const source = `
const dateLabel = date.toLocaleDateString();
const timeLabel = date.toLocaleTimeString();
`;
  assert.deepEqual(auditLocalizedFormattingSource(source, 'View.tsx'), [
    'View.tsx:2: to-locale-date-string',
    'View.tsx:3: to-locale-time-string',
  ]);
});

test('rejects direct Intl formatters in UI source', () => {
  const source = `
const number = new Intl.NumberFormat().format(value);
const date = new Intl.DateTimeFormat().format(timestamp);
`;
  assert.deepEqual(auditLocalizedFormattingSource(source, 'View.tsx'), [
    'View.tsx:2: intl-number-format',
    'View.tsx:3: intl-date-time-format',
  ]);
});

test('reports every forbidden occurrence instead of stopping at the first one', () => {
  const source = `
const first = value.toLocaleString();
const second = other.toLocaleString();
`;
  assert.deepEqual(auditLocalizedFormattingSource(source, 'View.tsx'), [
    'View.tsx:2: to-locale-string',
    'View.tsx:3: to-locale-string',
  ]);
});
