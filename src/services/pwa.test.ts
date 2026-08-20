import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canRegisterPwaServiceWorker,
  isServiceWorkerOriginAllowed,
  registerPwaServiceWorker,
  type PwaEnvironment,
} from './pwa';

function environment(overrides: Partial<PwaEnvironment> = {}): PwaEnvironment {
  return {
    production: true,
    tauri: false,
    protocol: 'https:',
    hostname: 'example.test',
    serviceWorker: {
      register: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('PWA service worker registration', () => {
  it('allows secure production web origins', () => {
    expect(canRegisterPwaServiceWorker(environment())).toBe(true);
  });

  it('allows localhost over HTTP for production-like local verification', () => {
    expect(isServiceWorkerOriginAllowed('http:', 'localhost')).toBe(true);
    expect(isServiceWorkerOriginAllowed('http:', '127.0.0.1')).toBe(true);
    expect(isServiceWorkerOriginAllowed('http:', '[::1]')).toBe(true);
  });

  it('rejects insecure remote origins', () => {
    expect(isServiceWorkerOriginAllowed('http:', 'example.test')).toBe(false);
  });

  it('does not register during development or inside Tauri', () => {
    expect(canRegisterPwaServiceWorker(environment({ production: false }))).toBe(false);
    expect(canRegisterPwaServiceWorker(environment({ tauri: true }))).toBe(false);
  });

  it('registers the root service worker with root scope', async () => {
    const register = vi.fn().mockResolvedValue({});
    const registered = await registerPwaServiceWorker(
      environment({ serviceWorker: { register } }),
    );

    expect(registered).toBe(true);
    expect(register).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });

  it('fails closed when browser registration is rejected', async () => {
    const registered = await registerPwaServiceWorker(
      environment({
        serviceWorker: {
          register: vi.fn().mockRejectedValue(new Error('registration failed')),
        },
      }),
    );

    expect(registered).toBe(false);
  });
});
