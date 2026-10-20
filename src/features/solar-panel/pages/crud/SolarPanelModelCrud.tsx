import FormError from "@@/feedback/toast/FormError";
import FieldFeedback from "@@/feedback/field-feedback/FieldFeedback";
import { getHttpErrorMessage } from "@/lib/shared/http/http.service";
import { firstInvalidField, clearFieldValidity } from "@/lib/shared/forms/form.utils";
import BrandSelect from "@/features/brands/select/BrandSelect";
import { listModelPhotos, uploadModelPhoto, deleteModelPhoto, type ModelPhoto } from "@/features/solar-panel/solarPanel.photo.service";
import ConfirmedAction from "@@/overlay/confirmation/ConfirmedAction";
import OperationalForm, { FormSection } from "@@/layout/operational-page/OperationalForm";
import Surface from "@@/ui/surface/Surface";
import TableHeading from "@@/ui/table-heading/TableHeading";
import ValueField from "@@/ui/value-field/ValueField";
import { compareValue } from "@@/ui/value-field/ValueField.utils";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import ModelRowActions from "./SolarPanelModelCrud.actions";
import ModelTableToolbar from "./SolarPanelModelCrud.toolbar";
import ModelFiltersPanel from "./SolarPanelModelCrud.filters";
import {
  EMPTY_FILTERS,
  MODEL_NUMERIC_FIELDS,
  MODEL_TABLE_COLUMNS,
  selectModels,
  modelReferences,
  modelNumber,
} from "./SolarPanelModelCrud.table.utils";
import type { ModelFilters, ModelSort, ModelSortField } from "./SolarPanelModelCrud.table";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import Input from "@@/ui/input/Input";
import InputGroup from "@@/ui/input-group/InputGroup";
import ImageInput from "@@/ui/image-input/ImageInput";
import Breadcrumbs from "@@/ui/breadcrumbs/Breadcrumbs";
import Tooltip from "@@/feedback/tooltip/Tooltip";
import Alert from "@@/feedback/alert/Alert";
import { notify } from "@@/feedback/toast/Toast.utils";
import Select from "@@/ui/select/Select";
import { PrimaryButton, WhiteSolidButton } from "@@/ui/button/Button.presets";
import Pagination from "@@/ui/pagination/Pagination";
import StatusField from "@@/ui/status-field/StatusField";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { listSolarPanelModels, createSolarPanel, updateSolarPanel, deleteSolarPanel } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanel } from "@/features/solar-panel/solarPanel";
import { SolarPanelType } from "@/features/solar-panel/solarPanel.enum";
import type { SolarPanelModelForm } from "./SolarPanelModelCrud.form";
import { EMPTY_DIMENSION, EMPTY_FORM, toModelForm, toModelValue } from "@/features/solar-panel/pages/crud/SolarPanelModelCrud.utils";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { SolarPanelModelStatus } from "@/features/solar-panel/solarPanel.enum";

interface SolarPanelModelCrudTableProps {
  items: SolarPanel[];
  t: TFunction;
  onEdit: (item: SolarPanel) => void;
  onDelete: (id: string) => Promise<void>;
  references: ReturnType<typeof modelReferences>;
  indicatorsVisible: boolean;
}

function ModelTableCell({
  children,
  className = "",
  pinned = false,
  colSpan,
}: {
  children: ReactNode;
  className?: string;
  pinned?: boolean;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`h-20 border-b border-operational-border p-0 align-middle whitespace-nowrap ${pinned ? "sticky right-0 z-10 bg-operational-surface" : ""}`}>
      <div className="flex h-[79px] min-w-0 items-center px-4 py-4">
        <div className={`scrollbar-none max-h-full min-w-0 w-full overflow-auto ${className}`}>{children}</div>
      </div>
    </td>
  );
}

