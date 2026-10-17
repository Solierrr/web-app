import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { routePaths } from "@/config/i18n/paths";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalDetails, { DetailField, DetailSection } from "@@/layout/operational-page/OperationalDetails";
import Breadcrumbs from "@@/ui/breadcrumbs/Breadcrumbs";
import Switcher from "@@/ui/switcher/Switcher";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import TableRowOptions from "@@/layout/operational-page/OperationalTable.actions";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Alert from "@@/feedback/alert/Alert";
import { projectApi } from "../projects.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
import { isProjectReadOnly } from "../projects.utils";
import ProjectStatus from "../components/ProjectStatus";
import ProjectMembers from "../components/ProjectMembers";
import ProjectAgenda from "../components/ProjectAgenda";
import ProjectGallery, { ProjectImage } from "../components/ProjectGallery";
import ProjectHistory from "../components/ProjectHistory";
import ProjectConversations from "../components/ProjectConversations";
import type { ProjectStatus as Status } from "../projects.d";
export default function ProjectPage() {
  const { projectId = "" } = useParams();
  return <ProjectDetail key={projectId} id={projectId} />;
}
function ProjectDetail({ id }: { id: string }) {
  const { lang, t, date } = useProjects(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const resource = useProjectResource(useCallback(() => projectApi.detail(id), [id]));
  const photos = useProjectResource(useCallback(() => projectApi.photos(id), [id]));
  const actions = useProjectActions();
  const p = resource.data;
  const tabs = ["overview", "agenda", "members", "gallery", "conversations", "history"] as const;
  const requested = params.get("tab");
  const tab = tabs.find((x) => x === requested) ?? "overview";
  const base = routePaths.projectDetail(lang, id);
  const readonly = p ? isProjectReadOnly(p) : true;
  function status(next: Status) {
    actions.ask({
      title: t(next === "OPEN" ? "reopen" : "changeStatus"),
      message: t("statusMessage"),
      action: async () => {
        await projectApi.status(id, next);
        await resource.reload();
      },
    });
  }
  const management =
    p?.canManage && !p.archived ? (
      <TableRowOptions name={p.name} disabled={actions.busy}>
        {!p.archived && (
          <>
            {(["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELED"] as const)
              .filter((s) => s !== p.status)
              .map((s) => (
                <ToolbarAction
                  key={s}
                  icon={s === "COMPLETED" ? "check" : s === "CANCELED" ? "x" : "refresh"}
                  label={s === "OPEN" ? t("reopen") : t(`status.${s}`)}
                  onClick={() => status(s)}
                />
              ))}
            <ToolbarAction
              icon="archive"
              label={t("archive")}
              onClick={() =>
                actions.ask({
                  title: t("archive"),
                  message: t("archiveMessage"),
                  success: t("feedback.archived"),
                  action: async () => {
                    await projectApi.archive(id);
                    await resource.reload();
                  },
                })
              }
            />
          </>
        )}
      </TableRowOptions>
    ) : undefined;
  return (
    <OperationalPage
      title={p?.name ?? t("title")}
      description={t("description")}
      centered
      sideBackground
      loading={!p && !resource.error}
      breadcrumbs={
        <Breadcrumbs label={t("title")} items={[{ label: t("title"), to: routePaths.projects(lang) }, { label: p?.name ?? t("overview") }]} />
      }
      actions={
        p?.canManage && !readonly ? (
          <PrimaryButton
            variant="soft"
            content={t("edit")}
            description={t("edit")}
            icon={{ name: "edit", inverse: true }}
            onClick={() => navigate(routePaths.projectEdit(lang, id))}
          />
        ) : undefined
      }>
      {resource.error && (
        <Alert>
          {resource.error}
          <WhiteSolidButton content={t("refresh")} description={t("refresh")} onClick={() => void actions.execute(resource.reload)} />
        </Alert>
      )}
      {p && (
        <>
          <div className="flex justify-center">
            <Switcher
              label={t("title")}
              activeUrl={`${base}?tab=${tab}`}
              options={tabs.map((key) => ({ content: t(key), url: `${base}?tab=${key}` }))}
            />
          </div>
          {readonly && (
            <div className="mx-auto w-full lg:w-[85%]">
              <Alert>{t("readOnly")}</Alert>
            </div>
          )}
          {tab === "overview" && (
            <OperationalDetails
              title={t("overview")}
              status={<ProjectStatus status={p.status} archived={p.archived} />}
              actions={management}
              media={photos.data?.find((x) => x.cover) ? <ProjectImage projectId={id} photo={photos.data.find((x) => x.cover)!} /> : undefined}>
              <DetailSection title={t("descriptionLabel")} plain>
                <DetailField label={t("name")} value={p.name} />
                <DetailField label={t("owner")} value={p.ownerName ?? t(p.ownerCompanyId ? "company" : "personal")} />
                <DetailField label={t("roleLabel")} value={t(`roles.${p.role}`)} />
                <DetailField label={t("created")} value={date(p.createdAt)} />
                {p.description && (
                  <div className="sm:col-span-2">
                    <DetailField label={t("descriptionLabel")} value={<p className="whitespace-pre-wrap text-inherit">{p.description}</p>} />
                  </div>
                )}
              </DetailSection>
              <DetailSection title={t("location")} plain>
                {!p.location?.city && !p.location?.street && <p className="text-operational-muted sm:col-span-2">{t("locationHint")}</p>}
                {(["street", "number", "city", "state", "zipCode", "neighborhood", "complement"] as const)
                  .filter((k) => Boolean(p.location?.[k]))
                  .map((k) => (
                    <DetailField key={k} label={t(k)} value={p.location?.[k]} />
                  ))}
              </DetailSection>
              <DetailSection title={t("dates")} plain>
                {!p.startDate && !p.endDate && <p className="text-operational-muted sm:col-span-2">{t("noSchedule")}</p>}
                {p.startDate && <DetailField label={t("start")} value={date(p.startDate)} />}
                {p.endDate && <DetailField label={t("end")} value={date(p.endDate)} />}
              </DetailSection>
            </OperationalDetails>
          )}
          {tab === "members" && <ProjectMembers key={`${id}:${p.status}`} project={p} />}
          {tab === "agenda" && <ProjectAgenda key={`${id}:${p.status}`} project={p} />}
          {tab === "gallery" && (
            <ProjectGallery
              key={`${id}:${p.status}`}
              project={p}
              onChange={async () => {
                await photos.reload();
              }}
            />
          )}
          {tab === "history" && <ProjectHistory key={id} project={p} />}
          {tab === "conversations" && <ProjectConversations key={`${id}:${p.status}`} project={p} />}
        </>
      )}
      {actions.confirmation}
    </OperationalPage>
  );
}
