import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { DEFAULT_SETTINGS } from './domain/types';
import { setLocale } from './i18n';

const SETTINGS_KEY = 'dicelab.settings.v1';
const ONBOARDED_KEY = 'dicelab.onboarded.v1';

describe('clear-data locale reset', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(ONBOARDED_KEY, 'true');
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, locale: 'hi' }));
    setLocale('en');
  });

  afterEach(() => {
    setLocale('en');
    document.documentElement.lang = 'en';
    localStorage.clear();
  });

  it('returns the interface and onboarding to English defaults after confirmed clear', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'विश्वास के साथ रोल करें।' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'सेटिंग्स' })[0]);

    fireEvent.click(screen.getByRole('button', { name: 'स्थानीय डेटा साफ़ करें' }));
    fireEvent.click(screen.getByRole('button', { name: 'साफ़ करने के लिए फिर क्लिक करें' }));

    expect(await screen.findByRole('heading', { name: 'A calmer way to roll.' })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement).toHaveAttribute('lang', 'en'));
    expect(screen.getByRole('button', { name: 'Start rolling' })).toBeInTheDocument();
  });
});
