import FormError from "@@/feedback/toast/FormError";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import Select from "@@/ui/select/Select";
import ImageInput from "@@/ui/image-input/ImageInput";
import Tooltip from "@@/feedback/tooltip/Tooltip";
import Alert from "@@/feedback/alert/Alert";
import FieldFeedback from "@@/feedback/field-feedback/FieldFeedback";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import Confirmation from "@@/overlay/confirmation/Confirmation";
import { PrimaryButton, WhiteButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import { notify } from "@@/feedback/toast/Toast.utils";
import { firstInvalidField, clearFieldValidity } from "@/lib/shared/forms/form.utils";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { createBrand, updateBrand, archiveBrand, submitBrand, uploadBrandLogo } from "../brand.service";
import { normalizeBrand } from "../brand.utils";
import type { BrandManagerProps } from "./BrandManager.d";
import OperationalForm from "@@/layout/operational-page/OperationalForm";

export default function BrandManager({ brands, onSaved, onClose, initialBrandId, presentation = "inline", onBusyChange }: BrandManagerProps) {
  const { t } = useTranslation("brands"),
    { can = () => false } = useActiveContext();
  const allowed = (permission: string) => isAlwaysMockMode() || can(permission);
  const initial = brands.find((brand) => brand.id === initialBrandId);
  const [id, setId] = useState(initial?.id ?? ""),
    [name, setName] = useState(initial?.name ?? ""),
    [referenceUrl, setReference] = useState(initial?.referenceUrl ?? ""),
    [logoUrl, setLogo] = useState<string | null>(initial?.logoUrl ?? null),
    [files, setFiles] = useState<File[]>([]),
    [error, setError] = useState<string | null>(null),
    [invalid, setInvalid] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [archive, setArchive] = useState(false),
    [visibility, setVisibility] = useState("PRIVATE");
  const form = useRef<HTMLFormElement>(null),
    brand = brands.find((b) => b.id === id);
  const tonal = presentation === "dialog";
  const Form = tonal ? OperationalForm : "form";
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  const blocked = busy || !!brand?.pending;
  const actionLabel = brand?.visibility === "PUBLIC" ? t("requestCorrection") : visibility === "PUBLIC" ? t("requestPublication") : t("save");
  function choose(value: string | undefined) {
    const b = brands.find((b) => b.id === value);
    setId(value ?? "");
    setName(b?.name ?? "");
    setReference(b?.referenceUrl ?? "");
    setLogo(b?.logoUrl ?? null);
    setFiles([]);
    setError(null);
    setInvalid(null);
    setVisibility("PRIVATE");
  }
  async function save(publication = false) {
    if (blocked || !form.current) return;
    setError(null);
    const field = firstInvalidField(form.current, t("fieldInvalid"));
    if (field) {
      setInvalid(field.name);
      return;
    }
    if (
      brand?.visibility !== "PUBLIC" &&
      brands.some((b) => b.id !== id && b.visibility === "PRIVATE" && !b.archived && normalizeBrand(b.name) === normalizeBrand(name))
    ) {
      setInvalid("brandName");
      setError(t("duplicateName"));
      form.current.querySelector<HTMLInputElement>('[name="brandName"]')?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    setInvalid(null);
    try {
      const logo = files[0] ? await uploadBrandLogo(files[0]) : logoUrl;
      setLogo(logo);
      setFiles([]);
      const payload = { name: name.trim(), referenceUrl: referenceUrl || null, logoUrl: logo };
      const requesting = publication || brand?.visibility === "PUBLIC" || visibility === "PUBLIC";
      if (requesting) {
        const created = !id ? await createBrand(payload) : undefined;
        const brandId = created?.id ?? id;
        if (created) {
          setId(created.id);
          await onSaved();
        }
        await submitBrand(brandId, payload);
        notify(t("requested"));
        await onSaved(created);
        onClose();
      } else {
        const saved = id ? await updateBrand(id, payload) : await createBrand(payload);
        notify(t("saved"));
        await onSaved(saved);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("serviceError"));
      await onSaved();
    } finally {
      setBusy(false);
    }
  }
  const feedback = (field: string) => <FieldFeedback id={`${field}-error`} message={invalid === field ? (error ?? t("fieldInvalid")) : null} />;
  return (
    <div className={`relative flex flex-col gap-5 ${tonal ? "" : "p-2"}`}>
      {!tonal && (
        <>
          <ToolbarAction icon="x" label={t("close")} className="absolute right-0 top-0 h-8! w-8!" onClick={onClose} disabled={busy} />
          <h2 className="pr-10 text-body font-semi-bold">{t("manage")}</h2>
        </>
      )}
      {!initialBrandId && (
        <Select
          name={t("existing")}
          value={id}
          options={[
            [t("new"), ""],
            ...brands.filter((b) => !b.archived).map((b) => [`${b.name} · ${t(`visibility.${b.visibility}`)}`, b.id] as const),
          ]}
          onChange={choose}
          disabled={busy}
        />
      )}
      {brand?.pending && <Alert state="info">{t("pendingHelp")}</Alert>}
      <Form
        {...(tonal ? { plain: true, tone: "tonal" as const } : {})}
        ref={form}
        noValidate
        className="flex flex-col gap-4"
        onInvalidCapture={(e) => e.preventDefault()}
        onChangeCapture={(e) => {
          const name = clearFieldValidity(e.target);
          if (name === invalid) setInvalid(null);
        }}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void save();
        }}>
        <div className={tonal ? "flex flex-col gap-5 rounded-surface bg-white p-5 sm:p-6" : "contents"}>
          <label className="flex flex-col gap-2">
            {t("name")}
            <Input
              name="brandName"
              aria-label={t("name")}
              aria-invalid={invalid === "brandName"}
              aria-describedby={invalid === "brandName" ? "brandName-error" : undefined}
              required
              maxLength={255}
              placeholder={t("namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={blocked}
              className="w-full"
            />
            {feedback("brandName")}
          </label>
          <label className="flex flex-col gap-2">
            {t("reference")}
            <Input
              name="brandReference"
              aria-label={t("reference")}
              aria-invalid={invalid === "brandReference"}
              aria-describedby={invalid === "brandReference" ? "brandReference-error" : undefined}
              type="url"
              pattern="https?://.*"
              maxLength={2048}
              placeholder="https://"
              value={referenceUrl}
              onChange={(e) => setReference(e.target.value)}
              disabled={blocked}
              className="w-full"
            />
            {feedback("brandReference")}
          </label>
          {!id && (
            <Select
              name={t("privacy")}
              value={visibility}
              options={[
                [t("visibility.PRIVATE"), "PRIVATE"],
                [t("visibility.PUBLIC"), "PUBLIC"],
              ]}
              clearable={false}
              onChange={(v) => setVisibility(v ?? "PRIVATE")}
              disabled={busy}
            />
          )}
          {!id && visibility === "PUBLIC" && <Alert state="info">{t("publicationHelp")}</Alert>}
          <div className="flex items-center gap-2">
            <span>{t("logo")}</span>
            <Tooltip label={t("logoHelp")} content={t("logoHelp")} />
          </div>
          <ImageInput
            name="brandLogo"
            files={files}
            onChange={setFiles}
            onError={setError}
            label={t("chooseLogo")}
            removeLabel={t("removeLogo")}
            invalidMessage={t("invalidLogo")}
            summary={files[0]?.name ?? t("noLogo")}
            multiple={false}
            disabled={blocked}
          />
          {logoUrl && !files.length && <img src={logoUrl} alt={name} className="h-20 w-full object-contain" />}
        </div>
        {brand?.visibility === "PUBLIC" && <Alert state="info">{t("publicHelp")}</Alert>}
        <FormError message={!invalid ? error : null} />
        <div className={`flex flex-col gap-3 ${tonal ? "pt-2" : ""}`}>
          {allowed(brand?.visibility === "PUBLIC" ? "POST /api/brands/{id}/requests" : id ? "PUT /api/brands/{id}" : "POST /api/brands") &&
            (!(!id && visibility === "PUBLIC") || allowed("POST /api/brands/{id}/requests")) && (
              <PrimaryButton
                type="submit"
                disabled={blocked}
                content={actionLabel}
                description={actionLabel}
                variant={tonal ? "soft" : "flat"}
                className="w-full min-h-12"
              />
            )}
          {brand?.visibility === "PRIVATE" && allowed("POST /api/brands/{id}/requests") && (
            <WhiteButton
              type="button"
              disabled={blocked}
              content={t("requestPublication")}
              description={t("requestPublication")}
              onClick={() => void save(true)}
            />
          )}
          {brand?.visibility === "PRIVATE" && allowed("DELETE /api/brands/{id}") && (
            <WhiteButton type="button" disabled={blocked} content={t("archive")} description={t("archive")} onClick={() => setArchive(true)} />
          )}
          {tonal && (
            <WhiteSolidButton
              type="button"
              content={t("cancel")}
              description={t("cancel")}
              className="min-h-12 w-full"
              onClick={onClose}
              disabled={busy}
            />
          )}
        </div>
      </Form>
      {archive && (
        <Confirmation
          title={t("archive")}
          message={t("archiveMessage")}
          busy={busy}
          onCancel={() => setArchive(false)}
          onConfirm={() => {
            setBusy(true);
            void archiveBrand(id)
              .then(async () => {
                notify(t("archived"));
                await onSaved();
                onClose();
              })
              .catch((e) => setError(e.message))
              .finally(() => {
                setBusy(false);
                setArchive(false);
              });
          }}
        />
      )}
    </div>
  );
}
