import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { notify } from "@@/feedback/toast/Toast.utils";
import { projectError } from "./projects.utils";
import Confirmation from "@@/overlay/confirmation/Confirmation";
export function useProjects() {
  const { lang: code } = useParams();
  const lang = isSupportedLanguage(code) ? code : DEFAULT;
  const { t } = useTranslation("saas", { keyPrefix: "projects" });
  return {
    lang,
    t,
    date: (value?: string | null) =>
      value ? new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "",
  };
}
export function useProjectResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState<string | null>(null);
  const { t } = useProjects();
  const reload = useCallback(async () => {
    const result = await loader();
    setData(result);
    setError(null);
    return result;
  }, [loader]);
  useEffect(() => {
    let active = true;
    loader()
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(projectError(e, t("feedback.failed")));
      });
    return () => {
      active = false;
    };
  }, [loader, t]);
  return { data, error, reload };
}
interface Decision {
  title: string;
  message: string;
  action: () => Promise<unknown>;
  success?: string;
}
export function useProjectActions() {
  const { t } = useProjects();
  const [busy, setBusy] = useState(false),
    [decision, setDecision] = useState<Decision | null>(null);
  async function execute(action: () => Promise<unknown>, success = t("feedback.updated")) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      notify(success);
      setDecision(null);
      return true;
    } catch (e) {
      notify(projectError(e, t("feedback.failed")));
      return false;
    } finally {
      setBusy(false);
    }
  }
  return {
    busy,
    execute,
    ask: setDecision,
    confirmation: decision ? (
      <Confirmation
        title={decision.title}
        message={decision.message}
        busy={busy}
        onCancel={() => setDecision(null)}
        onConfirm={() => void execute(decision.action, decision.success)}
      />
    ) : null,
  };
}
