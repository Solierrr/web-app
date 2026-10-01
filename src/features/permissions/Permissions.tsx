import { useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  grantPermission,
  listPermissions,
  listPositionPermissions,
  revokePermission,
  type Permission,
  type PositionPermission,
} from "@/features/companies/companyManagement.service";
import { getPermissionTemplate, isPermissionCompatible, permissionTemplates } from "./permissions.utils";

interface PermissionsProps {
  positionId: string;
  companyType: "SUPPLIER" | "DEMANDANT";
  disabled?: boolean;
}

export default function Permissions({ positionId, companyType, disabled = false }: PermissionsProps) {
  const { t } = useTranslation("saas");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [granted, setGranted] = useState<PositionPermission[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<"error" | "saved" | null>(null);
  const templates = permissionTemplates.filter((item) => item.companyTypes.includes(companyType));
  const allowedNames = new Set(templates.flatMap((item) => item.permissions).filter((permission) => isPermissionCompatible(permission, companyType)));

  useEffect(() => {
    let active = true;
    Promise.all([listPermissions(), listPositionPermissions(positionId)])
      .then(([all, links]) => {
        if (!active) return;
        setPermissions(all);
        setGranted(links);
        setSelected(links.map((item) => item.permission.id));
      })
      .catch(() => {
        if (active) setFeedback("error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [positionId]);

  async function save(event: FormEvent) {
    event.preventDefault();
    if (disabled || loading || saving) return;
    setSaving(true);
    setFeedback(null);
    try {
      for (const link of granted) {
        if (!selected.includes(link.permission.id)) await revokePermission(link.id);
      }
      for (const id of selected) {
        if (!granted.some((link) => link.permission.id === id)) await grantPermission(positionId, id);
      }
      setFeedback("saved");
    } catch {
      setFeedback("error");
    } finally {
      try {
        const links = await listPositionPermissions(positionId);
        setGranted(links);
        setSelected(links.map((item) => item.permission.id));
      } catch {
        setFeedback("error");
      }
      setSaving(false);
      window.dispatchEvent(new Event("solaria:context"));
    }
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4" aria-busy={loading || saving}>
      <h2 className="font-semi-bold">{t("permissions.title")}</h2>
      {loading ? (
        <p role="status">{t("shell.loading")}</p>
      ) : (
        <fieldset disabled={disabled || saving || (feedback === "error" && permissions.length === 0)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            {t("permissions.template")}
            <select
              defaultValue=""
              className="rounded-small border border-operational-border p-2"
              onChange={(event) => {
                const template = getPermissionTemplate(event.target.value);
                if (template)
                  setSelected(
                    permissions
                      .filter((item) => allowedNames.has(item.permissionName) && template.permissions.includes(item.permissionName))
                      .map((item) => item.id),
                  );
              }}>
              <option value="">{t("permissions.choose")}</option>
              {templates.map((template) => (
                <option key={template.title} value={template.title}>
                  {template.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-3">
            {permissions
              .filter((item) => allowedNames.has(item.permissionName) || granted.some((link) => link.permission.id === item.id))
              .map((item) => (
                <label key={item.id} className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={(event) => setSelected((value) => (event.target.checked ? [...value, item.id] : value.filter((id) => id !== item.id)))}
                  />
                  <span>{item.name || item.permissionName}</span>
                </label>
              ))}
          </div>
          <button type="submit" className="self-start rounded-small border border-operational-border px-4 py-2 hover:bg-operational-hover">
            {t("permissions.save")}
          </button>
        </fieldset>
      )}
      {feedback && <p role={feedback === "error" ? "alert" : "status"}>{t(`permissions.${feedback}`)}</p>}
    </form>
  );
}
