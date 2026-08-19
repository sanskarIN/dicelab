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

export function AboutPanel() {
  return (
    <section className="view-stack" aria-labelledby="about-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">Project information</p>
          <h1 id="about-heading">About {APP_NAME}</h1>
          <p>A focused, offline-first dice studio for tabletop play, testing, teaching, and probability exploration.</p>
        </div>
      </header>

      <section className="about-hero panel">
        <div className="about-logo" aria-hidden="true">
          ◆
        </div>
        <div>
          <span className="version-chip">Version {APP_VERSION}</span>
          <h2>{APP_NAME}</h2>
          <p>Open-source Rust + Tauri + TypeScript software. Fully usable without an account, cloud service, or donation.</p>
          <strong className="made-by">{APP_CREDIT}</strong>
        </div>
      </section>

      <div className="about-grid">
        <section className="panel about-card">
          <ShieldCheck size={22} aria-hidden="true" />
          <h2>Privacy by default</h2>
          <p>Roll history, presets, and settings remain in local application/browser storage unless you explicitly export them.</p>
          <a href={PRIVACY_URL} target="_blank" rel="noreferrer">
            Read privacy policy <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Github size={22} aria-hidden="true" />
          <h2>Open source</h2>
          <p>DiceLab is released under the MIT License. Issues, pull requests, and thoughtful improvements are welcome.</p>
          <a href={PROJECT_URL} target="_blank" rel="noreferrer">
            View repository <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Mail size={22} aria-hidden="true" />
          <h2>Contact & support</h2>
          <p>
            Business: {BUSINESS_EMAILS[0]}
            <br />
            Business: {BUSINESS_EMAILS[1]}
            <br />
            Support: {SUPPORT_EMAIL}
          </p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>
            Email support <ExternalLink size={14} aria-hidden="true" />
          </a>
        </section>
        <section className="panel about-card">
          <Coffee size={22} aria-hidden="true" />
          <h2>Support the project</h2>
          <p>DiceLab never gates features behind donations. If it helps you, optional support is appreciated.</p>
          <a href={BMC_URL} target="_blank" rel="noreferrer">
            Buy Me a Coffee <Heart size={14} aria-hidden="true" />
          </a>
        </section>
      </div>
    </section>
  );
}