function SolarPanelModelCrudTable({ items, t, onEdit, onDelete, references, indicatorsVisible }: SolarPanelModelCrudTableProps) {
  const { company, can = () => false } = useActiveContext();
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const [deletingId, setDeletingId] = useState<string | null>(null);
  async function remove(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await onDelete(id);
      notify(t("table.removed"));
    } catch (error) {
      notify(getHttpErrorMessage(error, t("table.removeError")));
    } finally {
      setDeletingId(null);
    }
  }
  const mutable = (item: SolarPanel) =>
    isAlwaysMockMode() || (item.creatorCompanyId === company?.id && item.status === SolarPanelModelStatus.UNDERANALYSIS);
  const number = (value: number | undefined, unit: string) =>
    value == null ? "" : `${new Intl.NumberFormat(lang, { maximumFractionDigits: 3 }).format(value)} ${unit}`;
  return (
    <tbody className="[&_tr:last-child>td]:border-b-0">
      {items.map((item) => (
        <tr key={item.id} className="border-b border-operational-border last:border-b-0 transition-colors hover:bg-operational-surface">
          <ModelTableCell>{item.brand || ""}</ModelTableCell>
          <ModelTableCell>
            {item.model && (
              <Link
                to={`${routePaths.solarPanelModelsCrud(lang)}/${encodeURIComponent(item.id)}`}
                className="font-medium text-operational-ink hover:underline underline-offset-4">
                {item.model || ""}
              </Link>
            )}
          </ModelTableCell>
          <ModelTableCell>{item.type && <ValueField>{item.type}</ValueField>}</ModelTableCell>
          {MODEL_NUMERIC_FIELDS.map((field) => {
            const unit = field === "power" ? "Wp" : field === "efficiency" ? "%" : field === "weight" ? "kg" : "m";
            const raw = modelNumber(item, field);
            const value = raw != null && Number.isFinite(raw) ? number(raw, unit) : "";
            const reference = item.type ? references.get(item.type)?.[field] : undefined;
            const comparison = indicatorsVisible ? compareValue(raw, reference) : undefined;
            const label =
              comparison && reference
                ? t("table.comparison", {
                    value,
                    direction: t(`table.${comparison.direction}`),
                    mean: number(reference.mean, unit),
                    count: reference.count,
                    type: item.type,
                    difference: number(Math.abs(comparison.difference), field === "efficiency" ? t("table.percentagePoints") : unit),
                  })
                : undefined;
            return (
              <ModelTableCell key={field} className="whitespace-nowrap tabular-nums">
                {value && (
                  <ValueField
                    comparison={
                      comparison && label
                        ? {
                            ...comparison,
                            label,
                            representation: field === "width" || field === "length" ? "range" : "direction",
                            favorable: field === "efficiency" && comparison.direction === "above",
                          }
                        : undefined
                    }>
                    {value}
                  </ValueField>
                )}
              </ModelTableCell>
            );
          })}
          <ModelTableCell>
            {item.status && (
              <StatusField
                state={
                  item.status === SolarPanelModelStatus.APPROVED
                    ? "approved"
                    : item.status === SolarPanelModelStatus.REJECTED
                      ? "rejected"
                      : "pending"
                }
                label={t(`statuses.${item.status}`)}
              />
            )}
          </ModelTableCell>
          <ModelTableCell pinned>
            <ModelRowActions
              name={`${item.brand ?? ""} ${item.model ?? ""}`.trim() || item.id}
              detailsPath={`${routePaths.solarPanelModelsCrud(lang)}/${encodeURIComponent(item.id)}`}
              editable={mutable(item) && can("PUT /api/models/{id}")}
              removable={mutable(item) && can("DELETE /api/models/{id}")}
              disabled={deletingId !== null}
              onEdit={() => onEdit(item)}
              onRemove={() => remove(item.id)}
            />
          </ModelTableCell>
        </tr>
      ))}
    </tbody>
  );
}

function SolarPanelModelCrudTableSkeleton() {
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  return (
    <tbody aria-busy="true" className="[&_tr:last-child>td]:border-b-0">
      {Array.from({ length: 3 }, (_, row) => (
        <tr key={row}>
          <ModelTableCell colSpan={MODEL_TABLE_COLUMNS.length - 1}>
            <Skeleton height="1.25rem" width="100%" className="rounded-small" />
          </ModelTableCell>
          <ModelTableCell pinned>
            <div className="flex justify-end">
              <ToolbarAction icon="more" label={t("actions.loadingOptions")} className="h-8! w-10!" disabled />
            </div>
          </ModelTableCell>
        </tr>
      ))}
    </tbody>
  );
}

