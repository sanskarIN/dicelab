import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { DEFAULT_SETTINGS } from './domain/types';
import { setLocale } from './i18n';

const SETTINGS_KEY = 'dicelab.settings.v1';

describe('localized first-run onboarding', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, locale: 'hi' }));
    setLocale('en');
  });

  afterEach(() => {
    setLocale('en');
    document.documentElement.lang = 'en';
    localStorage.clear();
  });

  it('uses the persisted Hindi catalog before onboarding is completed', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'रोल करने का अधिक सरल तरीका।' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'रोल करना शुरू करें' })).toBeInTheDocument();
    expect(screen.getByText('शक्तिशाली अभिव्यक्तियाँ')).toBeInTheDocument();
    expect(screen.getByText('डिफ़ॉल्ट रूप से निजी')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'hi');
  });
});
