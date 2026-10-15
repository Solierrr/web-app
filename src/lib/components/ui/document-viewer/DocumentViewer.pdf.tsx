import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useTranslation } from "react-i18next";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Alert from "@@/feedback/alert/Alert";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
export default function PdfPreview({ url, zoom }: { url: string; zoom: number }) {
  const { t } = useTranslation("reviewPanel");
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [width, setWidth] = useState(400);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(200, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex min-w-0 flex-col gap-3">
      {pages > 0 && (
        <nav aria-label={t("pdfPages")} className="flex items-center justify-center gap-2">
          <ToolbarAction icon="chevronLeft" label={t("previousPage")} disabled={page <= 1} onClick={() => setPage(page - 1)} />
          <span className="text-body tabular-nums">{t("page", { page, total: pages })}</span>
          <ToolbarAction icon="chevronRight" label={t("nextPage")} disabled={page >= pages} onClick={() => setPage(page + 1)} />
        </nav>
      )}
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
        loading={<LogoLoader label={t("loadingFile")} />}
        error={<Alert>{t("fileError")}</Alert>}>
        <Page pageNumber={page} width={width * zoom} loading={<LogoLoader label={t("loadingFile")} />} />
      </Document>
    </div>
  );
}
