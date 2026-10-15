import { CepInput, UfInput } from "@@/ui/input/Input.presets";
import OperationalTable from "@@/layout/operational-page/OperationalTable";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import { PrimaryButton, WhiteButton } from "@@/ui/button/Button.presets";
import { NativeSelect as Select } from "@@/ui/select/Select";
import Input from "@@/ui/input/Input";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";

import { useActiveContext } from "@/lib/shared/context/ActiveContext";
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
  const { t: tCommon } = useTranslation("commons");
  const companyId = company?.id;

  const [requesterId, setRequesterId] = useState<string | null>(null);
  const [units, setUnits] = useState<LocalUnit[] | null>(null);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(id: string) {
    const editing = can("POST /api/local-units") || can("PUT /api/local-units/{id}");
    const [requester, companyUnits] = await Promise.all([editing ? getMyRequester(id) : Promise.resolve(null), listCompanyUnits(id)]);
    return { requesterId: requester?.id ?? null, units: companyUnits };
  }

  function apply(data: Awaited<ReturnType<typeof load>>) {
    setRequesterId(data.requesterId);
    setUnits(data.units);
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
    setCoordinates(null);
  }

  function startEdit(unit: LocalUnit) {
    setFormOpen(true);
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
      await deleteUnit(id);
      await reload(companyId);
    } catch {
      throw new Error(t("error"));
    }
  }

  if (error && !units)
    return (
      <OperationalPage title={t("title")} centered sideBackground>
        <p role="alert">{t("error")}</p>
      </OperationalPage>
    );
  if (contextLoading || !units) return <OperationalPage title={t("title")} loading />;

  return (
    <OperationalPage
      description={!formOpen ? t("description") : undefined}
      centered
      sideBackground={!formOpen}
      form={formOpen}
      formBackground={formOpen}
      title={formOpen ? (editingId ? t("editHeading") : t("createHeading")) : t("title")}
      actions={
        !formOpen && can("POST /api/local-units") ? (
          <PrimaryButton content={t("createHeading")} description={t("createHeading")} onClick={startCreate} />
        ) : undefined
      }>
      {error ? (
        <p role="alert" className="text-feedback-error">
          {t("error")}
        </p>
      ) : null}

      {formOpen && (editingId ? can("PUT /api/local-units/{id}") : can("POST /api/local-units")) && (
        <section className="flex flex-col gap-3">
          <OperationalForm plain onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-body">
                {t("zipCode")}
                <CepInput
                  name="zipCode"
                  aria-label={t("zipCode")}
                  placeholder={t("zipCode")}
                  value={form.zipCode}
                  onChange={(event) => setForm({ ...form, zipCode: event.target.value })}
                  required
                  className="w-full"
                />
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("state")}
                <UfInput
                  name="state"
                  label={t("state")}
                  value={form.state}
                  onChange={(value) => setForm({ ...form, state: value })}
                  emptyLabel={tCommon("operational.empty")}
                  placeholder="SP"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("city")}
                <Input
                  name="city"
                  aria-label={t("city")}
                  placeholder={t("city")}
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  required
                  className="w-full"
                />
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("neighborhood")}
                <Input
                  name="neighborhood"
                  aria-label={t("neighborhood")}
                  placeholder={t("neighborhood")}
                  value={form.neighborhood}
                  onChange={(event) => setForm({ ...form, neighborhood: event.target.value })}
                  className="w-full"
                />
              </label>
              <label className="col-span-2 flex flex-col gap-1 text-body">
                {t("street")}
                <Input
                  name="street"
                  aria-label={t("street")}
                  placeholder={t("street")}
                  value={form.street}
                  onChange={(event) => setForm({ ...form, street: event.target.value })}
                  required
                  className="w-full"
                />
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("number")}
                <Input
                  name="number"
                  aria-label={t("number")}
                  placeholder={t("number")}
                  value={form.number}
                  onChange={(event) => setForm({ ...form, number: event.target.value })}
                  className="w-full"
                />
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("complement")}
                <Input
                  name="complement"
                  aria-label={t("complement")}
                  placeholder={t("complement")}
                  value={form.complement}
                  onChange={(event) => setForm({ ...form, complement: event.target.value })}
                  className="w-full"
                />
              </label>
              <label className="flex flex-col gap-1 text-body">
                {t("locationType")}
                <Select
                  name="locationType"
                  aria-label={t("locationType")}
                  value={form.locationType}
                  onChange={(event) => setForm({ ...form, locationType: event.target.value as LocalUnit["locationType"] })}
                  className="w-full">
                  <option value="HOUSE">{t("locationTypes.house")}</option>
                  <option value="BUILDING">{t("locationTypes.building")}</option>
                  <option value="COMPLEX">{t("locationTypes.complex")}</option>
                </Select>
              </label>
            </div>

            <FormSection title={t("mapSection")} collapsible defaultExpanded={false}>
              <LocationPicker value={coordinates} onChange={setCoordinates} />
            </FormSection>

            <div className="flex flex-col gap-3">
              <PrimaryButton
                type="submit"
                disabled={saving || !requesterId}
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
          items={units}
          onRefresh={async () => apply(await load(companyId!))}
          getKey={(unit) => unit.id}
          empty={t("empty")}
          columns={[
            {
              key: "address",
              value: (unit) => (unit.address ? `${unit.address.street} ${unit.address.number ?? ""}` : ""),
              label: t("street"),
              render: (unit) => (
                <Link className="font-medium hover:underline" to={`${routePaths.unitsManagement(lang)}/${encodeURIComponent(unit.id)}`}>
                  {unit.address ? `${unit.address.street}, ${unit.address.number ?? "-"}` : t("noAddress")}
                </Link>
              ),
            },
            { key: "city", label: t("city"), render: (unit) => (unit.address ? `${unit.address.city} / ${unit.address.state}` : "—") },
            { key: "zipCode", label: t("zipCode"), render: (unit) => unit.address?.zipCode ?? "—" },
            { key: "type", filterable: true, label: t("locationType"), render: (unit) => t(`locationTypes.${unit.locationType.toLowerCase()}`) },
            {
              key: "actions",
              label: tCommon("operational.actions"),
              render: (unit) => (
                <div className="flex items-center gap-2">
                  <ToolbarAction
                    icon="eye"
                    label={tCommon("actions.view")}
                    to={`${routePaths.unitsManagement(lang)}/${encodeURIComponent(unit.id)}`}
                    backgroundColor="var(--color-input-bg)"
                    className="h-8!"
                  />
                  {can("PUT /api/local-units/{id}") && (
                    <ToolbarAction
                      icon="edit"
                      label={t("edit")}
                      onClick={() => startEdit(unit)}
                      backgroundColor="var(--color-input-bg)"
                      className="h-8!"
                    />
                  )}
                  {can("DELETE /api/local-units/{id}") && (
                    <ConfirmedAction label={t("remove")} name={unit.address?.street ?? t("title")} onConfirm={() => handleDelete(unit.id)} />
                  )}
                </div>
              ),
            },
          ]}
        />
      )}
    </OperationalPage>
  );
}