export default function SolarPanelModelCrud() {
  const { lang: parameter } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company, can = () => false } = useActiveContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const editQuery = searchParams.get("edit");
  const consumedEdit = useRef<string | null>(null);
  const { t } = useTranslation("crud", { keyPrefix: "solarPanelModel" });
  const [items, setItems] = useState<SolarPanel[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SolarPanelModelForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [invalidField, setInvalidField] = useState<string | null>(null);
  const fieldFeedback = (name: string) => (
    <FieldFeedback
      id={`model-${name}-error`}
      message={invalidField === name ? t(name === "brandId" ? "brands:chooseRequired" : "brands:fieldInvalid") : null}
    />
  );
  const [photos, setPhotos] = useState<ModelPhoto[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [primaryFiles, setPrimaryFiles] = useState<File[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<ModelSort | null>(null);
  const [filters, setFilters] = useState<ModelFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const request = useRef({ version: 0 });
  const filtered = !!(
    filters.query?.trim() ||
    filters.type ||
    filters.status ||
    Object.values(filters.ranges).some((range) => range.min || range.max)
  );
  async function refresh() {
    if (refreshing) return;
    const version = ++request.current.version;
    setRefreshing(true);
    try {
      const result = await listSolarPanelModels();
      if (version !== request.current.version) return;
      setItems(result);
      notify(t("table.refreshed"));
    } catch (error) {
      if (version === request.current.version) notify(getHttpErrorMessage(error, t("table.refreshError")));
    } finally {
      if (version === request.current.version) setRefreshing(false);
    }
  }
  const selectedItems = useMemo(() => (items ? selectModels(items, filters, sort) : null), [items, filters, sort]);
  const references = useMemo(() => modelReferences(items ?? []), [items]);
  const [indicatorsVisible, setIndicatorsVisible] = useState(true);
  const currentPage = Math.min(page, Math.max(1, Math.ceil((selectedItems?.length ?? 0) / 5)));
  const visibleItems = selectedItems?.slice((currentPage - 1) * 5, currentPage * 5);
  function changeSort(field: ModelSortField) {
    setSort(sort?.field !== field ? { field, direction: "asc" } : sort.direction === "asc" ? { field, direction: "desc" } : null);
    setPage(1);
  }

  useEffect(() => {
    const requests = request.current;
    const version = ++requests.version;
    listSolarPanelModels()
      .then((result) => {
        if (version === request.current.version) {
          setItems(result);
          if (editQuery && consumedEdit.current !== editQuery) {
            consumedEdit.current = editQuery;
            const item = result.find((model) => model.id === editQuery);
            if (
              item &&
              can("PUT /api/models/{id}") &&
              (isAlwaysMockMode() || (item.creatorCompanyId === company?.id && item.status === SolarPanelModelStatus.UNDERANALYSIS))
            )
              startEdit(item);
            else notify(t("brands:permissionDenied"));
          }
        }
      })
      .catch((error) => {
        if (version === request.current.version) notify(getHttpErrorMessage(error, t("table.refreshError")));
      });
    return () => {
      ++requests.version;
    };
  }, [t, editQuery, company?.id, can]);

  useEffect(() => {
    if (!editingId || !formOpen) return;
    let active = true;
    listModelPhotos(editingId)
      .then((result) => {
        if (active) setPhotos((current) => [...new Map([...result, ...current].map((photo) => [photo.id, photo])).values()]);
      })
      .catch((error) => {
        if (active) setPhotoError(getHttpErrorMessage(error, t("photos.loadError")));
      })
      .finally(() => {
        if (active) setPhotosLoading(false);
      });
    return () => {
      active = false;
    };
  }, [editingId, formOpen, t]);

  function startCreate() {
    setFiles([]);
    setPrimaryFiles([]);
    setPhotos([]);
    setPhotosLoading(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setInvalidField(null);
    setPhotoError(null);
    setFormOpen(true);
  }

  function startEdit(item: SolarPanel) {
    setFiles([]);
    setPrimaryFiles([]);
    setPhotos([]);
    setPhotosLoading(true);
    setFormOpen(true);
    setError(null);
    setInvalidField(null);
    setPhotoError(null);
    setEditingId(item.id);
    setForm(toModelForm(item));
  }

  async function handleSave() {
    if (saving) return;
    if (!form.brandId) {
      setInvalidField("brandId");
      document.querySelector<HTMLInputElement>('[name="brandId"]')?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    setInvalidField(null);
    setPhotoError(null);
    let uploading = false;
    try {
      let savedId = editingId;
      if (editingId) {
        const updated = await updateSolarPanel(editingId, toModelValue(form));
        setItems((current) => (current ? current.map((item) => (item.id === editingId ? updated : item)) : current));
      } else {
        const created = await createSolarPanel(toModelValue(form));
        savedId = created.id;
        setEditingId(created.id);
        setItems((current) => (current ? [...current, created] : [created]));
        setPage(Math.ceil(((items?.length ?? 0) + 1) / 5));
      }
      const uploads = [...primaryFiles.map((file) => ({ file, primary: true })), ...files.map((file) => ({ file, primary: false }))];
      uploading = uploads.length > 0;
      for (const [index, { file, primary }] of uploads.entries()) {
        setUploadProgress(t("photos.uploading", { current: index + 1, total: uploads.length }));
        const uploaded = await uploadModelPhoto(savedId!, file, primary);
        setPhotos((current) => [
          ...new Map(
            [...current.map((photo) => (primary ? { ...photo, primary: false } : photo)), { ...uploaded, primary }].map((photo) => [photo.id, photo]),
          ).values(),
        ]);
        if (primary) setPrimaryFiles((current) => current.filter((item) => item !== file));
        else setFiles((current) => current.filter((item) => item !== file));
      }
      setFormOpen(false);
      setEditingId(null);
      setFiles([]);
      setPrimaryFiles([]);
      clearEditQuery();
      notify(t("saved"));
    } catch (error) {
      if (uploading) setPhotoError(getHttpErrorMessage(error, t("photos.error")));
      else setError(getHttpErrorMessage(error, t("saveError")));
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  }

  async function handleDelete(id: string) {
    await deleteSolarPanel(id);
    setItems((current) => (current ? current.filter((item) => item.id !== id) : current));
    if (editingId === id) {
      setEditingId(null);
      setFormOpen(false);
    }
  }

  function clearEditQuery() {
    if (!editQuery) return;
    const next = new URLSearchParams(searchParams);
    next.delete("edit");
    setSearchParams(next, { replace: true });
    consumedEdit.current = null;
  }

  function closeForm() {
    clearEditQuery();
    setFormOpen(false);
    setEditingId(null);
    setError(null);
    setInvalidField(null);
    setPhotoError(null);
    setFiles([]);
    setPrimaryFiles([]);
  }

  return (
    <OperationalPage
      title={formOpen ? (editingId ? t("editHeading") : t("createHeading")) : t("title")}
      description={t("description")}
      centered
      sideBackground
      form={formOpen}
      formBackground={formOpen}
      formWidth="comfortable"
      breadcrumbs={
        formOpen ? (
          <Breadcrumbs
            label={t("navigation")}
            disabled={saving}
            items={[
              { label: t("title"), to: routePaths.solarPanelModelsCrud(lang), onClick: closeForm },
              { label: editingId ? t("editHeading") : t("createHeading") },
            ]}
          />
        ) : undefined
      }
      actions={
        !formOpen && can("POST /api/models") ? (
          <PrimaryButton
            variant="soft"
            content={t("actions.addModel")}
            description={t("actions.addModel")}
            onClick={startCreate}
            className="min-h-12"
          />
        ) : undefined
      }>
      <div className="flex flex-col gap-8">
        {formOpen && (editingId ? can("PUT /api/models/{id}") : can("POST /api/models")) && (
          <OperationalForm
            plain
            tone="tonal"
            noValidate
            className="gap-4!"
            autoComplete="off"
            onInvalidCapture={(event) => event.preventDefault()}
            onChangeCapture={(event) => {
              const name = clearFieldValidity(event.target);
              if (name === invalidField) setInvalidField(null);
            }}
            onSubmit={(event) => {
              event.preventDefault();
              const invalid = firstInvalidField(event.currentTarget, t("brands:positiveRequired"));
              if (invalid) {
                setInvalidField(invalid.name);
                return;
              }
              setInvalidField(null);
              void handleSave();
            }}>
            <div className="flex flex-col gap-5 rounded-surface bg-surface-container-low p-5 sm:p-6">
              <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                {t("fields.brand")}
                <BrandSelect
                  presentation="dialog"
                  label={t("fields.brand")}
                  value={form.brandId ?? ""}
                  selectedName={form.brand}
                  invalid={invalidField === "brandId"}
                  errorId={invalidField === "brandId" ? "model-brandId-error" : undefined}
                  onChange={(brandId, brand) => setForm({ ...form, brandId, brand })}
                />
                {fieldFeedback("brandId")}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                {t("fields.model")}
                <Input
                  aria-invalid={invalidField === "model"}
                  aria-describedby={invalidField === "model" ? "model-model-error" : undefined}
                  name="model"
                  maxLength={255}
                  required
                  placeholder={t("fields.model")}
                  aria-label={t("fields.model")}
                  value={form.model}
                  onChange={(event) => setForm({ ...form, model: event.target.value })}
                  className="w-full"
                />
                {fieldFeedback("model")}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                {t("fields.type")}
                <Select
                  name={t("fields.type")}
                  clearable={false}
                  placeholder={t("fields.type")}
                  aria-label={t("fields.type")}
                  value={form.type}
                  options={Object.values(SolarPanelType)}
                  onChange={(value) => {
                    if (value) setForm({ ...form, type: value as SolarPanelType });
                  }}
                  className="w-full"
                />
              </label>
            </div>
            <FormSection variant="tonal" title={t("sections.technical")} collapsible defaultExpanded={false}>
              <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                {t("fields.powerOutput")}
                <Input
                  aria-invalid={invalidField === "powerOutput"}
                  aria-describedby={invalidField === "powerOutput" ? "model-powerOutput-error" : undefined}
                  name="powerOutput"
                  type="number"
                  required
                  min={0}
                  step="any"
                  suffix="Wp"
                  placeholder={t("placeholders.powerOutput")}
                  aria-label={`${t("fields.powerOutput")} (Wp)`}
                  value={form.powerOutput}
                  onChange={(event) => setForm({ ...form, powerOutput: event.target.value })}
                  className="w-full"
                />
                {fieldFeedback("powerOutput")}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                {t("fields.efficiency")}
                <Input
                  aria-invalid={invalidField === "efficiency"}
                  aria-describedby={invalidField === "efficiency" ? "model-efficiency-error" : undefined}
                  name="efficiency"
                  max={100}
                  type="number"
                  required
                  min={0}
                  step="any"
                  suffix="%"
                  placeholder={t("placeholders.efficiency")}
                  aria-label={`${t("fields.efficiency")} (%)`}
                  value={form.efficiency}
                  onChange={(event) => setForm({ ...form, efficiency: event.target.value })}
                  className="w-full"
                />
                {fieldFeedback("efficiency")}
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                {t("fields.weight")}
                <Input
                  aria-invalid={invalidField === "weight"}
                  aria-describedby={invalidField === "weight" ? "model-weight-error" : undefined}
                  name="weight"
                  type="number"
                  required
                  min={0}
                  step="any"
                  suffix="kg"
                  placeholder={t("placeholders.weight")}
                  aria-label={`${t("fields.weight")} (kg)`}
                  value={form.weight}
                  onChange={(event) => setForm({ ...form, weight: event.target.value })}
                  className="w-full"
                />
                {fieldFeedback("weight")}
              </label>
            </FormSection>
            <FormSection variant="tonal" title={t("dimensions")} collapsible defaultExpanded={false}>
              <InputGroup label={t("dimensions")} hideLabel>
                <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                  {t("fields.width")}
                  <Input
                    aria-invalid={invalidField === "width"}
                    aria-describedby={invalidField === "width" ? "model-width-error" : undefined}
                    name="width"
                    type="number"
                    required
                    min={0}
                    step="any"
                    suffix="m"
                    placeholder={t("placeholders.width")}
                    aria-label={`${t("fields.width")} (m)`}
                    value={form.dimension?.width}
                    onChange={(event) => setForm({ ...form, dimension: { ...(form.dimension ?? EMPTY_DIMENSION), width: event.target.value } })}
                    className="w-full"
                  />
                  {fieldFeedback("width")}
                </label>
                <label className="flex min-w-0 flex-col gap-2 text-body font-medium">
                  {t("fields.length")}
                  <Input
                    aria-invalid={invalidField === "length"}
                    aria-describedby={invalidField === "length" ? "model-length-error" : undefined}
                    name="length"
                    type="number"
                    required
                    min={0}
                    step="any"
                    suffix="m"
                    placeholder={t("placeholders.length")}
                    aria-label={`${t("fields.length")} (m)`}
                    value={form.dimension?.length}
                    onChange={(event) => setForm({ ...form, dimension: { ...(form.dimension ?? EMPTY_DIMENSION), length: event.target.value } })}
                    className="w-full"
                  />
                  {fieldFeedback("length")}
                </label>
              </InputGroup>
            </FormSection>

            <FormSection
              variant="tonal"
              title={t("photos.title")}
              collapsible
              defaultExpanded={false}
              titleAccessory={<Tooltip label={t("photos.help")} content={t("photos.hint")} />}>
              <h3 className="text-body font-medium">{t("photos.primary")}</h3>
              {can("POST /api/model-photos") && (
                <ImageInput
                  name="primaryPhoto"
                  multiple={false}
                  files={primaryFiles}
                  onChange={setPrimaryFiles}
                  onError={setPhotoError}
                  label={t("photos.addPrimary")}
                  removeLabel={t("photos.removeSelection")}
                  invalidMessage={t("photos.invalid")}
                  summary={t("photos.selected", { count: primaryFiles.length })}
                  disabled={saving}
                />
              )}
              {photos
                .filter((photo) => photo.primary)
                .map((photo) => (
                  <div key={photo.id} className="flex items-center gap-3">
                    <img src={photo.url} alt={t("photos.primary")} className="size-28 rounded-medium bg-input-bg object-contain" />
                    {can("DELETE /api/model-photos/{id}") && (
                      <ConfirmedAction
                        label={t("actions.remove")}
                        name={t("photos.primary")}
                        onConfirm={async () => {
                          await deleteModelPhoto(photo.id);
                          setPhotos((current) => current.filter((item) => item.id !== photo.id));
                        }}
                      />
                    )}
                  </div>
                ))}
              <h3 className="text-body font-medium">{t("photos.gallery")}</h3>
              {can("POST /api/model-photos") && (
                <ImageInput
                  name="photos"
                  files={files}
                  onChange={setFiles}
                  onError={setPhotoError}
                  label={t("photos.add")}
                  removeLabel={t("photos.removeSelection")}
                  invalidMessage={t("photos.invalid")}
                  summary={t("photos.selected", { count: files.length })}
                  progress={uploadProgress}
                  disabled={saving}
                />
              )}
              {photosLoading && <Skeleton height="6rem" width="100%" />}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos
                  .filter((photo) => !photo.primary)
                  .map((photo) => (
                    <div key={photo.id} className="flex flex-col gap-2">
                      <img src={photo.url} alt={`${form.brand} ${form.model}`} className="h-28 w-full rounded-medium object-contain bg-input-bg" />
                      {can("DELETE /api/model-photos/{id}") && (
                        <ConfirmedAction
                          label={t("actions.remove")}
                          name={`${form.brand} ${form.model}`}
                          onConfirm={async () => {
                            await deleteModelPhoto(photo.id);
                            setPhotos((current) => current.filter((item) => item.id !== photo.id));
                          }}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </FormSection>
            <FormError message={photoError} />
            <div className="grid grid-cols-2 gap-3 pt-3">
              <WhiteSolidButton
                type="button"
                content={t("actions.cancel")}
                description={t("actions.cancelDescription")}
                className="w-full min-h-12"
                disabled={saving}
                onClick={closeForm}
              />
              <PrimaryButton
                variant="soft"
                content={saving ? t("actions.saving") : editingId ? t("actions.save") : t("actions.add")}
                description={t("actions.saveDescription")}
                type="submit"
                className="w-full min-h-12"
                disabled={saving}
              />
            </div>
            <FormError message={error} />
          </OperationalForm>
        )}

        {!formOpen && (
          <>
            <ModelFiltersPanel
              value={filters}
              open={filtersOpen}
              disabled={!items}
              onChange={(value) => {
                setFilters(value);
                setPage(1);
              }}
            />
            {indicatorsVisible && (
              <div className="mx-auto flex w-full flex-wrap items-center gap-2 text-body text-operational-muted lg:w-[85%]">
                <span>{t("table.indicatorsLegend")}</span>
                <Tooltip
                  label={t("table.indicatorsHelp")}
                  content={
                    <div className="scrollbar-none flex max-h-64 flex-col gap-3 overflow-auto">
                      <p>{t("table.indicatorsExplanation")}</p>
                      {[...references].map(([type, fields]) => (
                        <div key={type} className="flex flex-col gap-1">
                          <p className="font-semi-bold">{type}</p>
                          {MODEL_NUMERIC_FIELDS.map((field) => {
                            const reference = fields[field];
                            if (!reference || reference.count < 2) return null;
                            const unit = field === "power" ? "Wp" : field === "efficiency" ? "%" : field === "weight" ? "kg" : "m";
                            const format = (value: number) => `${new Intl.NumberFormat(lang, { maximumFractionDigits: 3 }).format(value)} ${unit}`;
                            return (
                              <p key={field}>
                                {t("table.referenceSummary", { field: t(`table.${field}`), mean: format(reference.mean), count: reference.count })}
                              </p>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  }
                />
              </div>
            )}
            <Surface className="mx-auto w-full max-w-full lg:w-[85%]">
              <div role="region" aria-label={t("title")} tabIndex={0} className="scrollbar-none overflow-x-auto">
                <table
                  aria-label={t("title")}
                  aria-busy={items === null || refreshing}
                  className="table-auto w-max min-w-full border-separate border-spacing-0 text-left text-body text-operational-ink">
                  <thead className="bg-operational-surface">
                    <tr className="text-operational-muted">
                      {MODEL_TABLE_COLUMNS.map(({ key }) => {
                        if (key === "actions")
                          return (
                            <th key={key} scope="col" className="sticky right-0 z-20 bg-operational-surface px-4 py-3 text-left font-medium">
                              <div className="flex items-center gap-2">
                                <ModelTableToolbar
                                  indicatorsVisible={indicatorsVisible}
                                  onIndicators={() => setIndicatorsVisible((visible) => !visible)}
                                  filtered={filtered}
                                  searchVisible={filtersOpen}
                                  disabled={!items}
                                  refreshing={refreshing}
                                  onFilters={() => setFiltersOpen((value) => !value)}
                                  onClearFilters={() => {
                                    setFilters(EMPTY_FILTERS);
                                    setPage(1);
                                  }}
                                  onRefresh={() => {
                                    void refresh();
                                  }}
                                />
                              </div>
                            </th>
                          );
                        const sortable = MODEL_NUMERIC_FIELDS.includes(key as ModelSortField);
                        return (
                          <TableHeading
                            key={key}
                            label={t(`table.${key}`)}
                            disabled={!items}
                            direction={sort?.field === key ? sort.direction : undefined}
                            onSort={sortable ? () => changeSort(key as ModelSortField) : undefined}
                          />
                        );
                      })}
                    </tr>
                  </thead>
                  {items ? (
                    <SolarPanelModelCrudTable
                      items={visibleItems ?? []}
                      t={t}
                      onEdit={startEdit}
                      onDelete={handleDelete}
                      references={references}
                      indicatorsVisible={indicatorsVisible}
                    />
                  ) : (
                    <SolarPanelModelCrudTableSkeleton />
                  )}
                </table>
              </div>
              {selectedItems?.length === 0 && (
                <p className="py-8 text-center text-operational-muted">{items?.length ? t("filters.empty") : t("empty")}</p>
              )}
              {items && (
                <div className="border-t border-operational-border">
                  <Pagination
                    page={currentPage}
                    total={selectedItems?.length ?? 0}
                    pageSize={5}
                    summaryMode="pages"
                    appearance="borderless"
                    onPageChange={setPage}
                  />
                </div>
              )}
            </Surface>
          </>
        )}
      </div>
    </OperationalPage>
  );
}
