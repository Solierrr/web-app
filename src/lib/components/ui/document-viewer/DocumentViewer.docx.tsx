import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { useTranslation } from "react-i18next";
import Alert from "@@/feedback/alert/Alert";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
export default function DocxPreview({ blob, zoom }: { blob: Blob; zoom: number }) {
  const { t } = useTranslation("reviewPanel");
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let active = true;
    async function render() {
      const container = document.createElement("div");
      const styles = document.createElement("div");
      await renderAsync(blob, container, styles, {
        inWrapper: false,
        ignoreWidth: true,
        ignoreHeight: true,
        useBase64URL: true,
        renderAltChunks: false,
      });
      if (!active) return;
      const target = frame.current?.contentDocument;
      if (!target) throw new Error("Preview unavailable");
      container.querySelectorAll("script, iframe, object, embed").forEach((node) => node.remove());
      container.querySelectorAll("a").forEach((node) => node.removeAttribute("href"));
      container.querySelectorAll("img").forEach((node) => {
        if (!node.src.startsWith("data:") && !node.src.startsWith("blob:")) node.removeAttribute("src");
      });
      const policy = target.createElement("meta");
      policy.httpEquiv = "Content-Security-Policy";
      policy.content = "default-src 'none'; img-src data: blob:; font-src data: blob:; style-src 'unsafe-inline'";
      target.head.replaceChildren(policy);
      target.body.replaceChildren(styles, container);
      target.body.style.margin = "0";
      target.body.style.background = "white";
      setState("ready");
    }
    render().catch(() => {
      if (active) setState("error");
    });
    return () => {
      active = false;
    };
  }, [blob]);
  useEffect(() => {
    const body = frame.current?.contentDocument?.body;
    if (body) body.setAttribute("style", `margin: 0; background: white; zoom: ${zoom}`);
  }, [zoom, state]);
  return (
    <div className="flex flex-col gap-3">
      {state === "loading" && <LogoLoader label={t("loadingFile")} />}
      {state === "error" && <Alert>{t("fileError")}</Alert>}
      <iframe
        ref={frame}
        sandbox="allow-same-origin"
        title={t("docxPreview")}
        className={`min-h-120 w-full rounded-small border-0 bg-white ${state !== "ready" ? "hidden" : ""}`}
      />
    </div>
  );
}
