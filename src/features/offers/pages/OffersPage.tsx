import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listApprovedSolarPanelModels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { createOffer, deleteOffer, getMySupplier, listCompanyOffers, updateOffer, type Offer } from "@/features/offers/offer.service";

function offerTitle(offer: Offer): string {
  return (
    offer.translations.find((translation) => translation.locale === "pt-BR")?.title ??
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
  const companyId = company?.id;

  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [models, setModels] = useState<SolarPanel[]>([]);
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [error, setError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(offer: Offer) {
    setEditingId(offer.id);
    setForm({
      modelId: offer.model.id,
      title: offerTitle(offer),
      description: offer.translations[0]?.description ?? offerTitle(offer),
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
      const payload = {
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
      startCreate();
      await reload(companyId!);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!companyId) return;
    try {
      await deleteOffer(id);
      await reload(companyId);
    } catch {
      setError(true);
    }
  }

  if (error && !offers)
    return (
      <OperationalPage title={t("title")}>
        <p role="alert">{t("error")}</p>
      </OperationalPage>
    );
  if (contextLoading || !offers) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage title={t("title")}>
      {error ? (
        <p role="alert" className="text-red-700">
          {t("error")}
        </p>
      ) : null}

      {(editingId ? can("PUT /api/offers/{id}") : can("POST /api/offers")) && (
        <section className="flex flex-col gap-3 rounded-small border border-operational-border p-4">
          <h2 className="font-medium">{editingId ? t("editHeading") : t("createHeading")}</h2>
          {models.length === 0 ? <p className="text-sm text-gray-600">{t("noApprovedModels")}</p> : null}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              {t("model")}
              <select
                value={form.modelId}
                onChange={(event) => setForm({ ...form, modelId: event.target.value })}
                required
                disabled={!!editingId}
                className="rounded-small border border-operational-border p-2">
                <option value="" disabled>
                  {t("selectModel")}
                </option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.brand} {model.model}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t("offerTitle")}
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                className="rounded-small border border-operational-border p-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {t("offerDescription")}
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
                className="rounded-small border border-operational-border p-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                {t("unitPrice")}
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.unitPrice}
                  onChange={(event) => setForm({ ...form, unitPrice: event.target.value })}
                  required
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("availability")}
                <input
                  type="number"
                  min="0"
                  value={form.availability}
                  onChange={(event) => setForm({ ...form, availability: event.target.value })}
                  required
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("discount")}
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.discountPercentage}
                  onChange={(event) => setForm({ ...form, discountPercentage: event.target.value })}
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("serviceRegions")}
                <input
                  value={form.serviceRegions}
                  onChange={(event) => setForm({ ...form, serviceRegions: event.target.value })}
                  placeholder="SP, RJ, MG"
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !supplierId} className="rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
                {editingId ? t("save") : t("add")}
              </button>
              {editingId ? (
                <button type="button" onClick={startCreate} className="rounded-small border border-operational-border px-4 py-2">
                  {t("cancel")}
                </button>
              ) : null}
            </div>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">{t("listTitle")}</h2>
        <ul className="divide-y divide-operational-border rounded-small border border-operational-border">
          {offers.map((offer) => (
            <li key={offer.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link className="font-medium hover:underline" to={`${routePaths.offersManagement(lang)}/${encodeURIComponent(offer.id)}`}>
                  {offerTitle(offer)}
                </Link>
                <p className="text-sm text-gray-600">
                  {offer.model.brand} {offer.model.model} · R$ {offer.unitPrice} · {offer.availability} {t("units")}
                </p>
              </div>
              <div className="flex gap-2">
                {can("PUT /api/offers/{id}") && (
                  <button type="button" onClick={() => startEdit(offer)} className="text-sm text-orange">
                    {t("edit")}
                  </button>
                )}
                {can("DELETE /api/offers/{id}") && (
                  <button type="button" onClick={() => void handleDelete(offer.id)} className="text-sm text-red-700">
                    {t("remove")}
                  </button>
                )}
              </div>
            </li>
          ))}
          {offers.length === 0 ? <li className="p-4 text-gray-600">{t("empty")}</li> : null}
        </ul>
      </section>
    </OperationalPage>
  );
}
