import { useEffect, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import Select from "@@/ui/select/Select";
import { PrimaryButton, SecondaryButton, IconButton } from "@@/ui/button/Button.presets";
import Skeleton from "@@/feedbacks/skeleton/Skeleton";
import { listSolarPanelModels, createSolarPanel, updateSolarPanel, deleteSolarPanel } from "@/features/products/solar-panel/solarPanel.service";
import type { SolarPanel } from "@/features/products/solar-panel/solarPanel";
import { SolarPanelType, SolarPanelModelStatus } from "@/features/products/solar-panel/solarPanel.enum";
import { EMPTY_DIMENSION, EMPTY_FORM } from "@/pages/crud/SolarPanelModelCrud.utils";
import WrapperLayout from "@/config/WrapperLayout";

interface SolarPanelModelCrudTableProps {
  items: SolarPanel[];
  t: TFunction;
  onEdit: (item: SolarPanel) => void;
  onDelete: (id: string) => void;
}

function SolarPanelModelCrudTable({ items, t, onEdit, onDelete }: SolarPanelModelCrudTableProps) {
  return (
    <tbody>
      {items.map((item) => (
        <tr key={item.id} className="border-t border-input-outline">
          <td className="py-2">
            {item.brand} {item.model}
          </td>
          <td className="py-2">{item.type}</td>
          <td className="py-2">{item.powerOutput} Wp</td>
          <td className="py-2">{item.status}</td>
          <td className="py-2">
            <div className="flex flex-row justify-end gap-2">
              <IconButton icon="settings" description={t("actions.edit")} onClick={() => onEdit(item)} />
              <IconButton icon="x" description={t("actions.remove")} action={() => onDelete(item.id)} />
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
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const [items, setItems] = useState<SolarPanel[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<SolarPanel, "id">>(EMPTY_FORM);
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
      status: item.status,
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
    <WrapperLayout ptop>
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1>{t("title")}</h1>
        <p className="text-black/70">{t("description")}</p>
      </div>

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
          <Select
            name="status"
            placeholder={t("fields.status")}
            value={form.status}
            options={Object.values(SolarPanelModelStatus)}
            onChange={(value) => setForm({ ...form, status: value as SolarPanelModelStatus })}
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
    </WrapperLayout>
  );
}
