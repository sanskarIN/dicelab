import type { DicePreset, DiceLabSettings, RollResult } from '../domain/types';

export interface DiceLabBackup {
  schemaVersion: 1;
  exportedAt: string;
  history: RollResult[];
  presets: DicePreset[];
  settings: DiceLabSettings;
}

export function historyToJson(history: RollResult[]): string {
  return `${JSON.stringify(history, null, 2)}\n`;
}

export function historyToCsv(history: RollResult[]): string {
  const rows = [
    ['id', 'rolled_at', 'expression', 'total', 'modifier', 'mode', 'seed', 'dice'],
    ...history.map((roll) => [
      roll.id,
      roll.rolledAt,
      roll.expression,
      String(roll.total),
      String(roll.modifier),
      roll.mode,
      roll.seed ?? '',
      roll.dice.map((die) => `${die.value}${die.kept ? '' : ' (dropped)'}`).join(' | '),
    ]),
  ];
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}

export function createBackup(
  history: RollResult[],
  presets: DicePreset[],
  settings: DiceLabSettings,
): DiceLabBackup {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    history,
    presets: presets.filter((preset) => !preset.id.startsWith('builtin-')),
    settings,
  };
}

export function backupToJson(backup: DiceLabBackup): string {
  return `${JSON.stringify(backup, null, 2)}\n`;
}

export function downloadText(filename: string, contents: string, mimeType: string): void {
  const blob = new Blob([contents], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value: string): string {
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}
