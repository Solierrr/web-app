import { useEffect, useRef, useState } from "react";
import { analyzeImage } from "@/lib/shared/accessibility/aiAccessibility.service";
import type { ImageAnalysisOptions, ImageBlockReason } from "@/lib/shared/accessibility/aiAccessibility";

export interface FileAnalysis {
  suggested: boolean;
  failure?: string;
  altText: string;
}

export interface BlockedFile {
  file: File;
  reason: ImageBlockReason;
}

export function fileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function useImageAnalysis(analysis?: ImageAnalysisOptions) {
  const [pending, setPending] = useState(0);
  const [results, setResults] = useState<Record<string, FileAnalysis>>({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function screen(selected: File[]): Promise<{ accepted: File[]; blocked: BlockedFile[] }> {
    if (!analysis) return { accepted: selected, blocked: [] };
    setPending((current) => current + selected.length);
    const verdicts = await Promise.all(selected.map((file) => analyzeImage(file, analysis)));
    if (!mounted.current) return { accepted: [], blocked: [] };
    setPending((current) => current - selected.length);
    const accepted: File[] = [];
    const blocked: BlockedFile[] = [];
    const entries: Record<string, FileAnalysis> = {};
    selected.forEach((file, index) => {
      const verdict = verdicts[index];
      if (verdict.status === "blocked") {
        blocked.push({ file, reason: verdict.reason });
        return;
      }
      accepted.push(file);
      entries[fileKey(file)] =
        verdict.status === "suggested" ? { suggested: true, altText: verdict.altText } : { suggested: false, failure: verdict.failure, altText: "" };
    });
    setResults((current) => ({ ...current, ...entries }));
    return { accepted, blocked };
  }

  function setAltText(file: File, altText: string) {
    const key = fileKey(file);
    setResults((current) => (current[key] ? { ...current, [key]: { ...current[key], altText } } : current));
  }

  return { analyzing: pending > 0, results, screen, setAltText };
}
