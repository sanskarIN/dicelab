import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { APP_VERSION, RELEASES_URL } from '../config/app';
import { DEFAULT_SETTINGS } from '../domain/types';
import { SettingsPanel } from './SettingsPanel';

function renderSettings(overrides: Partial<ComponentProps<typeof SettingsPanel>> = {}) {
  const props: ComponentProps<typeof SettingsPanel> = {
    settings: DEFAULT_SETTINGS,
    onChange: vi.fn(),
    onExportBackup: vi.fn().mockResolvedValue(true),
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

  it('emits the selected locale through the normal settings update path', () => {
    const props = renderSettings();
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'hi' } });
    expect(props.onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, locale: 'hi' });
  });

  it('normalizes a fractional history limit to a bounded integer', () => {
    const props = renderSettings();
    fireEvent.change(screen.getByRole('spinbutton', { name: /History limit/i }), { target: { value: '42.9' } });
    expect(props.onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, historyLimit: 42 });
  });

  it('reports a successful backup export', async () => {
    const props = renderSettings();
    fireEvent.click(screen.getByRole('button', { name: /Export backup/i }));
    expect(props.onExportBackup).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('status')).toHaveTextContent('Backup export ready.');
  });

  it('reports a failed backup export without exposing raw errors', async () => {
    const onExportBackup = vi.fn().mockRejectedValue(new Error('private filesystem path'));
    renderSettings({ onExportBackup });
    fireEvent.click(screen.getByRole('button', { name: /Export backup/i }));
    expect(await screen.findByRole('status')).toHaveTextContent('Backup export failed.');
    expect(screen.queryByText(/private filesystem path/i)).not.toBeInTheDocument();
  });

  it('exposes version, release notes, and the About view', () => {
    const props = renderSettings();
    expect(screen.getByText(`DiceLab ${APP_VERSION}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Releases/i })).toHaveAttribute('href', RELEASES_URL);
    fireEvent.click(screen.getByRole('button', { name: /Open About/i }));
    expect(props.onOpenAbout).toHaveBeenCalledTimes(1);
  });
});
