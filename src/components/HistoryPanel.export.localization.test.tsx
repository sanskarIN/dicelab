import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { RollResult } from '../domain/types';
import { setLocale } from '../i18n';
import { HistoryPanel } from './HistoryPanel';

const roll: RollResult = {
  id: 'localized-export-roll',
  expression: '1d6',
  total: 4,
  dice: [{ value: 4, kept: true, index: 0 }],
  modifier: 0,
  mode: 'seeded',
  seed: 'localized-export:0',
  rolledAt: '2026-08-19T09:00:00.000Z',
};

afterEach(() => {
  setLocale('en');
  vi.restoreAllMocks();
});

describe('HistoryPanel localized export feedback', () => {
  it('reports a successful browser export in Hindi', async () => {
    setLocale('hi');
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:localized-history');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    render(<HistoryPanel history={[roll]} onClear={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'CSV' }));

    expect(await screen.findByRole('status')).toHaveTextContent('निर्यात तैयार है।');
  });

  it('reports a browser export failure in Hindi without raw details', async () => {
    setLocale('hi');
    vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('private browser detail');
    });

    render(<HistoryPanel history={[roll]} onClear={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'JSON' }));

    expect(await screen.findByRole('status')).toHaveTextContent('निर्यात सहेजा नहीं जा सका।');
    expect(screen.queryByText(/private browser detail/i)).not.toBeInTheDocument();
  });
});
