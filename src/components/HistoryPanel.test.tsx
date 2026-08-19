import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { RollResult } from '../domain/types';
import { HistoryPanel } from './HistoryPanel';

function makeHistory(count: number): RollResult[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `roll-${index}`,
    expression: '1d6',
    total: (index % 6) + 1,
    dice: [{ value: (index % 6) + 1, kept: true, index: 0 }],
    modifier: 0,
    mode: 'seeded',
    seed: `history-test:${index}`,
    rolledAt: new Date(Date.UTC(2026, 7, 19, 4, 0, index % 60)).toISOString(),
  }));
}

describe('HistoryPanel performance behavior', () => {
  it('renders large histories progressively while keeping full statistics', () => {
    render(<HistoryPanel history={makeHistory(220)} onClear={vi.fn()} />);

    expect(within(screen.getByLabelText('Roll summary')).getByText('220')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(200);
    expect(screen.getByText('Showing 200 of 220 matching rolls.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show more rolls' }));
    expect(screen.getAllByRole('article')).toHaveLength(220);
    expect(screen.queryByRole('button', { name: 'Show more rolls' })).not.toBeInTheDocument();
  });

  it('resets the visible window when the history filter changes', () => {
    const history = makeHistory(220).map((roll, index) => ({
      ...roll,
      expression: index < 210 ? '1d6' : '1d20',
    }));
    render(<HistoryPanel history={history} onClear={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show more rolls' }));
    expect(screen.getAllByRole('article')).toHaveLength(220);

    fireEvent.change(screen.getByLabelText('Filter roll history'), { target: { value: '1d20' } });
    expect(screen.getAllByRole('article')).toHaveLength(10);
    expect(screen.queryByRole('button', { name: 'Show more rolls' })).not.toBeInTheDocument();
  });
});
