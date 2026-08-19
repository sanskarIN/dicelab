import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { DEFAULT_SETTINGS } from './domain/types';
import { setLocale } from './i18n';

const SETTINGS_KEY = 'dicelab.settings.v1';
const PRESETS_KEY = 'dicelab.presets.v1';
const ONBOARDED_KEY = 'dicelab.onboarded.v1';

const userPreset = {
  id: 'custom-localization-regression',
  name: 'My Dragon Check',
  expression: '3d8+2',
  description: 'Keep this exact user text',
  createdAt: '2026-08-19T08:00:00.000Z',
};

describe('live localization and user-created presets', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(PRESETS_KEY, JSON.stringify([userPreset]));
    setLocale('en');
  });

  afterEach(() => {
    setLocale('en');
    document.documentElement.lang = 'en';
    localStorage.clear();
  });

  it('localizes built-ins while preserving user-created preset copy', () => {
    render(<App />);

    expect(screen.getByText('D20 check')).toBeInTheDocument();
    expect(screen.getByText(userPreset.name)).toBeInTheDocument();
    expect(screen.getByText(userPreset.description)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Settings' })[0]);
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), {
      target: { value: 'hi' },
    });

    fireEvent.click(screen.getAllByRole('button', { name: 'रोल' })[0]);

    expect(screen.getByText('D20 जाँच')).toBeInTheDocument();
    expect(screen.queryByText('D20 check')).not.toBeInTheDocument();
    expect(screen.getByText(userPreset.name)).toBeInTheDocument();
    expect(screen.getByText(userPreset.description)).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'hi');
  });
});
