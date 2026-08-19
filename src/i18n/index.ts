import type { LocalePreference } from '../domain/types';
import { en, type MessageCatalog } from './en';
import { hi } from './hi';

export type SupportedLocale = LocalePreference;

const catalogs: Record<SupportedLocale, MessageCatalog> = { en, hi };

let activeLocale: SupportedLocale = 'en';

export function getMessages(locale: SupportedLocale = 'en'): MessageCatalog {
  return catalogs[locale];
}

export function getActiveLocale(): SupportedLocale {
  return activeLocale;
}

export let messages = getMessages(activeLocale);

export function setLocale(locale: SupportedLocale): MessageCatalog {
  activeLocale = locale;
  messages = getMessages(locale);
  return messages;
}
