import { Buffer } from 'buffer';
// Polyfill Buffer for the browser
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window;
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
