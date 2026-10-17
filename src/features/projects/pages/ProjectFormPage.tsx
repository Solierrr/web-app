import { useCallback, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { routePaths } from "@/config/i18n/paths";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import Breadcrumbs from "@@/ui/breadcrumbs/Breadcrumbs";
import Input from "@@/ui/input/Input";
import { CepInput, UfInput } from "@@/ui/input/Input.presets";
import Textarea from "@@/ui/textarea/Textarea";
import InputGroup from "@@/ui/input-group/InputGroup";
import Combobox from "@@/ui/combobox/Combobox";
import Checkbox from "@@/ui/checkbox/Checkbox";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import Alert from "@@/feedback/alert/Alert";
import { notify } from "@@/feedback/toast/Toast.utils";
import { projectApi } from "../projects.service";
import { useProjects, useProjectResource } from "../projects.hooks";
import { isoDate, localDate, isProjectReadOnly, projectError } from "../projects.utils";
import type { Project, ProjectLocation, ProjectOptions } from "../projects.d";
export default function ProjectFormPage() {
  const { projectId } = useParams();
  const c = useActiveContext();
  return (
    <FormLoad
      key={`${projectId ?? "new"}:${c.kind}:${c.company?.id ?? ""}`}
      id={projectId}
      companyId={c.kind === "company" ? c.company?.id : undefined}
      ownCompanyId={c.company?.id}
    />
  );
}
function FormLoad({ id, companyId, ownCompanyId }: { id?: string; companyId?: string; ownCompanyId?: string }) {
  const { lang, t } = useProjects();
  const resource = useProjectResource(
    useCallback(async () => {
      const p = id ? await projectApi.detail(id) : null;
      const options =
        p && p.ownerCompanyId !== ownCompanyId
          ? {
              units: p.localUnitId
                ? [{ id: p.localUnitId, name: [p.location?.street, p.location?.number, p.location?.city].filter(Boolean).join(", ") }]
                : [],
              teams: [],
            }
          : await projectApi.options(p?.ownerCompanyId ?? companyId);
      return { p, options };
    }, [id, companyId, ownCompanyId]),
  );
  return (
    <OperationalPage
      title={t(id ? "edit" : "new")}
      description={t("description")}
      centered
      form
      formBackground
      loading={!resource.data && !resource.error}
      breadcrumbs={
        <Breadcrumbs
          label={t("title")}
          items={[
            { label: t("title"), to: routePaths.projects(lang) },
            ...(resource.data?.p ? [{ label: resource.data.p.name, to: routePaths.projectDetail(lang, resource.data.p.id) }] : []),
            { label: t(id ? "edit" : "new") },
          ]}
        />
      }>
      {resource.error ? (
        <Alert>{resource.error}</Alert>
      ) : resource.data ? (
        <ProjectForm project={resource.data.p} options={resource.data.options} companyId={companyId} />
      ) : null}
    </OperationalPage>
  );
}
function ProjectForm({ project: p, options, companyId }: { project: Project | null; options: ProjectOptions; companyId?: string }) {
  const { lang, t } = useProjects(),
    navigate = useNavigate();
  const [loc, setLoc] = useState<ProjectLocation>(p?.location ?? {}),
    [unit, setUnit] = useState(p?.localUnitId ?? ""),
    [useUnit, setUseUnit] = useState(Boolean(p?.localUnitId));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const ownerCompanyId = p ? p.ownerCompanyId : (companyId ?? null);
  if (p && (!p.canManage || isProjectReadOnly(p))) return <Alert>{t("readOnly")}</Alert>;
  const change = (field: keyof ProjectLocation, value: string) => setLoc((prev) => ({ ...prev, [field]: value }));
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    const startDate = isoDate(String(f.get("startDate") ?? "")),
      endDate = isoDate(String(f.get("endDate") ?? ""));
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      setError(t("feedback.invalidDates"));
      return;
    }
    if (useUnit && !unit) {
      setError(t("chooseUnit"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await projectApi.save(
        {
          name: String(f.get("name")).trim(),
          description: String(f.get("description") ?? "").trim(),
          ownerCompanyId,
          localUnitId: useUnit ? unit : null,
          location: useUnit ? null : loc,
          startDate,
          endDate,
        },
        p?.id,
      );
      notify(t("feedback.saved"));
      navigate(routePaths.projectDetail(lang, result.id));
    } catch (e) {
      setError(projectError(e, t("feedback.failed")));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <OperationalForm ref={form} plain onSubmit={submit} onInvalidCapture={() => setError(t("feedback.required"))}>
        <label className="flex flex-col gap-2">
          {t("name")}
          <Input
            name="name"
            aria-label={t("name")}
            defaultValue={p?.name}
            placeholder={t("namePlaceholder")}
            required
            maxLength={160}
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-2">
          {t("descriptionLabel")}
          <Textarea
            name="description"
            aria-label={t("descriptionLabel")}
            defaultValue={p?.description ?? ""}
            placeholder={t("descriptionPlaceholder")}
            maxLength={4000}
            rows={3}
            disabled={busy}
            className="w-full"
          />
        </label>
        <FormSection title={t("location")} collapsible defaultExpanded={false}>
          <p className="text-operational-muted">{t("locationHint")}</p>
          {ownerCompanyId && options.units.length > 0 && (
            <Checkbox label={t("unit")} checked={useUnit} disabled={busy} onChange={(e) => setUseUnit(e.target.checked)} />
          )}
          {useUnit ? (
            <Combobox
              name="localUnitId"
              label={t("unit")}
              value={unit}
              onChange={setUnit}
              selectionLabel
              required
              placeholder={t("chooseUnit")}
              options={options.units.map((o) => [o.name, o.id])}
              emptyLabel={t("emptyOptions")}
              disabled={busy}
            />
          ) : (
            <>
              <label className="flex flex-col gap-2">
                {t("zipCode")}
                <CepInput
                  name="zipCode"
                  aria-label={t("zipCode")}
                  value={loc.zipCode ?? ""}
                  onValueChange={(v) => change("zipCode", v)}
                  placeholder="00000-000"
                  disabled={busy}
                />
              </label>
              <label className="flex flex-col gap-2">
                {t("state")}
                <UfInput
                  name="state"
                  label={t("state")}
                  value={loc.state ?? ""}
                  onChange={(v) => change("state", v)}
                  placeholder={t("state")}
                  emptyLabel={t("emptyOptions")}
                  disabled={busy}
                />
              </label>
              {(["city", "street", "number", "neighborhood", "complement"] as const).map((field) => (
                <label key={field} className="flex flex-col gap-2">
                  {t(field)}
                  <Input
                    name={field}
                    aria-label={t(field)}
                    value={loc[field] ?? ""}
                    onChange={(e) => change(field, e.target.value)}
                    placeholder={t(field)}
                    maxLength={field === "number" ? 30 : field === "street" || field === "complement" ? 180 : 120}
                    disabled={busy}
                  />
                </label>
              ))}
            </>
          )}
        </FormSection>
        <FormSection title={t("dates")} collapsible defaultExpanded={false}>
          <InputGroup label={t("dates")} hideLabel>
            <label className="flex min-w-0 flex-col gap-2">
              {t("start")}
              <Input name="startDate" aria-label={t("start")} type="datetime-local" defaultValue={localDate(p?.startDate)} disabled={busy} />
            </label>
            <label className="flex min-w-0 flex-col gap-2">
              {t("end")}
              <Input name="endDate" aria-label={t("end")} type="datetime-local" defaultValue={localDate(p?.endDate)} disabled={busy} />
            </label>
          </InputGroup>
        </FormSection>
        {error && <Alert>{error}</Alert>}
        <PrimaryButton variant="soft" type="submit" content={t("save")} description={t("save")} disabled={busy} className="min-h-12 w-full" />
        <WhiteSolidButton
          type="button"
          content={t("cancel")}
          description={t("cancel")}
          disabled={busy}
          className="min-h-12 w-full"
          onClick={() => navigate(p ? routePaths.projectDetail(lang, p.id) : routePaths.projects(lang))}
        />
      </OperationalForm>
    </>
  );
}
