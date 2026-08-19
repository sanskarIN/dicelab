import { en, type MessageCatalog } from './en';

export type SupportedLocale = 'en';

const catalogs: Record<SupportedLocale, MessageCatalog> = { en };

export function getMessages(locale: SupportedLocale = 'en'): MessageCatalog {
  return catalogs[locale];
}

export const messages = getMessages();
