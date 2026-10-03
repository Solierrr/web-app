import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import ProfilePage from "@/lib/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import { getMyUser, updateMyUser, type MyUser } from "@/features/users/user/user.service";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import { isAlwaysMockMode } from "@/config/mocks/mockMode.utils";
import { getOperationalAccount, updateMockProfessionalProfile } from "@/features/access/access.onboarding.service";
import type { MockProfessionalProfile } from "@/features/access/access.onboarding";
import { ProfileEditForm, ProfileInfoRow, ProfileInfoSection, type ProfileEditField } from "@/lib/components/layout/profile/ProfilePage.reusable";

export default function UserProfile() {
  const { t } = useTranslation("commons");
  const { t: tProfile } = useTranslation("profile", { keyPrefix: "edit" });
  const [user, setUser] = useState<MyUser | null>(null);
  const [professionalProfile, setProfessionalProfile] = useState<MockProfessionalProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const mockMode = isAlwaysMockMode();

  useEffect(() => {
    let active = true;
    getMyUser()
      .then((result) => {
        if (!active) return;
        setUser(result);
        const account = getOperationalAccount();
        setProfessionalProfile(account.professional ? (account.professionalProfile ?? null) : null);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSave(values: Record<string, string>) {
    if (!user) return;
    setSaving(true);
    setError(false);
    try {
      const updated = await updateMyUser(values.username.trim().toLowerCase());
      setUser(updated);
      if (mockMode && professionalProfile) {
        const profile = {
          name: values.name.trim(),
          email: values.professionalEmail.trim(),
          phone: values.phone.trim(),
          crea: values.crea.trim(),
          profession: values.profession.trim(),
          council: values.council.trim(),
          registrationNumber: values.registrationNumber.trim(),
          expirationDate: values.expirationDate,
        };
        updateMockProfessionalProfile(profile);
        setProfessionalProfile(profile);
      }
      setEditing(false);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  const fields: ProfileEditField[] = user
    ? [
        {
          name: "username",
          label: tProfile("username"),
          value: user.username,
          required: true,
          minLength: 3,
          maxLength: 30,
          pattern: "[a-z0-9_]{3,30}",
        },
        ...(mockMode && professionalProfile
          ? [
              { name: "name", label: tProfile("name"), value: professionalProfile.name },
              { name: "professionalEmail", label: tProfile("email"), value: professionalProfile.email, type: "email" as const },
              { name: "phone", label: tProfile("phone"), value: professionalProfile.phone, type: "tel" as const },
              { name: "profession", label: tProfile("profession"), value: professionalProfile.profession },
              { name: "crea", label: tProfile("crea"), value: professionalProfile.crea },
              { name: "council", label: tProfile("council"), value: professionalProfile.council },
              { name: "registrationNumber", label: tProfile("registrationNumber"), value: professionalProfile.registrationNumber },
              { name: "expirationDate", label: tProfile("expirationDate"), value: professionalProfile.expirationDate, type: "date" as const },
            ]
          : []),
      ]
    : [];

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
        <button type="button" onClick={() => setEditing((current) => !current)} className="rounded-medium bg-orange px-4 py-2 font-medium text-white">
          {editing ? t("actions.cancel") : t("actions.edit")}
        </button>
      }>
      {editing ? (
        <ProfileEditForm
          title={professionalProfile ? tProfile("professionalTitle") : tProfile("personTitle")}
          fields={fields}
          onCancel={() => setEditing(false)}
          onSave={handleSave}
          saving={saving}
          error={error ? t("myProfile.saveError") : undefined}
          notice={mockMode ? tProfile("mockNotice") : professionalProfile ? tProfile("professionalReadOnly") : undefined}
        />
      ) : null}
      {!editing && (
        <>
          <ProfileInfoSection title={tProfile("personTitle")}>
            <dl className="divide-y divide-black/5">
              <ProfileInfoRow label={tProfile("username")} value={user.username} />
              <ProfileInfoRow label={tProfile("email")} value={professionalProfile?.email || getAuthSession()?.email} />
            </dl>
          </ProfileInfoSection>
          {professionalProfile && (
            <ProfileInfoSection title={tProfile("professionalTitle")}>
              <dl className="divide-y divide-black/5">
                <ProfileInfoRow label={tProfile("name")} value={professionalProfile.name} />
                <ProfileInfoRow label={tProfile("phone")} value={professionalProfile.phone} />
                <ProfileInfoRow label={tProfile("profession")} value={professionalProfile.profession} />
                <ProfileInfoRow label={tProfile("crea")} value={professionalProfile.crea} />
                <ProfileInfoRow label={tProfile("council")} value={professionalProfile.council} />
                <ProfileInfoRow label={tProfile("registrationNumber")} value={professionalProfile.registrationNumber} />
                <ProfileInfoRow label={tProfile("expirationDate")} value={professionalProfile.expirationDate} />
              </dl>
            </ProfileInfoSection>
          )}
        </>
      )}
    </ProfilePage>
  );
}
