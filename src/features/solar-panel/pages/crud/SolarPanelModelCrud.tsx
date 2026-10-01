import { useEffect, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import Select from "@@/ui/select/Select";
import { PrimaryButton, SecondaryButton, IconButton } from "@@/ui/button/Button.presets";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { listSolarPanelModels, createSolarPanel, updateSolarPanel, deleteSolarPanel } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { SolarPanelType } from "@/features/solar-panel/solarPanel.enum";
import { EMPTY_DIMENSION, EMPTY_FORM } from "@/features/solar-panel/pages/crud/SolarPanelModelCrud.utils";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { Link, useParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { useActiveContext } from "@/shared/context/ActiveContext";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";

interface SolarPanelModelCrudTableProps {
  items: SolarPanel[];
  t: TFunction;
  onEdit: (item: SolarPanel) => void;
  onDelete: (id: string) => void;
}

function SolarPanelModelCrudTable({ items, t, onEdit, onDelete }: SolarPanelModelCrudTableProps) {
  const { company, can = () => false } = useActiveContext();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const mutable = (item: SolarPanel) =>
    isAlwaysMockMode() || (item.creatorCompanyId === company?.id && item.status === SolarPanelModelStatus.UNDERANALYSIS);
  return (
    <tbody>
      {items.map((item) => (
        <tr key={item.id} className="border-t border-input-outline">
          <td className="py-2">
            <Link to={`${routePaths.solarPanelModelsCrud(lang)}/${encodeURIComponent(item.id)}`} className="hover:underline">
              {item.brand} {item.model}
            </Link>
          </td>
          <td className="py-2">{item.type}</td>
          <td className="py-2">{item.powerOutput} Wp</td>
          <td className="py-2">{item.status}</td>
          <td className="py-2">
            <div className="flex flex-row justify-end gap-2">
              {mutable(item) && can("PUT /api/models/{id}") && (
                <IconButton icon="settings" description={t("actions.edit")} onClick={() => onEdit(item)} />
              )}
              {mutable(item) && can("DELETE /api/models/{id}") && (
                <IconButton icon="x" description={t("actions.remove")} action={() => onDelete(item.id)} />
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

function SolarPanelModelCrudTableSkeleton() {
  return (
    <tbody aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <tr key={index} className="border-t border-input-outline">
          <td className="py-2">
            <Skeleton height="1.25rem" width="10rem" />
          </td>
          <td className="py-2">
            <Skeleton height="1.25rem" width="8rem" />
          </td>
          <td className="py-2">
            <Skeleton height="1.25rem" width="4rem" />
          </td>
          <td className="py-2">
            <Skeleton height="1.25rem" width="6rem" />
          </td>
          <td className="py-2">
            <div className="flex flex-row justify-end gap-2">
              <Skeleton height="2rem" width="2rem" className="rounded-full" />
              <Skeleton height="2rem" width="2rem" className="rounded-full" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function SolarPanelModelCrud() {
  const { can = () => false } = useActiveContext();
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const [items, setItems] = useState<SolarPanel[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SolarPanel, "id" | "status">>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    listSolarPanelModels().then((result) => {
      if (active) setItems(result);
    });

    return () => {
      active = false;
    };
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(item: SolarPanel) {
    setEditingId(item.id);
    setForm({
      brand: item.brand ?? "",
      model: item.model ?? "",
      type: item.type,
      powerOutput: item.powerOutput ?? 0,
      efficiency: item.efficiency ?? 0,
      dimension: item.dimension ?? EMPTY_DIMENSION,
      weight: item.weight ?? 0,
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateSolarPanel(editingId, form);
        setItems((current) => (current ? current.map((item) => (item.id === editingId ? updated : item)) : current));
      } else {
        const created = await createSolarPanel(form);
        setItems((current) => (current ? [...current, created] : [created]));
      }
      startCreate();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteSolarPanel(id);
    setItems((current) => (current ? current.filter((item) => item.id !== id) : current));
    if (editingId === id) startCreate();
  }

  return (
    <OperationalPage title={t("title")} description={t("description")}>
      <div className="flex flex-col gap-8">
        {(editingId ? can("PUT /api/models/{id}") : can("POST /api/models")) && (
          <div className="flex flex-col gap-4 rounded-medium bg-input-bg p-4">
            <h2>{editingId ? t("editHeading") : t("createHeading")}</h2>

            <div className="flex flex-row flex-wrap gap-4">
              <Input
                name="brand"
                placeholder={t("fields.brand")}
                value={form.brand}
                onChange={(event) => setForm({ ...form, brand: event.target.value })}
              />
              <Input
                name="model"
                placeholder={t("fields.model")}
                value={form.model}
                onChange={(event) => setForm({ ...form, model: event.target.value })}
              />
              <Select
                name="type"
                placeholder={t("fields.type")}
                value={form.type}
                options={Object.values(SolarPanelType)}
                onChange={(value) => setForm({ ...form, type: value as SolarPanelType })}
              />
              <Input
                name="powerOutput"
                type="number"
                placeholder={t("fields.powerOutput")}
                value={form.powerOutput}
                onChange={(event) => setForm({ ...form, powerOutput: Number(event.target.value) })}
              />
              <Input
                name="efficiency"
                type="number"
                placeholder={t("fields.efficiency")}
                value={form.efficiency}
                onChange={(event) => setForm({ ...form, efficiency: Number(event.target.value) })}
              />
              <Input
                name="weight"
                type="number"
                placeholder={t("fields.weight")}
                value={form.weight}
                onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })}
              />
              <Input
                name="width"
                type="number"
                placeholder={t("fields.width")}
                value={form.dimension?.width}
                onChange={(event) => setForm({ ...form, dimension: { ...(form.dimension ?? EMPTY_DIMENSION), width: Number(event.target.value) } })}
              />
              <Input
                name="length"
                type="number"
                placeholder={t("fields.length")}
                value={form.dimension?.length}
                onChange={(event) => setForm({ ...form, dimension: { ...(form.dimension ?? EMPTY_DIMENSION), length: Number(event.target.value) } })}
              />
            </div>

            <div className="flex flex-row gap-2">
              <PrimaryButton
                content={editingId ? t("actions.save") : t("actions.add")}
                description={t("actions.saveDescription")}
                action={handleSave}
                disabled={saving}
              />
              {editingId && <SecondaryButton content={t("actions.cancel")} description={t("actions.cancelDescription")} onClick={startCreate} />}
            </div>
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-input-text">
                <th className="pb-2 font-medium">{t("table.brandModel")}</th>
                <th className="pb-2 font-medium">{t("table.type")}</th>
                <th className="pb-2 font-medium">{t("table.power")}</th>
                <th className="pb-2 font-medium">{t("table.status")}</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            {items ? (
              <SolarPanelModelCrudTable items={items} t={t} onEdit={startEdit} onDelete={handleDelete} />
            ) : (
              <SolarPanelModelCrudTableSkeleton />
            )}
          </table>
        </div>
      </div>
    </OperationalPage>
  );
}
