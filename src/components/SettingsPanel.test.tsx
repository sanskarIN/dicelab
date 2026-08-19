import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { APP_VERSION, RELEASES_URL } from '../config/app';
import { DEFAULT_SETTINGS } from '../domain/types';
import { SettingsPanel } from './SettingsPanel';

function renderSettings(overrides: Partial<React.ComponentProps<typeof SettingsPanel>> = {}) {
  const props: React.ComponentProps<typeof SettingsPanel> = {
    settings: DEFAULT_SETTINGS,
    onChange: vi.fn(),
    onExportBackup: vi.fn(),
    onImportBackup: vi.fn().mockResolvedValue(undefined),
    onClearData: vi.fn(),
    onOpenAbout: vi.fn(),
    ...overrides,
  };
  render(<SettingsPanel {...props} />);
  return props;
}

describe('SettingsPanel', () => {
  it('turns animations off when reduced motion is enabled', () => {
    const props = renderSettings();
    fireEvent.click(screen.getByRole('checkbox', { name: /Reduced motion/i }));
    expect(props.onChange).toHaveBeenCalledWith({
      ...DEFAULT_SETTINGS,
      reducedMotion: true,
      animations: false,
    });
  });

  it('exposes version, release notes, and the About view', () => {
    const props = renderSettings();
    expect(screen.getByText(`DiceLab ${APP_VERSION}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Releases/i })).toHaveAttribute('href', RELEASES_URL);
    fireEvent.click(screen.getByRole('button', { name: /Open About/i }));
    expect(props.onOpenAbout).toHaveBeenCalledTimes(1);
  });
});
