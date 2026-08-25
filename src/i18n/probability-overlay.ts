import type { SupportedLocale } from './index';

interface ProbabilityOverlayMessages {
  heading: string;
  label: (leftExpression: string, rightExpression: string) => string;
  truncated: (visible: number, total: number) => string;
}

const overlayMessages: Record<SupportedLocale, ProbabilityOverlayMessages> = {
  en: {
    heading: 'Distribution overlay',
    label: (leftExpression, rightExpression) =>
      `Distribution overlay for A ${leftExpression} and B ${rightExpression}; each row compares the exact chance at the same total.`,
    truncated: (visible, total) =>
      `Showing the first ${visible} of ${total} comparison totals to keep the overlay responsive.`,
  },
  hi: {
    heading: 'वितरण ओवरले',
    label: (leftExpression, rightExpression) =>
      `A ${leftExpression} और B ${rightExpression} का वितरण ओवरले; हर पंक्ति समान कुल पर सटीक संभावना की तुलना करती है।`,
    truncated: (visible, total) =>
      `ओवरले को प्रतिक्रियाशील रखने के लिए ${total} तुलना कुल में से पहले ${visible} दिखाए जा रहे हैं।`,
  },
};

export function getProbabilityOverlayMessages(locale: SupportedLocale): ProbabilityOverlayMessages {
  return overlayMessages[locale];
}
