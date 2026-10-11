import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./config/i18n/internationalization";
import App from "./App.tsx";
import Toast from "@@/feedback/toast/Toast";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
    <Toast />
  </BrowserRouter>,
);
