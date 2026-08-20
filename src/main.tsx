import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { registerPwaServiceWorker } from './services/pwa';
import './styles.css';
import './mobile.css';

const root = document.getElementById('root');
if (!root) throw new Error('DiceLab root element was not found.');

createRoot(root).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);

void registerPwaServiceWorker();
