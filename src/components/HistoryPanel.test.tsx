import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

afterEach(() => vi.restoreAllMocks());

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

  it('summarizes expression usage and follows the active filter', () => {
    const history = makeHistory(6).map((roll, index) => ({
      ...roll,
      expression: index < 4 ? '1d6' : '1d20',
      total: index < 4 ? index + 1 : 10 + index,
    }));
    render(<HistoryPanel history={history} onClear={vi.fn()} />);

    const analytics = screen.getByRole('heading', { name: 'Distribution' }).closest('.expression-analytics-panel');
    expect(analytics).not.toBeNull();
    expect(within(analytics as HTMLElement).getByText('1d6')).toBeInTheDocument();
    expect(within(analytics as HTMLElement).getByText('4 · 66.7%')).toBeInTheDocument();
    expect(within(analytics as HTMLElement).getByText('1d20')).toBeInTheDocument();
    expect(within(analytics as HTMLElement).getByText('2 · 33.3%')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Filter roll history'), { target: { value: '1d20' } });
    expect(within(analytics as HTMLElement).queryByText('1d6')).not.toBeInTheDocument();
    expect(within(analytics as HTMLElement).getByText('2 · 100%')).toBeInTheDocument();
  });

  it('reports a successful browser history export', async () => {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:history-panel');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    render(<HistoryPanel history={makeHistory(1)} onClear={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'CSV' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Export ready.');
  });

  it('reports export failures without exposing thrown details', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('private filesystem detail');
    });

    render(<HistoryPanel history={makeHistory(1)} onClear={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Export could not be saved.');
    expect(screen.queryByText(/private filesystem detail/i)).not.toBeInTheDocument();
  });
});