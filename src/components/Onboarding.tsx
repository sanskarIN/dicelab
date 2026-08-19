import { BarChart3, Dices, ShieldCheck } from 'lucide-react';
import { copy } from '../i18n';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="dialog-backdrop onboarding-backdrop">
      <section className="onboarding-dialog" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div className="about-logo" aria-hidden="true">
          ◆
        </div>
        <p className="eyebrow">{copy.onboarding.eyebrow}</p>
        <h1 id="onboarding-title">{copy.onboarding.title}</h1>
        <p className="onboarding-lead">{copy.onboarding.lead}</p>
        <div className="onboarding-grid">
          <div>
            <Dices size={22} aria-hidden="true" />
            <strong>{copy.onboarding.expressionsTitle}</strong>
            <span>{copy.onboarding.expressionsDescription}</span>
          </div>
          <div>
            <ShieldCheck size={22} aria-hidden="true" />
            <strong>{copy.onboarding.privacyTitle}</strong>
            <span>{copy.onboarding.privacyDescription}</span>
          </div>
          <div>
            <BarChart3 size={22} aria-hidden="true" />
            <strong>{copy.onboarding.outcomesTitle}</strong>
            <span>{copy.onboarding.outcomesDescription}</span>
          </div>
        </div>
        <button type="button" className="primary-button onboarding-button" onClick={onComplete}>
          {copy.onboarding.start}
        </button>
        <small>{copy.onboarding.footer}</small>
      </section>
    </div>
  );
}
