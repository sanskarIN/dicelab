import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { DEFAULT_SETTINGS } from './domain/types';
import { setLocale } from './i18n';

const SETTINGS_KEY = 'dicelab.settings.v1';
const ONBOARDED_KEY = 'dicelab.onboarded.v1';

describe('persisted locale startup', () => {
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

  it('renders the persisted Hindi catalog on the first application render', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'विश्वास के साथ रोल करें।' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'सेटिंग्स' }).length).toBeGreaterThan(0);
    expect(screen.getByText('D20 जाँच')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('lang', 'hi');
    expect(screen.queryByRole('heading', { name: 'Roll with confidence.' })).not.toBeInTheDocument();
  });
});
