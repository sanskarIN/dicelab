import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { copy } from '../i18n';
import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('exposes a labeled modal and keyboard-operable completion button', () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    expect(screen.getByRole('dialog', { name: copy.onboarding.title })).toHaveAttribute('aria-modal', 'true');
    const button = screen.getByRole('button', { name: copy.onboarding.start });
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
