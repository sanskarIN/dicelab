import { BarChart3, Dices, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import { messages } from '../i18n';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => startButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  const containFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    startButtonRef.current?.focus();
  };

  return (
    <div className="dialog-backdrop onboarding-backdrop">
      <section
        className="onboarding-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-description"
        onKeyDown={containFocus}
      >
        <div className="about-logo" aria-hidden="true">
          ◆
        </div>
        <p className="eyebrow">{messages.onboarding.eyebrow}</p>
        <h1 id="onboarding-title">{messages.onboarding.heading}</h1>
        <p id="onboarding-description" className="onboarding-lead">
          {messages.onboarding.lead}
        </p>
        <div className="onboarding-grid">
          <div>
            <Dices size={22} aria-hidden="true" />
            <strong>{messages.onboarding.expressionsHeading}</strong>
            <span>{messages.onboarding.expressionsBody}</span>
          </div>
          <div>
            <ShieldCheck size={22} aria-hidden="true" />
            <strong>{messages.onboarding.privacyHeading}</strong>
            <span>{messages.onboarding.privacyBody}</span>
          </div>
          <div>
            <BarChart3 size={22} aria-hidden="true" />
            <strong>{messages.onboarding.outcomesHeading}</strong>
            <span>{messages.onboarding.outcomesBody}</span>
          </div>
        </div>
        <button
          ref={startButtonRef}
          type="button"
          className="primary-button onboarding-button"
          onClick={onComplete}
        >
          {messages.onboarding.start}
        </button>
        <small>{messages.onboarding.footer}</small>
      </section>
    </div>
  );
}
