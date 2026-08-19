import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette';

function PaletteHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open commands
      </button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={() => undefined}
        onSetExpression={() => undefined}
      />
    </>
  );
}

describe('CommandPalette accessibility', () => {
  it('moves focus into the dialog, traps backwards tabbing, and restores focus on close', async () => {
    render(<PaletteHarness />);
    const trigger = screen.getByRole('button', { name: 'Open commands' });
    trigger.focus();
    fireEvent.click(trigger);

    const search = screen.getByLabelText('Search quick actions');
    await waitFor(() => expect(search).toHaveFocus());

    fireEvent.keyDown(search, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: /Roll ability score/ })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('filters commands and runs the first result with Enter', async () => {
    const onNavigate = vi.fn();
    const onSetExpression = vi.fn();
    const onClose = vi.fn();
    render(
      <CommandPalette open onClose={onClose} onNavigate={onNavigate} onSetExpression={onSetExpression} />,
    );

    const search = screen.getByLabelText('Search quick actions');
    await waitFor(() => expect(search).toHaveFocus());
    fireEvent.change(search, { target: { value: 'advantage' } });
    fireEvent.keyDown(search, { key: 'Enter' });

    expect(onSetExpression).toHaveBeenCalledWith('2d20kh1');
    expect(onNavigate).toHaveBeenCalledWith('roll');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
