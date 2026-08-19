import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { messages } from '../i18n';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Do not emit raw exception contents: application state may contain user-controlled text.
    console.error('DiceLab interface recovery boundary activated.');
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="main-content" id="main-content">
        <section className="panel empty-state large" role="alert" aria-labelledby="recovery-heading">
          <AlertTriangle size={36} aria-hidden="true" />
          <p className="eyebrow">{messages.errorBoundary.eyebrow}</p>
          <h1 id="recovery-heading">{messages.errorBoundary.heading}</h1>
          <p>{messages.errorBoundary.body}</p>
          <button type="button" className="primary-button" onClick={() => window.location.reload()}>
            <RotateCcw size={17} aria-hidden="true" /> {messages.errorBoundary.reload}
          </button>
        </section>
      </main>
    );
  }
}
