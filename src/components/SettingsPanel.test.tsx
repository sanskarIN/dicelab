import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../domain/types';
import { copy } from '../i18n';
import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  it('associates settings labels with native controls and updates theme', () => {
    const onChange = vi.fn();
    render(
      <SettingsPanel
        settings={DEFAULT_SETTINGS}
        onChange={onChange}
        onExportBackup={vi.fn()}
        onImportBackup={vi.fn(async () => undefined)}
        onClearData={vi.fn()}
      />,
    );

    const theme = screen.getByRole('combobox', { name: copy.settings.theme });
    expect(theme).toHaveValue('system');
    fireEvent.change(theme, { target: { value: 'dark' } });
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_SETTINGS, theme: 'dark' });

    expect(screen.getByRole('checkbox', { name: copy.settings.reducedMotion })).toBeEnabled();
    expect(screen.getByRole('button', { name: copy.settings.exportBackup })).toBeEnabled();
  });
});
