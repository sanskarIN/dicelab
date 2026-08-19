import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Onboarding } from './Onboarding';

describe('Onboarding accessibility', () => {
  it('announces the dialog and focuses the primary action', async () => {
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    const dialog = screen.getByRole('dialog', { name: 'A calmer way to roll.' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription(/designed to work offline from the first roll/i);

    const start = screen.getByRole('button', { name: 'Start rolling' });
    await waitFor(() => expect(start).toHaveFocus());
    fireEvent.click(start);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
