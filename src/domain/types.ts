export type RandomMode = 'secure' | 'seeded';

export type SelectionKind = 'keep-highest' | 'keep-lowest' | 'drop-highest' | 'drop-lowest';

export interface DiceSelection {
  kind: SelectionKind;
  count: number;
}

export interface DiceExpression {
  count: number;
  sides: number;
  modifier: number;
  selection?: DiceSelection;
  normalized: string;
}

export interface DieRoll {
  value: number;
  kept: boolean;
  index: number;
}

export interface RollResult {
  id: string;
  expression: string;
  total: number;
  dice: DieRoll[];
  modifier: number;
  mode: RandomMode;
  seed?: string;
  rolledAt: string;
}

export interface DicePreset {
  id: string;
  name: string;
  expression: string;
  description?: string;
  createdAt: string;
}

export interface ProbabilityPoint {
  total: number;
  probability: number;
  ways: number;
}

export interface ProbabilityDistribution {
  expression: string;
  points: ProbabilityPoint[];
  expectedValue: number;
  minimum: number;
  maximum: number;
  exact: boolean;
  totalOutcomes: number;
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type LocalePreference = 'en' | 'hi';

export interface DiceLabSettings {
  theme: ThemePreference;
  locale: LocalePreference;
  reducedMotion: boolean;
  animations: boolean;
  randomMode: RandomMode;
  seed: string;
  historyLimit: number;
}

export const DEFAULT_SETTINGS: DiceLabSettings = {
  theme: 'system',
  locale: 'en',
  reducedMotion: false,
  animations: true,
  randomMode: 'secure',
  seed: 'dicelab',
  historyLimit: 500,
};
