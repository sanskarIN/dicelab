import { Coffee, ExternalLink, Github, Heart, Mail, ShieldCheck } from 'lucide-react';
import {
  APP_CREDIT,
  APP_NAME,
  APP_VERSION,
  BMC_URL,
  BUSINESS_EMAILS,
  PRIVACY_URL,
  PROJECT_URL,
  SUPPORT_EMAIL,
} from '../config/app';
import { messages } from '../i18n';

export function AboutPanel() {
  return (
    <section className="view-stack" aria-labelledby="about-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{messages.about.eyebrow}</p>
          <h1 id="about-heading">{messages.navigation.about} {APP_NAME}</h1>
          <p>{messages.about.intro}</p>
        </div>
      </header>

      <section className="about-hero panel">
        <div className="about-logo" aria-hidden="true">
          ◆
        </div>
        <div>
          <span className="version-chip">Version {APP_VERSION}</span>
          <h2>{APP_NAME}</h2>
          <p>{messages.about.productBody}</p>
          <strong className="made-by">{APP_CREDIT}</strong>
        </div>
      </section>

      <div className="about-grid">
        <section className="panel about-card">
          <ShieldCheck size={22} aria-hidden="true" />
          <h2>{messages.about.privacyHeading}</h2>
          <p>{messages.about.privacyBody}</p>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
            {messages.about.privacyLink} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Github size={22} aria-hidden="true" />
          <h2>{messages.about.openSourceHeading}</h2>
          <p>{messages.about.openSourceBody}</p>
          <a href={PROJECT_URL} target="_blank" rel="noreferrer">
            {messages.about.repositoryLink} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Mail size={22} aria-hidden="true" />
          <h2>{messages.about.contactHeading}</h2>
          <p>
            Business: {BUSINESS_EMAILS[0]}
            <br />
            Business: {BUSINESS_EMAILS[1]}
            <br />
            Support: {SUPPORT_EMAIL}
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>
            {messages.about.supportLink} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Coffee size={22} aria-hidden="true" />
          <h2>{messages.about.fundingHeading}</h2>
          <p>{messages.about.fundingBody}</p>
          <a href={BMC_URL} target="_blank" rel="noreferrer">
            {messages.about.fundingLink} <Heart size={14} aria-hidden="true" />
          </a>
        </section>
      </div>
    </section>
  );
}
