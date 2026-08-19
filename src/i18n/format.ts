import { getActiveLocale, type SupportedLocale } from './index';

const INTL_LOCALES: Record<SupportedLocale, string> = {
  en: 'en-US',
  hi: 'hi-IN',
};

export function getIntlLocale(locale: SupportedLocale = getActiveLocale()): string {
  return INTL_LOCALES[locale];
}

export function formatInteger(value: number, locale: SupportedLocale = getActiveLocale()): string {
  return new Intl.NumberFormat(getIntlLocale(locale), { maximumFractionDigits: 0 }).format(value);
}

export function formatDecimal(
  value: number,
  maximumFractionDigits: number,
  locale: SupportedLocale = getActiveLocale(),
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatFixedDecimal(
  value: number,
  fractionDigits: number,
  locale: SupportedLocale = getActiveLocale(),
): string {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDateTime(value: string | Date, locale: SupportedLocale = getActiveLocale()): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatTime(value: string | Date, locale: SupportedLocale = getActiveLocale()): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
