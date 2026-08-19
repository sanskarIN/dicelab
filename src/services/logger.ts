export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Readonly<Record<string, unknown>>;

export interface SafeLogRecord {
  timestamp: string;
  level: LogLevel;
  event: string;
  context?: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERN =
  /(password|passphrase|token|secret|authorization|cookie|session|seed|email|name|content|expression|history|preset|backup|file|payload|body|message|stack)/i;
const MAX_DEPTH = 4;
const MAX_ARRAY_ITEMS = 20;
const MAX_STRING_LENGTH = 160;
const REDACTED = '[redacted]';

export const logger = {
  debug(event: string, context?: LogContext) {
    emit('debug', event, context);
  },
  info(event: string, context?: LogContext) {
    emit('info', event, context);
  },
  warn(event: string, context?: LogContext) {
    emit('warn', event, context);
  },
  error(event: string, context?: LogContext) {
    emit('error', event, context);
  },
};

export function createSafeLogRecord(level: LogLevel, event: string, context?: LogContext): SafeLogRecord {
  const normalizedEvent = sanitizeEvent(event);
  const record: SafeLogRecord = {
    timestamp: new Date().toISOString(),
    level,
    event: normalizedEvent,
  };
  if (context && Object.keys(context).length > 0) {
    record.context = redactRecord(context, 0);
  }
  return record;
}

function emit(level: LogLevel, event: string, context?: LogContext): void {
  const record = createSafeLogRecord(level, event, context);
  const consoleMethod = level === 'debug' ? console.debug : level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
  consoleMethod(record);
}

function redactRecord(value: Record<string, unknown>, depth: number): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redactValue(item, depth + 1);
  }
  return output;
}

function redactValue(value: unknown, depth: number): unknown {
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return truncate(value);
  if (typeof value === 'bigint') return value.toString();
  if (typeof value === 'undefined') return undefined;
  if (value instanceof Error) return { errorType: truncate(value.name || 'Error') };
  if (depth > MAX_DEPTH) return '[truncated-depth]';
  if (Array.isArray(value)) return value.slice(0, MAX_ARRAY_ITEMS).map((item) => redactValue(item, depth + 1));
  if (typeof value === 'object') return redactRecord(value as Record<string, unknown>, depth);
  return `[${typeof value}]`;
}

function sanitizeEvent(event: string): string {
  const normalized = event.trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '-');
  return truncate(normalized || 'unknown-event');
}

function truncate(value: string): string {
  return value.length <= MAX_STRING_LENGTH ? value : `${value.slice(0, MAX_STRING_LENGTH)}…`;
}
