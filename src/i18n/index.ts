import { en, type MessageCatalog } from './en';
import { hi } from './hi';

export type SupportedLocale = 'en' | 'hi';

const catalogs: Record<SupportedLocale, MessageCatalog> = { en, hi };

export function getMessages(locale: SupportedLocale = 'en'): MessageCatalog {
  return catalogs[locale];
}

export const messages = getMessages();
