import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RollResult } from '../domain/types';
import { setLocale } from '../i18n';
import { RollWorkspace } from './RollWorkspace';

const lastRoll: RollResult = {
  id: 'localized-roll',
  expression: '1d1000000',
  total: 123456,
  dice: [{ value: 123456, kept: true, index: 0 }],
  modifier: 0,
  mode: 'seeded',
  seed: 'localization-test:0',
  rolledAt: '2026-08-19T09:00:00.000Z',
};

afterEach(() => setLocale('en'));

describe('RollWorkspace localization', () => {
  it('uses the active Hindi locale for result numbers and copy', () => {
    setLocale('hi');
    render(
      <RollWorkspace
        expression="1d1000000"
        onExpressionChange={vi.fn()}
        onRoll={vi.fn().mockResolvedValue(undefined)}
        lastRoll={lastRoll}
        presets={[]}
        onSavePreset={vi.fn()}
        onDeletePreset={vi.fn()}
        randomMode="seeded"
        busy={false}
        error={null}
      />,
    );

    expect(screen.getByRole('heading', { name: 'विश्वास के साथ रोल करें।' })).toBeInTheDocument();
    expect(screen.getAllByText('1,23,456')).toHaveLength(2);
    expect(screen.getByText(/सीड localization-test:0/)).toBeInTheDocument();
  });
});
