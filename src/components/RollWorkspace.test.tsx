import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import type { RollResult } from '../domain/types';
import { setLocale } from '../i18n';
import { RollWorkspace } from './RollWorkspace';

const lastRoll: RollResult = {
  id: 'localized-roll',
  expression: '1d1000000',
  total: 123456,
  dice: [{ value: 123456, kept: true, index: 0 }],
  modifier: 0,
  mode: 'seeded',
  seed: 'localization-test:0',
  rolledAt: '2026-08-19T09:00:00.000Z',
};

const baseProps: ComponentProps<typeof RollWorkspace> = {
  expression: '1d20',
  onExpressionChange: vi.fn(),
  onRoll: vi.fn().mockResolvedValue(undefined),
  presets: [],
  onSavePreset: vi.fn(),
  onDeletePreset: vi.fn(),
  randomMode: 'secure',
  busy: false,
  error: null,
};

afterEach(() => setLocale('en'));

function renderWorkspace(overrides: Partial<ComponentProps<typeof RollWorkspace>> = {}) {
  return render(<RollWorkspace {...baseProps} {...overrides} />);
}

describe('RollWorkspace localization', () => {
  it('uses the active Hindi locale for result numbers and copy', () => {
    setLocale('hi');
    renderWorkspace({
      expression: '1d1000000',
      lastRoll,
      randomMode: 'seeded',
      onExportPresets: vi.fn().mockResolvedValue(true),
      onImportPresets: vi.fn().mockResolvedValue(1),
    });

    expect(screen.getByRole('heading', { name: 'विश्वास के साथ रोल करें।' })).toBeInTheDocument();
    expect(screen.getAllByText('1,23,456')).toHaveLength(2);
    expect(screen.getByText(/सीड localization-test:0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'प्रीसेट निर्यात करें' })).toBeInTheDocument();
    expect(screen.getByLabelText('प्रीसेट आयात करें')).toBeInTheDocument();
  });
});

describe('RollWorkspace preset transfer', () => {
  it('reports a successful preset export', async () => {
    const onExportPresets = vi.fn().mockResolvedValue(true);
    renderWorkspace({ onExportPresets });

    fireEvent.click(screen.getByRole('button', { name: 'Export presets' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Preset file ready.');
    expect(onExportPresets).toHaveBeenCalledTimes(1);
  });

  it('imports a selected preset file and reports the count', async () => {
    const onImportPresets = vi.fn().mockResolvedValue(2);
    renderWorkspace({ onImportPresets });
    const file = new File(['{}'], 'shared-presets.json', { type: 'application/json' });

    fireEvent.change(screen.getByLabelText('Import presets'), { target: { files: [file] } });

    expect(await screen.findByRole('status')).toHaveTextContent('Imported 2 presets.');
    expect(onImportPresets).toHaveBeenCalledWith(file);
  });

  it('reports transfer failures without exposing exception text', async () => {
    const onExportPresets = vi.fn().mockRejectedValue(new Error('private path'));
    renderWorkspace({ onExportPresets });

    fireEvent.click(screen.getByRole('button', { name: 'Export presets' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Preset file could not be saved.');
    expect(screen.queryByText('private path')).not.toBeInTheDocument();
  });
});
