import { afterEach, describe, expect, it } from 'vitest';
import { isTauriRuntime } from './runtime';

afterEach(() => {
  Reflect.deleteProperty(window, '__TAURI_INTERNALS__');
});

describe('runtime detection', () => {
  it('treats the normal browser test environment as web', () => {
    expect(isTauriRuntime()).toBe(false);
  });

  it('recognizes the Tauri runtime marker', () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      configurable: true,
      value: {},
    });
    expect(isTauriRuntime()).toBe(true);
  });
});
