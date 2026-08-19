import { describe, expect, it, vi } from 'vitest';
import { createSafeLogRecord, logger } from './logger';

describe('structured logger', () => {
  it('redacts sensitive keys recursively without mutating safe metadata', () => {
    const record = createSafeLogRecord('warn', 'Backup Import Failed', {
      operation: 'restore',
      email: 'person@example.test',
      nested: {
        token: 'secret-token',
        code: 'invalid-json',
      },
      seed: 'private-seed',
    });

    expect(record.event).toBe('backup-import-failed');
    expect(record.context).toEqual({
      operation: 'restore',
      email: '[redacted]',
      nested: { token: '[redacted]', code: 'invalid-json' },
      seed: '[redacted]',
    });
  });

  it('does not serialize error messages or stacks', () => {
    const error = new Error('user supplied private text');
    error.stack = 'private stack details';
    const record = createSafeLogRecord('error', 'render.failed', { cause: error });
    expect(record.context).toEqual({ cause: { errorType: 'Error' } });
    expect(JSON.stringify(record)).not.toContain('user supplied private text');
    expect(JSON.stringify(record)).not.toContain('private stack details');
  });

  it('bounds long strings arrays and deep structures', () => {
    const record = createSafeLogRecord('debug', 'bounded.context', {
      note: 'x'.repeat(500),
      values: Array.from({ length: 40 }, (_, index) => index),
      tree: { a: { b: { c: { d: { e: 'too-deep' } } } } },
    });
    const context = record.context ?? {};
    expect(String(context.note).length).toBeLessThanOrEqual(161);
    expect(context.values).toHaveLength(20);
    expect(JSON.stringify(context.tree)).toContain('[truncated-depth]');
  });

  it('emits one structured console object', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    logger.warn('storage.read_failed', { storageArea: 'local', keyClass: 'settings' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatchObject({
      level: 'warn',
      event: 'storage.read_failed',
      context: { storageArea: 'local', keyClass: 'settings' },
    });
    warn.mockRestore();
  });
});
