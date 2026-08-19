import { BarChart3, Dices, ShieldCheck } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  return (
    <div className="dialog-backdrop onboarding-backdrop">
      <section className="onboarding-dialog" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
        <div className="about-logo" aria-hidden="true">◆</div>
        <p className="eyebrow">Welcome to DiceLab</p>
        <h1 id="onboarding-title">A calmer way to roll.</h1>
        <p className="onboarding-lead">Fast tabletop dice, reproducible tests, and probability tools—designed to work offline from the first roll.</p>
        <div className="onboarding-grid">
          <div><Dices size={22} aria-hidden="true" /><strong>Powerful expressions</strong><span>Use modifiers and keep/drop syntax such as 4d6kh3.</span></div>
          <div><ShieldCheck size={22} aria-hidden="true" /><strong>Private by default</strong><span>No account is required. Everyday data stays on this device.</span></div>
          <div><BarChart3 size={22} aria-hidden="true" /><strong>Understand outcomes</strong><span>Inspect history, histograms, exports, and exact probability distributions.</span></div>
        </div>
        <button type="button" className="primary-button onboarding-button" onClick={onComplete}>Start rolling</button>
        <small>Made by the Sanskar · MIT licensed</small>
      </section>
    </div>
  );
}
