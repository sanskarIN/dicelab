import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { DEFAULT_SETTINGS } from './domain/types';
import { setLocale } from './i18n';

const SETTINGS_KEY = 'dicelab.settings.v1';
const ONBOARDED_KEY = 'dicelab.onboarded.v1';

const restoredPreset = {
  id: 'custom-restored-localized-preset',
  name: 'Keep My Custom Name',
  expression: '2d12+4',
  description: 'Do not translate this user text',
  createdAt: '2026-08-19T08:30:00.000Z',
};

describe('locale backup restoration', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    setLocale('en');
  });

  afterEach(() => {
    setLocale('en');
    document.documentElement.lang = 'en';
    localStorage.clear();
  });

  it('switches the live app to Hindi while preserving restored user-created copy', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Settings' })[0]);

    const backup = {
      schemaVersion: 1,
      exportedAt: '2026-08-19T08:30:00.000Z',
      history: [],
      presets: [restoredPreset],
      settings: { ...DEFAULT_SETTINGS, locale: 'hi' },
    };
    const file = new File([JSON.stringify(backup)], 'dicelab-backup.json', {
      type: 'application/json',
    });

    fireEvent.change(screen.getByLabelText('Import backup'), {
      target: { files: [file] },
    });

    expect(await screen.findByRole('status')).toHaveTextContent('बैकअप सफलतापूर्वक पुनर्स्थापित हुआ।');
    expect(screen.getByRole('heading', { name: 'सेटिंग्स' })).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'hi');

    fireEvent.click(screen.getAllByRole('button', { name: 'रोल' })[0]);
    expect(screen.getByText('D20 जाँच')).toBeInTheDocument();
    expect(screen.getByText(restoredPreset.name)).toBeInTheDocument();
    expect(screen.getByText(restoredPreset.description)).toBeInTheDocument();
  });
});
