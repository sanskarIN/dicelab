import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from './AppErrorBoundary';

function BrokenView(): never {
  throw new Error('synthetic render failure');
}

describe('AppErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders healthy children unchanged', () => {
    render(
      <AppErrorBoundary>
        <p>Healthy view</p>
      </AppErrorBoundary>,
    );
    expect(screen.getByText('Healthy view')).toBeInTheDocument();
  });

  it('replaces a failed interface with a localized recovery action and safe structured event', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <AppErrorBoundary>
        <BrokenView />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('DiceLab hit an unexpected interface error.');
    expect(screen.getByRole('button', { name: 'Reload DiceLab' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'error',
        event: 'ui.recovery_boundary_activated',
        context: { surface: 'application-root' },
      }),
    );
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain('synthetic render failure');
  });
});
