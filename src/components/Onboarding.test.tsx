import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Onboarding } from './Onboarding';

describe('Onboarding accessibility', () => {
  it('announces the dialog, focuses the primary action, and contains Tab focus', async () => {
    const onComplete = vi.fn();
    const outside = document.createElement('button');
    outside.textContent = 'Outside control';
    document.body.appendChild(outside);

    render(<Onboarding onComplete={onComplete} />);

    const dialog = screen.getByRole('dialog', { name: 'A calmer way to roll.' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(/designed to work offline from the first roll/i);

    const start = screen.getByRole('button', { name: 'Start rolling' });
    await waitFor(() => expect(start).toHaveFocus());

    fireEvent.keyDown(start, { key: 'Tab' });
    expect(start).toHaveFocus();
    expect(outside).not.toHaveFocus();

    fireEvent.keyDown(start, { key: 'Tab', shiftKey: true });
    expect(start).toHaveFocus();

    fireEvent.click(start);
    expect(onComplete).toHaveBeenCalledTimes(1);
    outside.remove();
  });
});
