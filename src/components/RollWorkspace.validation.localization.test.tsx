import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../i18n';
import { RollWorkspace } from './RollWorkspace';

afterEach(() => setLocale('en'));

describe('RollWorkspace localized validation', () => {
  it('shows the Hindi parser correction message for an invalid expression', () => {
    setLocale('hi');
    render(
      <RollWorkspace
        expression="not-dice"
        onExpressionChange={vi.fn()}
        onRoll={vi.fn().mockResolvedValue(undefined)}
        presets={[]}
        onSavePreset={vi.fn()}
        onDeletePreset={vi.fn()}
        randomMode="secure"
        busy={false}
        error={null}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      '2d6+3, 4d6kh3 या 1d20 जैसी अभिव्यक्ति का उपयोग करें।',
    );
    expect(screen.getByRole('button', { name: 'रोल करें' })).toBeDisabled();
  });
});
