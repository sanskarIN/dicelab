import { Coffee, ExternalLink, Github, Heart, Mail, ShieldCheck } from 'lucide-react';
import { copy } from '../i18n';

export function AboutPanel() {
  const contactLines = copy.about.contactDescription.split('\n');

  return (
    <section className="view-stack" aria-labelledby="about-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">{copy.about.eyebrow}</p>
          <h1 id="about-heading">{copy.about.title}</h1>
          <p>{copy.about.description}</p>
        </div>
      </header>

      <section className="about-hero panel">
        <div className="about-logo" aria-hidden="true">
          ◆
        </div>
        <div>
          <span className="version-chip">{copy.about.version}</span>
          <h2>{copy.about.product}</h2>
          <p>{copy.about.productDescription}</p>
          <strong className="made-by">{copy.about.credit}</strong>
        </div>
      </section>

      <div className="about-grid">
        <section className="panel about-card">
          <ShieldCheck size={22} aria-hidden="true" />
          <h2>{copy.about.privacyTitle}</h2>
          <p>{copy.about.privacyDescription}</p>
          <a href="https://github.com/sanskarIN/dicelab/blob/main/PRIVACY.md" target="_blank" rel="noreferrer">
            {copy.about.readPrivacy} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Github size={22} aria-hidden="true" />
          <h2>{copy.about.openSourceTitle}</h2>
          <p>{copy.about.openSourceDescription}</p>
          <a href="https://github.com/sanskarIN/dicelab" target="_blank" rel="noreferrer">
            {copy.about.viewRepository} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Mail size={22} aria-hidden="true" />
          <h2>{copy.about.contactTitle}</h2>
          <p>
            {contactLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < contactLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          <a href="mailto:supportramsandesh@gmail.com">
            {copy.about.emailSupport} <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Coffee size={22} aria-hidden="true" />
          <h2>{copy.about.supportTitle}</h2>
          <p>{copy.about.supportDescription}</p>
          <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">
            {copy.about.buyMeACoffee} <Heart size={14} aria-hidden="true" />
          </a>
        </section>
      </div>
    </section>
  );
}
