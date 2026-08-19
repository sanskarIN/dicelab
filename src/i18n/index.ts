import { en } from './en';

export type SupportedLocale = 'en';

const catalogs = { en } as const;

export function getMessages(locale: SupportedLocale = 'en') {
  return catalogs[locale];
}

export const messages = getMessages();
