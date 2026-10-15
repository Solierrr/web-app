import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import Alert from "@@/feedback/alert/Alert";
import Icon from "@@/ui/icon/Icon";
import type { DocumentViewerProps } from "./DocumentViewer.d";
const PdfPreview = lazy(() => import("./DocumentViewer.pdf"));
const DocxPreview = lazy(() => import("./DocumentViewer.docx"));
export default function DocumentViewer(props: DocumentViewerProps) {
  return <DocumentContent key={props.document.id} {...props} />;
}
function DocumentContent({ document: file, load }: DocumentViewerProps) {
  const { t } = useTranslation("reviewPanel");
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    let active = true;
    let url = "";
    load(file.id)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setResult({ blob, url });
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id, load, attempt]);
  const type = result?.blob.type || file.contentType || "";
  const pdf = type === "application/pdf";
  const docx = type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const image = ["image/jpeg", "image/png", "image/webp"].includes(type);
  return (
    <section aria-label={file.name} className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-medium bg-white px-3 py-2">
        <span className="min-w-0 flex-1 break-words text-body">{file.name}</span>
        <div className="flex items-center gap-1">
          {(pdf || image || docx) && (
            <>
              <ToolbarAction
                icon="zoomOut"
                label={t("zoomOut")}
                disabled={zoom <= 0.5}
                onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))}
              />
              <span className="text-body tabular-nums">{Math.round(zoom * 100)}%</span>
              <ToolbarAction icon="zoomIn" label={t("zoomIn")} disabled={zoom >= 2} onClick={() => setZoom((value) => Math.min(2, value + 0.25))} />
            </>
          )}
          {result && (
            <ToolbarAction
              icon="download"
              label={t("download")}
              onClick={() => {
                const link = window.document.createElement("a");
                link.href = result.url;
                link.download = file.name;
                link.click();
              }}
            />
          )}
        </div>
      </div>
      <div className="min-h-64 min-w-0 flex-1 overflow-auto rounded-medium bg-input-bg p-3">
        {error ? (
          <div className="flex flex-col gap-3">
            <Alert>{t("fileError")}</Alert>
            <ToolbarAction
              icon="refresh"
              label={t("retry")}
              content={t("retry")}
              onClick={() => {
                setError(false);
                setResult(null);
                setAttempt((value) => value + 1);
              }}
            />
          </div>
        ) : !result ? (
          <div className="flex min-h-64 items-center justify-center">
            <LogoLoader label={t("loadingFile")} />
          </div>
        ) : (
          <Suspense fallback={<LogoLoader label={t("loadingFile")} />}>
            {pdf ? (
              <PdfPreview url={result.url} zoom={zoom} />
            ) : docx ? (
              <DocxPreview blob={result.blob} zoom={zoom} />
            ) : image ? (
              <img
                src={result.url}
                alt={file.name}
                className="mx-auto max-w-none rounded-small bg-white object-contain"
                style={{ width: `${zoom * 100}%` }}
              />
            ) : (
              <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
                <Icon name="document" size={32} color="var(--color-input-icon)" />
                <h3 className="text-body font-semi-bold">{t("unsupported")}</h3>
                <p className="text-operational-muted">{t("unsupportedHelp")}</p>
              </div>
            )}
          </Suspense>
        )}
      </div>
    </section>
  );
}
