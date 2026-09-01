import { useEffect } from "react";
import { AppRoutes } from "./routes/AppRoutes";
import ErrorBoundary from "@/config/error/boundary/ErrorBoundary";

const SCROLL_IDLE_DELAY_MS = 800;

export default function App() {
  useEffect(() => {
    const root = document.scrollingElement ?? document.documentElement;
    let timeout: ReturnType<typeof setTimeout>;

    function handleScroll() {
      root.classList.add("scroll-active");

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        root.classList.remove("scroll-active");
      }, SCROLL_IDLE_DELAY_MS);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
