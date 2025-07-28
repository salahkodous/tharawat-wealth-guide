import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { CurrencyProvider } from '@/hooks/useCurrency'

createRoot(document.getElementById("root")!).render(
  <CurrencyProvider>
    <App />
  </CurrencyProvider>
);
