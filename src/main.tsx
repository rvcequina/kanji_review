import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { SRSProvider } from './context/SRSProvider';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <SRSProvider>
      <App />
    </SRSProvider>
  </StrictMode>,
);
