import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from '../i18n';
import { ProbabilityPanel } from './ProbabilityPanel';

afterEach(() => setLocale('en'));

function calculate(expression: string) {
  fireEvent.change(screen.getByLabelText(/Expression|अभिव्यक्ति/), { target: { value: expression } });
  fireEvent.click(screen.getByRole('button', { name: /Calculate|गणना करें/ }));
}

describe('ProbabilityPanel localization', () => {
  it('formats large finite outcome counts with English grouping', () => {
    setLocale('en');
    render(<ProbabilityPanel />);
    calculate('6d10');
    expect(screen.getByText('1,000,000')).toBeInTheDocument();
    expect(screen.getByText('33.000')).toBeInTheDocument();
  });

  it('formats large finite outcome counts with Hindi grouping', () => {
    setLocale('hi');
    render(<ProbabilityPanel />);
    calculate('6d10');
    expect(screen.getByText('10,00,000')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'प्रायिकता कैलकुलेटर' })).toBeInTheDocument();
  });
});
