import { useTranslation } from "react-i18next";
import EntityCard, { type EntityCardItem } from "@/components/layout/announcement/entity-card/EntityCard";

interface EntityCorridorProps {
  title: string;
  items: EntityCardItem[];
  actionLabel?: string;
  onActionClick?: () => void;
}

/**
 * EntityCorridor
 *
 * Mesma estrutura do `Corridor` (usado para produtos), mas para listas de
 * `EntityCardItem` — profissionais e empresas.
 */
export default function EntityCorridor({ title, items, actionLabel, onActionClick }: EntityCorridorProps) {
  const { t } = useTranslation("commons");
  const resolvedActionLabel = actionLabel ?? t("corridor.viewAll");

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2>{title}</h2>
        <button type="button" onClick={onActionClick} className="cursor-pointer text-input-text">
          {resolvedActionLabel}
        </button>
      </div>

      <div className="flex flex-row gap-6 overflow-x-auto scrollbar-none">
        {items.map((item) => (
          <EntityCard key={item.id} item={item} className="w-40 shrink-0" />
        ))}
      </div>
    </section>
  );
}
