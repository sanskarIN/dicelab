import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { setLocale } from '../i18n';
import { ProbabilityPanel } from './ProbabilityPanel';

afterEach(() => setLocale('en'));

function calculate(expression: string) {
  fireEvent.change(screen.getByLabelText(/Expression|अभिव्यक्ति/), { target: { value: expression } });
  fireEvent.click(screen.getByRole('button', { name: /Calculate|गणना करें/ }));
}

function compare(expression: string) {
  fireEvent.change(screen.getByLabelText('B'), { target: { value: expression } });
  fireEvent.click(screen.getByRole('button', { name: 'A ↔ B' }));
}

function statValue(label: string): string | null {
  const card = screen.getByText(label).closest('.stat-card');
  return card?.querySelector('strong')?.textContent ?? null;
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

describe('ProbabilityPanel exact insights', () => {
  it('shows quartiles and standard deviation for the default 2d6 distribution', () => {
    render(<ProbabilityPanel />);

    expect(statValue('P25')).toBe('5');
    expect(statValue('P50')).toBe('7');
    expect(statValue('P75')).toBe('9');
    expect(statValue('σ')).toBe('2.415');
  });

  it('shows exact threshold probabilities and updates them when n changes', () => {
    render(<ProbabilityPanel />);

    expect(statValue('P(X = 7)')).toBe('16.67%');
    expect(statValue('P(X ≤ 7)')).toBe('58.33%');
    expect(statValue('P(X ≥ 7)')).toBe('58.33%');

    fireEvent.change(screen.getByLabelText('n'), { target: { value: '8' } });

    expect(statValue('P(X = 8)')).toBe('13.89%');
    expect(statValue('P(X ≤ 8)')).toBe('72.22%');
    expect(statValue('P(X ≥ 8)')).toBe('41.67%');
  });

  it('resets the threshold to the rounded expected value after a new calculation', () => {
    render(<ProbabilityPanel />);
    fireEvent.change(screen.getByLabelText('n'), { target: { value: '12' } });

    calculate('1d20');

    expect(screen.getByLabelText('n')).toHaveValue(11);
    expect(statValue('P50')).toBe('10');
  });
});

describe('ProbabilityPanel distribution comparison', () => {
  it('compares two exact distributions', () => {
    render(<ProbabilityPanel />);

    calculate('1d6');
    compare('1d4');

    expect(statValue('P(A > B)')).toBe('58.33%');
    expect(statValue('P(A = B)')).toBe('16.67%');
    expect(statValue('P(A < B)')).toBe('25%');
    expect(statValue('ΔE(A − B)')).toBe('+1.000');
  });

  it('exposes the comparison balance as an accessible visualization', () => {
    render(<ProbabilityPanel />);

    calculate('1d6');
    compare('1d4');

    const meter = screen.getByRole('img', {
      name: 'P(A > B) 58.33%; P(A = B) 16.67%; P(A < B) 25%',
    });
    expect(meter.querySelector('.comparison-meter-higher')).toHaveStyle({ flexBasis: '58.333333333333336%' });
    expect(meter.querySelector('.comparison-meter-tie')).toHaveStyle({ flexBasis: '16.666666666666664%' });
    expect(meter.querySelector('.comparison-meter-lower')).toHaveStyle({ flexBasis: '25%' });
  });

  it('keeps the last valid comparison when the comparison expression is invalid', () => {
    render(<ProbabilityPanel />);
    const before = statValue('P(A = B)');

    compare('not-dice');

    expect(screen.getByRole('alert')).toHaveTextContent('Use an expression such as');
    expect(statValue('P(A = B)')).toBe(before);
  });
});