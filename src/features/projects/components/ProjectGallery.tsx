import { useCallback, useEffect, useRef, useState } from "react";
import Surface from "@@/ui/surface/Surface";
import ImageInput from "@@/ui/image-input/ImageInput";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import TableRowOptions from "@@/layout/operational-page/OperationalTable.actions";
import Alert from "@@/feedback/alert/Alert";
import LogoLoader from "@@/feedback/logo-loader/LogoLoader";
import type { Project, ProjectPhoto } from "../projects.d";
import { projectApi, projectPhotoBlob } from "../projects.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
import { isProjectReadOnly } from "../projects.utils";
export function ProjectImage({ projectId, photo }: { projectId: string; photo: ProjectPhoto }) {
  const ref = useRef<HTMLImageElement>(null);
  const { t } = useProjects();
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let url: string | undefined;
    let active = true;
    projectPhotoBlob(projectId, photo.id, controller.signal)
      .then((blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        if (ref.current) ref.current.src = url;
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [projectId, photo.id]);
  return failed ? (
    <Alert>{t("photoFailed")}</Alert>
  ) : (
    <img ref={ref} alt={photo.name} className="aspect-video w-full rounded-medium bg-input-bg object-contain" />
  );
}
export default function ProjectGallery({ project: p, onChange }: { project: Project; onChange: () => Promise<void> }) {
  const { t } = useProjects();
  const r = useProjectResource(useCallback(() => projectApi.photos(p.id), [p.id]));
  const a = useProjectActions();
  const [files, setFiles] = useState<File[]>([]),
    [error, setError] = useState<string | null>(null);
  const manager = p.canManage && !isProjectReadOnly(p);
  async function upload() {
    const remaining = [...files];
    const ok = await a.execute(async () => {
      while (remaining.length) {
        await projectApi.upload(p.id, remaining[0], false);
        remaining.shift();
        setFiles([...remaining]);
      }
      await r.reload();
      await onChange();
    }, t("feedback.photos"));
    if (!ok) {
      await r.reload().catch(() => undefined);
    }
  }
  return (
    <Surface className="mx-auto w-full lg:w-[85%] p-6">
      <header className="mb-5 flex items-center justify-between">
        <h2 className="font-semi-bold">{t("gallery")}</h2>
        <ToolbarAction icon="refresh" label={t("refresh")} disabled={a.busy} onClick={() => void a.execute(r.reload, t("feedback.refreshed"))} />
      </header>
      {p.canContribute && (
        <div className="mb-6 flex flex-col gap-4">
          <p className="text-operational-muted">{t("photoHelp")}</p>
          <ImageInput
            name="projectPhotos"
            analysis={{ purpose: "product", strictPurpose: false, contextTitle: p.name }}
            files={files}
            onChange={setFiles}
            onError={setError}
            label={t("addPhotos")}
            removeLabel={t("removePhoto")}
            invalidMessage={t("invalidPhoto")}
            summary={files.length ? t("photosSummary", { count: files.length }) : t("noPhotos")}
            error={error}
            disabled={a.busy}
            acceptedTypes={["image/jpeg", "image/png"]}
          />
          {files.length > 0 && (
            <PrimaryButton
              variant="soft"
              content={t("upload")}
              description={t("upload")}
              disabled={a.busy}
              onClick={() => void upload()}
              className="w-fit"
            />
          )}
        </div>
      )}
      {r.error && <Alert>{r.error}</Alert>}
      {!r.data && !r.error && <LogoLoader label={t("gallery")} />}
      {r.data?.length === 0 && <p className="text-operational-muted">{t("photosEmpty")}</p>}
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {r.data?.map((photo) => (
          <li key={photo.id} className="min-w-0 rounded-medium bg-input-bg p-3">
            <ProjectImage projectId={p.id} photo={photo} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="min-w-0 truncate">{photo.cover ? t("cover") : photo.name}</p>
              {manager && (
                <TableRowOptions name={photo.name} disabled={a.busy}>
                  {!photo.cover && (
                    <ToolbarAction
                      icon="image"
                      label={t("makeCover")}
                      onClick={() =>
                        void a.execute(async () => {
                          await projectApi.cover(p.id, photo.id);
                          await r.reload();
                          await onChange();
                        })
                      }
                    />
                  )}
                  <ToolbarAction
                    icon="trash"
                    label={t("removePhoto")}
                    onClick={() =>
                      a.ask({
                        title: t("removePhoto"),
                        message: t("removePhotoMessage"),
                        success: t("feedback.photoRemoved"),
                        action: async () => {
                          await projectApi.removePhoto(p.id, photo.id);
                          await r.reload();
                          await onChange();
                        },
                      })
                    }
                  />
                </TableRowOptions>
              )}
            </div>
          </li>
        ))}
      </ul>
      {a.confirmation}
    </Surface>
  );
}
