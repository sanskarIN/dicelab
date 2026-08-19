import type { LocalePreference } from '../domain/types';
import { en, type MessageCatalog } from './en';
import { hi } from './hi';

export type SupportedLocale = LocalePreference;

const catalogs: Record<SupportedLocale, MessageCatalog> = { en, hi };

export function getMessages(locale: SupportedLocale = 'en'): MessageCatalog {
  return catalogs[locale];
}

export let messages = getMessages();

export function setLocale(locale: SupportedLocale): MessageCatalog {
  messages = getMessages(locale);
  return messages;
}
