import { Coffee, ExternalLink, Github, Heart, Mail, ShieldCheck } from 'lucide-react';

export function AboutPanel() {
  return (
    <section className="view-stack" aria-labelledby="about-heading">
      <header className="view-header">
        <div>
          <p className="eyebrow">Project information</p>
          <h1 id="about-heading">About DiceLab</h1>
          <p>A focused, offline-first dice studio for tabletop play, testing, teaching, and probability exploration.</p>
        </div>
      </header>

      <section className="about-hero panel">
        <div className="about-logo" aria-hidden="true">◆</div>
        <div>
          <span className="version-chip">Version 0.1.0</span>
          <h2>DiceLab</h2>
          <p>Open-source Rust + Tauri + TypeScript software. Fully usable without an account, cloud service, or donation.</p>
          <strong className="made-by">Made by the Sanskar</strong>
        </div>
      </section>

      <div className="about-grid">
        <section className="panel about-card">
          <ShieldCheck size={22} aria-hidden="true" />
          <h2>Privacy by default</h2>
          <p>Roll history, presets, and settings remain in local application/browser storage unless you explicitly export them.</p>
          <a href="https://github.com/sanskarIN/dicelab/blob/main/PRIVACY.md" target="_blank" rel="noreferrer">Read privacy policy <ExternalLink size={14} aria-hidden="true" /></a>
        </section>
        <section className="panel about-card">
          <Github size={22} aria-hidden="true" />
          <h2>Open source</h2>
          <p>DiceLab is released under the MIT License. Issues, pull requests, and thoughtful improvements are welcome.</p>
          <a href="https://github.com/sanskarIN/dicelab" target="_blank" rel="noreferrer">View repository <ExternalLink size={14} aria-hidden="true" /></a>
        </section>
        <section className="panel about-card">
          <Mail size={22} aria-hidden="true" />
          <h2>Contact & support</h2>
          <p>Business: sanskarin@outlook.in<br />Business: sanskarin.business@gmail.com<br />Support: supportramsandesh@gmail.com</p>
          <a href="mailto:supportramsandesh@gmail.com">Email support <ExternalLink size={14} aria-hidden="true" /></a>
        </section>
        <section className="panel about-card">
          <Coffee size={22} aria-hidden="true" />
          <h2>Support the project</h2>
          <p>DiceLab never gates features behind donations. If it helps you, optional support is appreciated.</p>
          <a href="https://buymeacoffee.com/sanskarIN" target="_blank" rel="noreferrer">Buy Me a Coffee <Heart size={14} aria-hidden="true" /></a>
        </section>
      </div>
    </section>
  );
}
