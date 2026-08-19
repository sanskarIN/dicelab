import { DiceExpressionError } from '../domain/parser';
import { ProbabilityComplexityError } from '../domain/probability';
import { BackupValidationError } from '../services/export';
import { messages } from './index';

export function formatDomainError(cause: unknown, fallback: string): string {
  if (cause instanceof DiceExpressionError) {
    switch (cause.code) {
      case 'invalid-format':
        return messages.domainErrors.invalidDiceFormat;
      case 'dice-count-out-of-range':
        return messages.domainErrors.diceCountRange(cause.context.min ?? 1, cause.context.max ?? 1_000);
      case 'side-count-out-of-range':
        return messages.domainErrors.sideCountRange(cause.context.min ?? 2, cause.context.max ?? 1_000_000);
      case 'modifier-out-of-range':
        return messages.domainErrors.modifierRange(cause.context.max ?? 1_000_000_000);
      case 'selection-count-too-small':
        return messages.domainErrors.selectionCountTooSmall(cause.context.min ?? 1);
      case 'keep-count-exceeds-dice':
        return messages.domainErrors.keepCountExceedsDice;
      case 'drop-count-removes-all':
        return messages.domainErrors.dropCountRemovesAll;
    }
  }

  if (cause instanceof ProbabilityComplexityError) {
    switch (cause.code) {
      case 'distribution-too-large':
        return messages.domainErrors.probabilityDistributionTooLarge;
      case 'unsafe-outcome-count':
        return messages.domainErrors.probabilityUnsafeOutcomes;
      case 'keep-drop-too-complex':
        return messages.domainErrors.probabilityKeepDropLimit(cause.context.limit ?? 2_000_000);
      case 'empty-distribution':
        return messages.domainErrors.probabilityEmpty;
    }
  }

  return fallback;
}

export function formatBackupError(cause: unknown, fallback: string): string {
  if (!(cause instanceof BackupValidationError)) return fallback;

  switch (cause.code) {
    case 'backup-too-large':
      return messages.backupErrors.tooLarge;
    case 'invalid-json':
      return messages.backupErrors.invalidJson;
    case 'invalid-root':
      return messages.backupErrors.invalidRoot;
    case 'unsupported-schema':
      return messages.backupErrors.unsupportedSchema;
    case 'invalid-history-shape':
      return messages.backupErrors.invalidHistoryShape(cause.context.limit ?? 5_000);
    case 'invalid-presets-shape':
      return messages.backupErrors.invalidPresetsShape(cause.context.limit ?? 500);
    case 'invalid-history-entry':
      return messages.backupErrors.invalidHistoryEntry;
    case 'invalid-preset':
      return messages.backupErrors.invalidPreset;
    case 'duplicate-roll-ids':
      return messages.backupErrors.duplicateRollIds;
    case 'duplicate-preset-ids':
      return messages.backupErrors.duplicatePresetIds;
    case 'invalid-export-timestamp':
      return messages.backupErrors.invalidExportTimestamp;
    case 'invalid-settings':
      return messages.backupErrors.invalidSettings;
    case 'invalid-theme':
      return messages.backupErrors.invalidTheme;
    case 'invalid-random-mode':
      return messages.backupErrors.invalidRandomMode;
  }
}
