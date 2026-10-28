import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ImageInput from "@@/ui/image-input/ImageInput";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import { httpJson } from "@/lib/shared/http/http.service";
import { API_CORE_URL } from "@/lib/shared/http/apiCore.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";

export default function ProfilePhotoEditor({
  id,
  entity,
  onChange,
  canUpload = true,
  canRemove = true,
}: {
  canUpload?: boolean;
  canRemove?: boolean;
  id: string;
  entity: "user" | "company";
  onChange: (type: "PROFILE" | "BANNER", url: string | null) => void;
}) {
  const { t } = useTranslation("profile", { keyPrefix: "photos" });
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<Record<string, File[]>>({ PROFILE: [], BANNER: [] });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  const applyPhoto = useEffectEvent(onChange);
  useEffect(() => {
    let active = true;
    const loadRevision = revision.current;
    if (isAlwaysMockMode()) {
      for (const type of ["PROFILE", "BANNER"] as const) {
        const stored = sessionStorage.getItem(`marketplace.mock.photo.${entity}.${id}.${type}`);
        if (stored) applyPhoto(type, JSON.parse(stored));
      }
    } else {
      httpJson<{ type: "PROFILE" | "BANNER"; url: string }[]>(`${API_CORE_URL}/${entity}-photos/${entity}/${encodeURIComponent(id)}`, {
        service: "profile",
        operation: "getPhotos",
        errorMessage: t("error"),
      })
        .then((photos) => {
          if (active && revision.current === loadRevision) for (const photo of photos) applyPhoto(photo.type, photo.url);
        })
        .catch(() => undefined);
    }
    return () => {
      active = false;
    };
  }, [entity, id, t]);
  async function save(type: "PROFILE" | "BANNER", remove = false) {
    if ((remove ? !canRemove : !canUpload) || busy || (!remove && !files[type][0])) throw new Error(t("error"));
    revision.current += 1;
    setBusy(true);
    setError(null);
    try {
      let url: string | null = null;
      if (isAlwaysMockMode()) {
        if (!remove)
          url = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(files[type][0]);
          });
        sessionStorage.setItem(`marketplace.mock.photo.${entity}.${id}.${type}`, JSON.stringify(url));
      } else {
        const body = new FormData();
        if (!remove) body.set("file", files[type][0]);
        const photo = await httpJson<{ url: string } | undefined>(
          `${API_CORE_URL}/${entity}-photos/${entity}/${encodeURIComponent(id)}/type/${type}`,
          {
            service: "profile",
            operation: "savePhoto",
            method: remove ? "DELETE" : "PUT",
            body: remove ? undefined : body,
            errorMessage: t("error"),
          },
        );
        url = photo?.url ?? null;
      }
      onChange(type, url);
      setFiles((current) => ({ ...current, [type]: [] }));
    } catch {
      setError(t("error"));
      if (remove) throw new Error(t("error"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="flex flex-col gap-4">
      <ToolbarAction icon="image" label={t("title")} content={t("title")} aria-expanded={open} onClick={() => setOpen(!open)} className="w-fit" />
      {open && (
        <div className="grid gap-6 rounded-surface bg-operational-surface p-5 sm:grid-cols-2">
          {(["PROFILE", "BANNER"] as const).map((type) => (
            <div key={type} className="flex flex-col gap-3">
              <h3 className="text-label">{t(type)}</h3>
              {canUpload && (
                <ImageInput
                  name={type}
                  label={t(type)}
                  files={files[type]}
                  onChange={(selected) => setFiles((current) => ({ ...current, [type]: selected }))}
                  onError={setError}
                  removeLabel={t("remove")}
                  invalidMessage={t("invalid")}
                  summary={t("limits")}
                  multiple={false}
                  maxBytes={5 * 1024 * 1024}
                  disabled={busy}
                />
              )}
              <div className="flex items-center gap-3">
                {canUpload && (
                  <PrimaryButton content={t("save")} description={t("save")} disabled={busy || !files[type].length} onClick={() => void save(type)} />
                )}
                {canRemove && (
                  <ConfirmedAction
                    label={t("remove")}
                    name={t(type)}
                    onConfirm={async () => {
                      await save(type, true);
                    }}
                  />
                )}
              </div>
            </div>
          ))}
          {error && <p role="alert">{error}</p>}
        </div>
      )}
    </section>
  );
}
