import { useTranslation } from "react-i18next";
import Checkbox from "@@/ui/checkbox/Checkbox";

/** Lista de pessoas com caixa de seleção, usada para convidar gente a um grupo ou a uma comunidade. */
export default function PersonChecklist({
  people,
  selected,
  onChange,
  disabled = false,
  empty,
}: {
  people: { id: string; name: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  empty: string;
}) {
  const { t } = useTranslation("chat");
  if (people.length === 0) return <p className="text-body text-operational-muted">{empty}</p>;
  return (
    <ul aria-label={t("selectPeople")} className="scrollbar-none flex max-h-60 flex-col gap-3 overflow-y-auto">
      {people.map((person) => (
        <li key={person.id}>
          <Checkbox
            label={person.name}
            checked={selected.includes(person.id)}
            disabled={disabled}
            onChange={(event) => onChange(event.target.checked ? [...selected, person.id] : selected.filter((id) => id !== person.id))}
          />
        </li>
      ))}
    </ul>
  );
}
