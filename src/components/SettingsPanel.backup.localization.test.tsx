import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../domain/types';
import { setLocale } from '../i18n';
import { BackupValidationError } from '../services/export';
import { SettingsPanel } from './SettingsPanel';

afterEach(() => setLocale('en'));

describe('SettingsPanel localized backup failures', () => {
  it('shows a safe Hindi message for an oversized backup import', async () => {
    setLocale('hi');
    const onImportBackup = vi.fn().mockRejectedValue(
      new BackupValidationError('backup-too-large', 'developer-only size detail', { limit: 5_000_000 }),
    );

    render(
      <SettingsPanel
        settings={{ ...DEFAULT_SETTINGS, locale: 'hi' }}
        onChange={vi.fn()}
        onExportBackup={vi.fn().mockResolvedValue(true)}
        onImportBackup={onImportBackup}
        onClearData={vi.fn()}
        onOpenAbout={vi.fn()}
      />,
    );

    const file = new File(['{}'], 'backup.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText('बैकअप आयात करें'), {
      target: { files: [file] },
    });

    expect(await screen.findByRole('status')).toHaveTextContent('बैकअप समर्थित 5 MB सीमा से बड़ा है।');
    expect(screen.queryByText(/developer-only size detail/i)).not.toBeInTheDocument();
  });

  it('shows a generic Hindi message for an unknown backup export failure', async () => {
    setLocale('hi');
    render(
      <SettingsPanel
        settings={{ ...DEFAULT_SETTINGS, locale: 'hi' }}
        onChange={vi.fn()}
        onExportBackup={vi.fn().mockRejectedValue(new Error('private native detail'))}
        onImportBackup={vi.fn().mockResolvedValue(undefined)}
        onClearData={vi.fn()}
        onOpenAbout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'बैकअप निर्यात करें' }));
    expect(await screen.findByRole('status')).toHaveTextContent('बैकअप निर्यात विफल हुआ।');
    expect(screen.queryByText(/private native detail/i)).not.toBeInTheDocument();
  });
});
