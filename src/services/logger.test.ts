import { afterEach, describe, expect, it, vi } from 'vitest';
import { logError, logEvent } from './logger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('structured logger', () => {
  it('redacts sensitive context keys', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logEvent('error', 'backup failed', {
      token: 'secret-token',
      seed: '=private-seed',
      randomMode: 'secure',
      historyCount: 12,
    });

    const payload = JSON.parse(String(spy.mock.calls[0]?.[0])) as {
      event: string;
      context: Record<string, unknown>;
    };
    expect(payload.event).toBe('backup_failed');
    expect(payload.context.token).toBe('[REDACTED]');
    expect(payload.context.seed).toBe('[REDACTED]');
    expect(payload.context.randomMode).toBe('secure');
    expect(payload.context.historyCount).toBe(12);
  });

  it('logs only the error type instead of the error message', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logError('roll_failed', new Error('sensitive expression or seed'), { randomMode: 'seeded' });

    const serialized = String(spy.mock.calls[0]?.[0]);
    const payload = JSON.parse(serialized) as { context: Record<string, unknown> };
    expect(payload.context.errorName).toBe('Error');
    expect(serialized).not.toContain('sensitive expression or seed');
  });
});
