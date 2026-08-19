import { invoke } from '@tauri-apps/api/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RollResult } from '../domain/types';
import { historyToCsv, historyToJson, saveTextExport } from './export';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

const roll: RollResult = {
  id: 'roll-1',
  expression: '2d6+1',
  total: 9,
  dice: [
    { value: 3, kept: true, index: 0 },
    { value: 5, kept: true, index: 1 },
  ],
  modifier: 1,
  mode: 'seeded',
  seed: 'example,seed',
  rolledAt: '2026-08-19T00:00:00.000Z',
};

afterEach(() => {
  Reflect.deleteProperty(window, '__TAURI_INTERNALS__');
  vi.restoreAllMocks();
  vi.mocked(invoke).mockReset();
});

describe('history exports', () => {
  it('serializes valid JSON with a trailing newline', () => {
    const output = historyToJson([roll]);
    expect(output.endsWith('\n')).toBe(true);
    expect(JSON.parse(output)).toEqual([roll]);
  });

  it('escapes CSV cells containing commas', () => {
    const output = historyToCsv([roll]);
    expect(output).toContain('"example,seed"');
    expect(output.split('\n')[0]).toBe('id,rolled_at,expression,total,modifier,mode,seed,dice');
  });

  it.each(['=1+1', '+SUM(A1:A2)', '-10+20', '@danger'])('neutralizes formula-like seed %s', (seed) => {
    const output = historyToCsv([{ ...roll, seed }]);
    expect(output).toContain(`'${seed}`);
  });

  it.each(['\t=1+1', '   +SUM(A1:A2)'])('neutralizes whitespace-prefixed formula-like seed %j', (seed) => {
    const output = historyToCsv([{ ...roll, seed }]);
    expect(output).toContain(`'${seed}`);
  });

  it('neutralizes formula prefixes before applying normal CSV quoting', () => {
    const output = historyToCsv([{ ...roll, seed: '=HYPERLINK("https://example.invalid","click")' }]);
    expect(output).toContain("\"'=HYPERLINK(\"\"https://example.invalid\"\",\"\"click\"\")\"");
  });

  it('uses the browser download path outside Tauri', async () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:history-export');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    await expect(saveTextExport('dicelab-rolls.csv', 'a,b\n', 'text/csv', 'csv')).resolves.toBe(true);
    expect(invoke).not.toHaveBeenCalled();
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:history-export');
  });

  it('uses the dedicated native save command inside Tauri', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { configurable: true, value: {} });
    vi.mocked(invoke).mockResolvedValue(true);

    await expect(saveTextExport('dicelab-rolls.json', '[]\n', 'application/json', 'json')).resolves.toBe(true);
    expect(invoke).toHaveBeenCalledWith('save_text_export', {
      filename: 'dicelab-rolls.json',
      contents: '[]\n',
      format: 'json',
    });
  });

  it('preserves a native save-dialog cancellation without falling back to browser download', async () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', { configurable: true, value: {} });
    vi.mocked(invoke).mockResolvedValue(false);
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL');

    await expect(saveTextExport('dicelab-rolls.json', '[]\n', 'application/json', 'json')).resolves.toBe(false);
    expect(createObjectUrl).not.toHaveBeenCalled();
  });
});
