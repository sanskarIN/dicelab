import { logger } from './logger';
import { isTauriRuntime } from './runtime';

interface ServiceWorkerRegistrar {
  register(scriptUrl: string, options?: { scope?: string }): Promise<unknown>;
}

export interface PwaEnvironment {
  production: boolean;
  tauri: boolean;
  protocol: string;
  hostname: string;
  serviceWorker?: ServiceWorkerRegistrar;
}

const LOCALHOST_NAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isServiceWorkerOriginAllowed(protocol: string, hostname: string): boolean {
  return protocol === 'https:' || (protocol === 'http:' && LOCALHOST_NAMES.has(hostname));
}

export function canRegisterPwaServiceWorker(environment: PwaEnvironment): boolean {
  return (
    environment.production &&
    !environment.tauri &&
    Boolean(environment.serviceWorker) &&
    isServiceWorkerOriginAllowed(environment.protocol, environment.hostname)
  );
}

export async function registerPwaServiceWorker(
  environment: PwaEnvironment = getCurrentPwaEnvironment(),
): Promise<boolean> {
  if (!canRegisterPwaServiceWorker(environment) || !environment.serviceWorker) return false;

  try {
    await environment.serviceWorker.register('/sw.js', { scope: '/' });
    logger.info('pwa.service_worker_registered');
    return true;
  } catch (cause) {
    logger.warn('pwa.service_worker_registration_failed', {
      errorType: cause instanceof Error ? cause.name : typeof cause,
    });
    return false;
  }
}

function getCurrentPwaEnvironment(): PwaEnvironment {
  const serviceWorker =
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      ? {
          register: (scriptUrl: string, options?: { scope?: string }) =>
            navigator.serviceWorker.register(scriptUrl, options),
        }
      : undefined;

  return {
    production: import.meta.env.PROD,
    tauri: isTauriRuntime(),
    protocol: typeof window === 'undefined' ? '' : window.location.protocol,
    hostname: typeof window === 'undefined' ? '' : window.location.hostname,
    serviceWorker,
  };
}
