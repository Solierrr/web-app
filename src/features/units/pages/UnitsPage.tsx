import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";

import { useActiveContext } from "@/shared/context/ActiveContext";
import {
  createAddress,
  createGeolocalization,
  createUnit,
  deleteUnit,
  getMyRequester,
  listCompanyUnits,
  updateUnit,
  type LocalUnit,
} from "@/features/units/unit.service";
import LocationPicker from "@/features/units/pages/LocationPicker";

interface FormState {
  state: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  locationType: LocalUnit["locationType"];
}

const EMPTY_FORM: FormState = { state: "", city: "", neighborhood: "", zipCode: "", street: "", number: "", complement: "", locationType: "HOUSE" };

export default function UnitsPage() {
  const { t } = useTranslation("commons", { keyPrefix: "unitsManagement" });
  const { company, can = () => false, loading: contextLoading } = useActiveContext();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const companyId = company?.id;

  const [requesterId, setRequesterId] = useState<string | null>(null);
  const [units, setUnits] = useState<LocalUnit[] | null>(null);
  const [error, setError] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload(id: string) {
    try {
      const editing = can("POST /api/local-units") || can("PUT /api/local-units/{id}");
      const [requester, companyUnits] = await Promise.all([editing ? getMyRequester(id) : Promise.resolve(null), listCompanyUnits(id)]);
      setRequesterId(requester?.id ?? null);
      setUnits(companyUnits);
    } catch {
      setError(true);
    }
  }

  useEffect(() => {
    if (!companyId) return;
    void reload(companyId);
  }, [companyId]);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCoordinates(null);
  }

  function startEdit(unit: LocalUnit) {
    setEditingId(unit.id);
    setForm({
      state: unit.address?.state ?? "",
      city: unit.address?.city ?? "",
      neighborhood: unit.address?.neighborhood ?? "",
      zipCode: unit.address?.zipCode ?? "",
      street: unit.address?.street ?? "",
      number: unit.address?.number ?? "",
      complement: unit.complement ?? "",
      locationType: unit.locationType,
    });
    setCoordinates(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!requesterId) return;
    setSaving(true);
    setError(false);
    try {
      const address = await createAddress({
        state: form.state.trim().toUpperCase(),
        city: form.city.trim(),
        neighborhood: form.neighborhood.trim() || undefined,
        zipCode: form.zipCode.replace(/\D/g, ""),
        street: form.street.trim(),
        number: form.number.trim() || undefined,
      });
      if (coordinates) {
        await createGeolocalization(address.id, coordinates.lat, coordinates.lng);
      }
      const payload = {
        requesterId,
        addressId: address.id,
        complement: form.complement.trim() || undefined,
        locationType: form.locationType,
      };
      if (editingId) {
        await updateUnit(editingId, payload);
      } else {
        await createUnit(payload);
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
      await deleteUnit(id);
      await reload(companyId);
    } catch {
      setError(true);
    }
  }

  if (error && !units)
    return (
      <OperationalPage title={t("title")}>
        <p role="alert">{t("error")}</p>
      </OperationalPage>
    );
  if (contextLoading || !units) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage title={t("title")}>
      {error ? (
        <p role="alert" className="text-red-700">
          {t("error")}
        </p>
      ) : null}

      {(editingId ? can("PUT /api/local-units/{id}") : can("POST /api/local-units")) && (
        <section className="flex flex-col gap-3 rounded-small border border-operational-border p-4">
          <h2 className="font-medium">{editingId ? t("editHeading") : t("createHeading")}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-sm">
                {t("zipCode")}
                <input
                  value={form.zipCode}
                  onChange={(event) => setForm({ ...form, zipCode: event.target.value })}
                  required
                  inputMode="numeric"
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("state")}
                <input
                  value={form.state}
                  onChange={(event) => setForm({ ...form, state: event.target.value })}
                  required
                  maxLength={2}
                  className="rounded-small border border-operational-border p-2 uppercase"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("city")}
                <input
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  required
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("neighborhood")}
                <input
                  value={form.neighborhood}
                  onChange={(event) => setForm({ ...form, neighborhood: event.target.value })}
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-sm">
                {t("street")}
                <input
                  value={form.street}
                  onChange={(event) => setForm({ ...form, street: event.target.value })}
                  required
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("number")}
                <input
                  value={form.number}
                  onChange={(event) => setForm({ ...form, number: event.target.value })}
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("complement")}
                <input
                  value={form.complement}
                  onChange={(event) => setForm({ ...form, complement: event.target.value })}
                  className="rounded-small border border-operational-border p-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                {t("locationType")}
                <select
                  value={form.locationType}
                  onChange={(event) => setForm({ ...form, locationType: event.target.value as LocalUnit["locationType"] })}
                  className="rounded-small border border-operational-border p-2">
                  <option value="HOUSE">{t("locationTypes.house")}</option>
                  <option value="BUILDING">{t("locationTypes.building")}</option>
                  <option value="COMPLEX">{t("locationTypes.complex")}</option>
                </select>
              </label>
            </div>

            <LocationPicker value={coordinates} onChange={setCoordinates} />

            <div className="flex gap-2">
              <button type="submit" disabled={saving || !requesterId} className="rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
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
          {units.map((unit) => (
            <li key={unit.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link className="font-medium hover:underline" to={`${routePaths.unitsManagement(lang)}/${encodeURIComponent(unit.id)}`}>
                  {unit.address ? `${unit.address.street}, ${unit.address.number ?? "-"}` : t("noAddress")}
                </Link>
                <p className="text-sm text-gray-600">{unit.address ? `${unit.address.city}/${unit.address.state}` : ""}</p>
              </div>
              <div className="flex gap-2">
                {can("PUT /api/local-units/{id}") && (
                  <button type="button" onClick={() => startEdit(unit)} className="text-sm text-orange">
                    {t("edit")}
                  </button>
                )}
                {can("DELETE /api/local-units/{id}") && (
                  <button type="button" onClick={() => void handleDelete(unit.id)} className="text-sm text-red-700">
                    {t("remove")}
                  </button>
                )}
              </div>
            </li>
          ))}
          {units.length === 0 ? <li className="p-4 text-gray-600">{t("empty")}</li> : null}
        </ul>
      </section>
    </OperationalPage>
  );
}
