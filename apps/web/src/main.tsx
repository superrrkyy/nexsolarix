import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('NexSolarix root element is missing.');

createRoot(rootElement).render(<StrictMode><App /></StrictMode>);

if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // The atlas remains usable online if offline registration is unavailable.
    });
  });
}
