import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import DemoBar from './components/DemoBar';
import { SettingsProvider } from './lib/settings';
import { AuthProvider } from './lib/auth';
import './styles.css';

const DEMO = import.meta.env.MODE === 'demo';
const Router = DEMO ? MemoryRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Router>
        <SettingsProvider>
          <AuthProvider>
            {DEMO && <DemoBar />}
            <App />
          </AuthProvider>
        </SettingsProvider>
      </Router>
    </HelmetProvider>
  </React.StrictMode>
);
