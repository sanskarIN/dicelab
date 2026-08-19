import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { DEFAULT_SETTINGS } from './domain/types';
import { setLocale } from './i18n';

const SETTINGS_KEY = 'dicelab.settings.v1';
const ONBOARDED_KEY = 'dicelab.onboarded.v1';

function openView(name: 'History' | 'Settings') {
  fireEvent.click(screen.getAllByRole('button', { name })[0]);
}

describe('DiceLab primary journeys', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, randomMode: 'seeded', seed: 'integration-test' }),
    );
  });

  afterEach(() => {
    setLocale('en');
    document.documentElement.lang = 'en';
    vi.restoreAllMocks();
  });

  it('rolls dice, persists the result in history, and exports the filtered log', async () => {
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:dicelab-export');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    render(<App />);

    const expression = screen.getByLabelText('Dice expression');
    fireEvent.change(expression, { target: { value: '2d6+1' } });
    const form = expression.closest('form');
    expect(form).not.toBeNull();
    fireEvent.click(within(form as HTMLFormElement).getByRole('button', { name: 'Roll' }));

    await waitFor(() => expect(screen.getByText(/Seed integration-test:0/)).toBeInTheDocument());

    openView('History');
    expect(screen.getByRole('heading', { name: 'History & statistics' })).toBeInTheDocument();
    expect(screen.getByText('2d6+1')).toBeInTheDocument();
    expect(within(screen.getByLabelText('Roll summary')).getByText('1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'CSV' }));
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:dicelab-export');
  });

  it('restores a valid backup through settings and exposes the restored roll in history', async () => {
    render(<App />);
    openView('Settings');

    const backup = {
      schemaVersion: 1,
      exportedAt: '2026-08-19T04:00:00.000Z',
      history: [
        {
          id: 'restored-roll',
          expression: '1d6',
          total: 4,
          dice: [{ value: 4, kept: true, index: 0 }],
          modifier: 0,
          mode: 'seeded',
          seed: 'restore-test:0',
          rolledAt: '2026-08-19T04:00:00.000Z',
        },
      ],
      presets: [],
      settings: { ...DEFAULT_SETTINGS, randomMode: 'seeded', seed: 'restore-test' },
    };
    const file = new File([JSON.stringify(backup)], 'dicelab-backup.json', { type: 'application/json' });

    fireEvent.change(screen.getByLabelText('Import backup'), { target: { files: [file] } });
    expect(await screen.findByRole('status')).toHaveTextContent('Backup restored successfully.');

    openView('History');
    expect(screen.getByText('1d6')).toBeInTheDocument();
    expect(within(screen.getByLabelText('Roll summary')).getByText('4–4')).toBeInTheDocument();
    expect(screen.getByText('Seeded')).toBeInTheDocument();
  });

  it('switches the complete interface and built-in presets to Hindi', async () => {
    render(<App />);
    openView('Settings');

    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'hi' } });

    expect(screen.getByRole('heading', { name: 'सेटिंग्स' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'hi');
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}').locale).toBe('hi'),
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'रोल' })[0]);
    expect(screen.getByText('D20 जाँच')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'रोल करें' })).toBeInTheDocument();
  });

  it('opens the About surface from Settings', () => {
    render(<App />);
    openView('Settings');
    fireEvent.click(screen.getByRole('button', { name: /Open About/i }));
    expect(screen.getByRole('heading', { name: 'About DiceLab' })).toBeInTheDocument();
    expect(screen.getByText('Made by the Sanskar')).toBeInTheDocument();
  });
});
