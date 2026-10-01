import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { getMyUser, updateMyUser, type MyUser } from "@/features/users/user/user.service";
import { getAuthSession } from "@/shared/auth/authToken.utils";

export default function UserProfile() {
  const { t } = useTranslation("commons");
  const [user, setUser] = useState<MyUser | null>(null);
  const [username, setUsername] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getMyUser()
      .then((result) => {
        if (!active) return;
        setUser(result);
        setUsername(result.username);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(false);
    try {
      const updated = await updateMyUser(username.trim().toLowerCase());
      setUser(updated);
      setEditing(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  if (!user && !error) return <ProfilePageSkeleton operational />;
  if (!user)
    return (
      <OperationalPage title={t("settings.profile")}>
        <p role="alert">{t("myProfile.loadError")}</p>
      </OperationalPage>
    );

  return (
    <ProfilePage
      operational
      operationalTitle={t("settings.profile")}
      bannerUrl={user.banner ?? undefined}
      avatarUrl={user.avatar ?? undefined}
      name={user.username}
      subtitle={getAuthSession()?.email}
      actions={
        <button type="button" onClick={() => setEditing((current) => !current)} className="rounded-full bg-orange px-4 py-2 text-white">
          {editing ? t("actions.cancel") : t("actions.edit")}
        </button>
      }>
      {editing ? (
        <form onSubmit={handleSave} className="flex max-w-sm flex-col gap-3">
          <label htmlFor="username">{t("myProfile.username")}</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            minLength={3}
            maxLength={30}
            pattern="[a-z0-9_]{3,30}"
            required
            className="rounded-small border border-operational-border p-2"
          />
          <button type="submit" disabled={saving} className="rounded-small bg-orange px-4 py-2 text-white disabled:opacity-50">
            {t("actions.save")}
          </button>
        </form>
      ) : null}
      {error ? (
        <p role="alert" className="text-red-700">
          {t("myProfile.saveError")}
        </p>
      ) : null}
    </ProfilePage>
  );
}
