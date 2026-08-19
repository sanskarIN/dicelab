type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type SafePrimitive = string | number | boolean | null;
type LogContext = Record<string, SafePrimitive | undefined>;

const SENSITIVE_KEY_PATTERN = /(authorization|cookie|email|password|secret|seed|token|credential|key)/i;
const MAX_EVENT_LENGTH = 80;
const MAX_VALUE_LENGTH = 160;

interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  event: string;
  context?: Record<string, SafePrimitive>;
}

export function logEvent(level: LogLevel, event: string, context: LogContext = {}): void {
  const normalizedEvent = sanitizeEvent(event);
  const safeContext = sanitizeContext(context);
  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    event: normalizedEvent,
    ...(Object.keys(safeContext).length > 0 ? { context: safeContext } : {}),
  };

  if (level === 'debug' && !import.meta.env.DEV) return;

  const serialized = JSON.stringify(entry);
  if (level === 'error') {
    console.error(serialized);
  } else if (level === 'warn') {
    console.warn(serialized);
  } else if (level === 'info') {
    console.info(serialized);
  } else {
    console.debug(serialized);
  }
}

export function logError(event: string, error: unknown, context: LogContext = {}): void {
  logEvent('error', event, {
    ...context,
    errorName: error instanceof Error ? error.name : 'UnknownError',
  });
}

function sanitizeEvent(event: string): string {
  const normalized = event
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, '_')
    .slice(0, MAX_EVENT_LENGTH);
  return normalized || 'unknown_event';
}

function sanitizeContext(context: LogContext): Record<string, SafePrimitive> {
  const safe: Record<string, SafePrimitive> = {};
  for (const [key, rawValue] of Object.entries(context)) {
    if (rawValue === undefined) continue;
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      safe[key] = '[REDACTED]';
      continue;
    }
    if (typeof rawValue === 'string') {
      safe[key] = rawValue.slice(0, MAX_VALUE_LENGTH);
    } else {
      safe[key] = rawValue;
    }
  }
  return safe;
}
