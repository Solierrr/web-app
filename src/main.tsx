import { createRoot }    from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import './index.css';
import './config/locales/internationalization';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
