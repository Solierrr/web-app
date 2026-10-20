import FormError from "@@/feedback/toast/FormError";
import { useCallback, useState, type FormEvent } from "react";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import ProjectAgendaView from "./ProjectAgendaView";
import TableRowOptions from "@@/layout/operational-page/OperationalTable.actions";
import OperationalForm from "@@/layout/operational-page/OperationalForm";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import Dialog from "@@/overlay/dialog/Dialog";
import Input from "@@/ui/input/Input";
import Textarea from "@@/ui/textarea/Textarea";
import Select from "@@/ui/select/Select";
import Checkbox from "@@/ui/checkbox/Checkbox";
import Alert from "@@/feedback/alert/Alert";
import { projectApi } from "../projects.service";
import { useProjects, useProjectResource, useProjectActions } from "../projects.hooks";
import { isProjectReadOnly, isoDate, localDate } from "../projects.utils";
import type { Project, ProjectActivity, ActivityType, ProjectStatus as Status } from "../projects.d";
export default function ProjectAgenda({ project: p }: { project: Project }) {
  const { t } = useProjects();
  const r = useProjectResource(useCallback(() => projectApi.agenda(p.id), [p.id]));
  const members = useProjectResource(useCallback(() => projectApi.members(p.id), [p.id]));
  const a = useProjectActions();
  const [editor, setEditor] = useState<ProjectActivity | "new" | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [formError, setFormError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ActivityType>("VISIT");
  const writable = p.canManage && !isProjectReadOnly(p);
  const ownId = members.data?.find((m) => m.authId === getAuthSession()?.userId)?.userId;
  function edit(activity: ProjectActivity | "new") {
    setSelected(activity === "new" ? [] : activity.assigneeIds);
    setSelectedType(activity === "new" ? "VISIT" : activity.type);
    setFormError(null);
    setEditor(activity);
  }
  function transition(item: ProjectActivity, next: Status) {
    a.ask({
      title: t(next === "IN_PROGRESS" ? "startActivity" : next === "COMPLETED" ? "completeActivity" : "cancelActivity"),
      message: t("activityMessage"),
      action: async () => {
        await projectApi.activityStatus(p.id, item.id, next);
        await r.reload();
      },
    });
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const startsAt = isoDate(String(f.get("startsAt")))!,
      endsAt = isoDate(String(f.get("endsAt")))!;
    if (new Date(endsAt) <= new Date(startsAt)) {
      setFormError(t("feedback.invalidDates"));
      return;
    }
    const ok = await a.execute(async () => {
      await projectApi.activity(
        p.id,
        {
          title: String(f.get("title")).trim(),
          description: String(f.get("description") ?? ""),
          type: selectedType,
          startsAt,
          endsAt,
          onsite: f.get("onsite") === "on",
          assigneeIds: selected,
        },
        editor && editor !== "new" ? editor.id : undefined,
      );
      await r.reload();
    }, t("feedback.activity"));
    if (ok) setEditor(null);
  }
  const current = editor && editor !== "new" ? editor : null;
  return (
    <div className="flex flex-col gap-6">
      <header className="mx-auto flex w-full items-center justify-between max-w-operational-page">
        <h2 className="font-semi-bold">{t("agenda")}</h2>
        {writable && (
          <PrimaryButton
            variant="soft"
            content={t("addActivity")}
            description={t("addActivity")}
            icon={{ name: "plus", inverse: true }}
            onClick={() => edit("new")}
          />
        )}
      </header>
      {r.error && <Alert>{r.error}</Alert>}
      <ProjectAgendaView
        items={r.data}
        failed={Boolean(r.error)}
        members={members.data ?? []}
        busy={a.busy}
        onRefresh={() => void a.execute(r.reload, t("feedback.refreshed"))}
        rowAction={(v) => (
          <TableRowOptions
            name={v.title}
            disabled={
              a.busy ||
              !p.canContribute ||
              (!p.canManage && !v.assigneeIds.includes(ownId ?? "")) ||
              v.status === "COMPLETED" ||
              v.status === "CANCELED"
            }>
            {writable && v.status === "OPEN" && <ToolbarAction icon="edit" label={t("editActivity")} onClick={() => edit(v)} />}
            {v.status === "OPEN" && <ToolbarAction icon="check" label={t("startActivity")} onClick={() => transition(v, "IN_PROGRESS")} />}
            {v.status === "IN_PROGRESS" && <ToolbarAction icon="check" label={t("completeActivity")} onClick={() => transition(v, "COMPLETED")} />}
            <ToolbarAction icon="x" label={t("cancelActivity")} onClick={() => transition(v, "CANCELED")} />
          </TableRowOptions>
        )}
      />
      {editor && (
        <Dialog title={t(current ? "editActivity" : "addActivity")} busy={a.busy} onClose={() => setEditor(null)}>
          <OperationalForm plain onSubmit={submit}>
            <label className="flex flex-col gap-2">
              {t("activityTitle")}
              <Input
                name="title"
                aria-label={t("activityTitle")}
                required
                maxLength={160}
                defaultValue={current?.title}
                placeholder={t("activityPlaceholder")}
                disabled={a.busy}
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("descriptionLabel")}
              <Textarea
                name="description"
                aria-label={t("descriptionLabel")}
                maxLength={4000}
                rows={3}
                defaultValue={current?.description ?? ""}
                placeholder={t("descriptionPlaceholder")}
                className="w-full"
                disabled={a.busy}
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("activityType")}
              <Select<ActivityType>
                name={t("activityType")}
                value={selectedType}
                onChange={(v) => setSelectedType(v ?? "VISIT")}
                clearable={false}
                disabled={a.busy || Boolean(current)}
                options={(["VISIT", "MEETING", "SERVICE", "OTHER"] as const).map((type) => [t(`types.${type}`), type])}
                className="[&>[role=button]]:min-h-12"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("startsAt")}
              <Input
                name="startsAt"
                aria-label={t("startsAt")}
                type="datetime-local"
                required
                defaultValue={localDate(current?.startsAt)}
                disabled={a.busy}
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("endsAt")}
              <Input
                name="endsAt"
                aria-label={t("endsAt")}
                type="datetime-local"
                required
                defaultValue={localDate(current?.endsAt)}
                disabled={a.busy}
              />
            </label>
            <Checkbox name="onsite" label={t("onsite")} defaultChecked={current?.onsite ?? false} disabled={a.busy} />
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-3 font-semi-bold">{t("assignees")}</legend>
              <p className="text-operational-muted">{t("assigneesHint")}</p>
              {members.data
                ?.filter((m) => m.role !== "VIEWER")
                .map((m) => (
                  <Checkbox
                    key={m.id}
                    label={m.name}
                    checked={selected.includes(m.userId)}
                    disabled={a.busy}
                    onChange={(e) => setSelected((prev) => (e.target.checked ? [...prev, m.userId] : prev.filter((id) => id !== m.userId)))}
                  />
                ))}
              {members.error && <Alert>{members.error}</Alert>}
            </fieldset>
            <FormError message={formError} />
            <PrimaryButton
              variant="soft"
              type="submit"
              content={t("saveActivity")}
              description={t("saveActivity")}
              disabled={a.busy || !members.data}
            />
            <WhiteSolidButton type="button" content={t("cancel")} description={t("cancel")} disabled={a.busy} onClick={() => setEditor(null)} />
          </OperationalForm>
        </Dialog>
      )}
      {a.confirmation}
    </div>
  );
}
