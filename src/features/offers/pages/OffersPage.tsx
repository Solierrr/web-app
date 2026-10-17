import StatusField from "@@/ui/status-field/StatusField";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import Textarea from "@@/ui/textarea/Textarea";
import Input from "@@/ui/input/Input";
import { NativeSelect as Select } from "@@/ui/select/Select";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listApprovedSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import {
  changeOfferStatus,
  createOffer,
  deleteOffer,
  getMySupplier,
  listCompanyOffers,
  updateOffer,
  type Offer,
} from "@/features/offers/offer.service";
import { getOfferStatus, type OfferStatus } from "@/features/offers/offer.utils";

function offerTitle(offer: Offer, locale: string): string {
  return (
    offer.translations.find((translation) => translation.locale === locale)?.title ??
    offer.translations[0]?.title ??
    `${offer.model.brand} ${offer.model.model}`
  );
}

interface FormState {
  modelId: string;
  title: string;
  description: string;
  unitPrice: string;
  availability: string;
  discountPercentage: string;
  serviceRegions: string;
}

const EMPTY_FORM: FormState = {
  modelId: "",
  title: "",
  description: "",
  unitPrice: "",
  availability: "",
  discountPercentage: "",
  serviceRegions: "",
};

export default function OffersPage() {
  const { t } = useTranslation("commons", { keyPrefix: "offers" });
  const { company, can = () => false, loading: contextLoading } = useActiveContext();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { t: tCommon } = useTranslation("commons");
  const companyId = company?.id;

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [models, setModels] = useState<SolarPanel[]>([]);
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(id: string) {
    const editing = can("POST /api/offers") || can("PUT /api/offers/{id}");
    const [supplier, approvedModels, companyOffers] = await Promise.all([
      editing ? getMySupplier(id) : Promise.resolve(null),
      editing ? listApprovedSolarPanelModels() : Promise.resolve([]),
      listCompanyOffers(id),
    ]);
    return { supplierId: supplier?.id ?? null, models: approvedModels, offers: companyOffers };
  }

  function apply(data: Awaited<ReturnType<typeof load>>) {
    setSupplierId(data.supplierId);
    setModels(data.models);
    setOffers(data.offers);
  }

  async function reload(id: string) {
    try {
      apply(await load(id));
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    if (!companyId) return;
    let active = true;
    load(companyId)
      .then((data) => {
        if (active) apply(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [companyId]);

  function startCreate() {
    setFormOpen(true);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(offer: Offer) {
    const source =
      offer.translations.find((item) => item.locale === offer.sourceLocale) ??
      offer.translations.find((item) => item.locale === "und") ??
      offer.translations[0];
    setFormOpen(true);
    setEditingId(offer.id);
    setForm({
      modelId: offer.model.id,
      title: source?.title ?? offerTitle(offer, lang),
      description: source?.description ?? offerTitle(offer, lang),
      unitPrice: String(offer.unitPrice),
      availability: String(offer.availability),
      discountPercentage: offer.discountPercentage != null ? String(offer.discountPercentage) : "",
      serviceRegions: (offer.serviceRegions ?? []).join(", "),
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supplierId) return;
    setSaving(true);
    setError(false);
    try {
      const serviceRegions = form.serviceRegions
        .split(",")
        .map((region) => region.trim())
        .filter(Boolean);
      const source = offers?.find((item) => item.id === editingId);
      const sourceTranslation =
        source?.translations.find((item) => item.locale === source.sourceLocale) ??
        source?.translations.find((item) => item.locale === "und") ??
        source?.translations[0];
      const payload = {
        details: sourceTranslation?.details ?? undefined,
        supplierId,
        modelId: form.modelId,
        title: form.title.trim(),
        description: form.description.trim(),
        unitPrice: Number(form.unitPrice),
        availability: Number(form.availability),
        discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined,
        serviceRegions: serviceRegions.length ? serviceRegions : undefined,
      };
      if (editingId) {
        await updateOffer(editingId, payload);
      } else {
        await createOffer(payload);
      }
      setFormOpen(false);
      setEditingId(null);
      await reload(companyId!);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!companyId) throw new Error("Missing company");
    try {
      await deleteOffer(id);
      await reload(companyId);
    } catch {
      throw new Error(t("error"));
    }
  }

  async function handleStatus(offer: Offer, status: OfferStatus) {
    if (!companyId || busyId) return;
    setBusyId(offer.id);
    try {
      await changeOfferStatus(offer, status);
      await reload(companyId);
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  if (error && !offers)
    return (
      <OperationalPage title={t("title")} centered sideBackground>
        <p role="alert">{t("error")}</p>
      </OperationalPage>
    );
  if (contextLoading || !offers) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage
      description={!formOpen ? t("description") : undefined}
      centered
      sideBackground={!formOpen}
      form={formOpen}
      formBackground={formOpen}
      title={formOpen ? (editingId ? t("editHeading") : t("createHeading")) : t("title")}
      actions={
        !formOpen && can("POST /api/offers") ? (
          <PrimaryButton content={t("createHeading")} description={t("createHeading")} onClick={startCreate} />
        ) : undefined
      }>
      {error ? (
        <p role="alert" className="text-feedback-error">
          {t("error")}
        </p>
      ) : null}

      {formOpen && (editingId ? can("PUT /api/offers/{id}") : can("POST /api/offers")) && (
        <section className="flex flex-col gap-3">
          {models.length === 0 ? <p className="text-body text-operational-muted">{t("noApprovedModels")}</p> : null}
          <OperationalForm plain onSubmit={handleSubmit}>
            <label className="flex flex-col gap-1 text-body">
              {t("model")}
              <Select
                name="modelId"
                aria-label={t("model")}
                value={form.modelId}
                onChange={(event) => setForm({ ...form, modelId: event.target.value })}
                required
                disabled={!!editingId}
                className="w-full">
                <option value="" disabled>
                  {t("selectModel")}
                </option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.brand} {model.model}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-body">
              {t("offerTitle")}
              <Input
                name="title"
                aria-label={t("offerTitle")}
                placeholder={t("offerTitle")}
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                className="w-full"
              />
            </label>
            <label className="flex flex-col gap-1 text-body">
              {t("offerDescription")}
              <Textarea
                name="description"
                aria-label={t("offerDescription")}
                placeholder={t("offerDescription")}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
                className="w-full"
              />
            </label>
            <FormSection title={t("commercialSection")} collapsible defaultExpanded={false}>
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-body">
                  {t("unitPrice")}
                  <Input
                    name="unitPrice"
                    aria-label={t("unitPrice")}
                    placeholder={t("unitPrice")}
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.unitPrice}
                    onChange={(event) => setForm({ ...form, unitPrice: event.target.value })}
                    required
                    className="w-full"
                  />
                </label>
                <label className="flex flex-col gap-1 text-body">
                  {t("availability")}
                  <Input
                    name="availability"
                    aria-label={t("availability")}
                    placeholder={t("availability")}
                    type="number"
                    min="0"
                    value={form.availability}
                    onChange={(event) => setForm({ ...form, availability: event.target.value })}
                    required
                    className="w-full"
                  />
                </label>
                <label className="flex flex-col gap-1 text-body">
                  {t("discount")}
                  <Input
                    name="discountPercentage"
                    aria-label={t("discount")}
                    placeholder={t("discount")}
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercentage}
                    onChange={(event) => setForm({ ...form, discountPercentage: event.target.value })}
                    className="w-full"
                  />
                </label>
                <label className="flex flex-col gap-1 text-body">
                  {t("serviceRegions")}
                  <Input
                    name="serviceRegions"
                    aria-label={t("serviceRegions")}
                    value={form.serviceRegions}
                    onChange={(event) => setForm({ ...form, serviceRegions: event.target.value })}
                    placeholder="SP, RJ, MG"
                    className="w-full"
                  />
                </label>
              </div>
            </FormSection>
            <div className="flex flex-col gap-3">
              <PrimaryButton
                type="submit"
                disabled={saving || !supplierId}
                className="min-h-12 w-full"
                content={editingId ? t("save") : t("add")}
                description={editingId ? t("save") : t("add")}
              />
              <WhiteButton
                type="button"
                onClick={() => setFormOpen(false)}
                disabled={saving}
                className="min-h-12 w-full"
                content={t("cancel")}
                description={t("cancel")}
              />
            </div>
          </OperationalForm>
        </section>
      )}

      {!formOpen && (
        <OperationalTable
          label={t("listTitle")}
          items={offers}
          onRefresh={async () => apply(await load(companyId!))}
          getKey={(offer) => offer.id}
          empty={t("empty")}
          columns={[
            {
              key: "title",
              value: (offer) => offerTitle(offer, lang),
              label: t("offerTitle"),
              render: (offer) => (
                <Link className="font-medium hover:underline" to={`${routePaths.offersManagement(lang)}/${encodeURIComponent(offer.id)}`}>
                  {offerTitle(offer, lang)}
                </Link>
              ),
            },
            { key: "model", label: t("model"), render: (offer) => `${offer.model.brand} ${offer.model.model}` },
            {
              key: "price",
              value: (offer) => offer.unitPrice,
              label: t("unitPrice"),
              render: (offer) => new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice),
            },
            { key: "availability", label: t("availability"), render: (offer) => offer.availability },
            {
              key: "status",
              filterable: true,
              value: (offer) => t(`status.${getOfferStatus(offer)}`),
              label: t("statusLabel"),
              render: (offer) => (
                <StatusField
                  state={getOfferStatus(offer) === "ACTIVE" ? "approved" : getOfferStatus(offer) === "PAUSED" ? "pending" : "rejected"}
                  label={t(`status.${getOfferStatus(offer)}`)}
                />
              ),
            },
            {
              key: "actions",
              label: tCommon("operational.actions"),
              render: (offer) => {
                const status = getOfferStatus(offer);
                return (
                  <div className="flex items-center gap-1">
                    <ToolbarAction
                      icon="eye"
                      label={tCommon("actions.view")}
                      to={`${routePaths.offersManagement(lang)}/${encodeURIComponent(offer.id)}`}
                      backgroundColor="var(--color-input-bg)"
                      className="h-8! w-10!"
                    />
                    {can("PATCH /api/offers/{id}/status") && status !== "CLOSED" && (
                      <ToolbarAction
                        icon={status === "PAUSED" ? "check" : "stop"}
                        label={status === "PAUSED" ? t("resume") : t("pause")}
                        disabled={busyId !== null}
                        onClick={() => void handleStatus(offer, status === "PAUSED" ? "ACTIVE" : "PAUSED")}
                        backgroundColor="var(--color-input-bg)"
                        className="h-8! w-10!"
                      />
                    )}
                    {can("PATCH /api/offers/{id}/status") && status !== "CLOSED" && (
                      <ToolbarAction
                        icon="x"
                        label={t("close")}
                        disabled={busyId !== null}
                        onClick={() => void handleStatus(offer, "CLOSED")}
                        backgroundColor="var(--color-input-bg)"
                        className="h-8! w-10!"
                      />
                    )}
                    {can("PUT /api/offers/{id}") && (
                      <ToolbarAction
                        icon="edit"
                        label={t("edit")}
                        onClick={() => startEdit(offer)}
                        backgroundColor="var(--color-input-bg)"
                        className="h-8! w-10!"
                      />
                    )}
                    {can("DELETE /api/offers/{id}") && (
                      <ConfirmedAction label={t("remove")} name={offerTitle(offer, lang)} onConfirm={() => handleDelete(offer.id)} />
                    )}
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </OperationalPage>
  );
}
