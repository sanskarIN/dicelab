import { DiceExpressionError } from '../domain/parser';
import { ProbabilityComplexityError } from '../domain/probability';
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
