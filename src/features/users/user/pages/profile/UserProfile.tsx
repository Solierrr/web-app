import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/components/layout/profile/ProfilePage";
import ProfilePageSkeleton from "@/components/layout/profile/ProfilePageSkeleton";
import { ProfileEditForm, ProfileInfoRow, ProfileInfoSection } from "@/components/layout/profile/ProfilePage.reusable";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getUser } from "@/features/users/user/user.service";
import type { User } from "@/features/users/user/user";

const OWN_USER_ID = "user-1";

interface UserProfilePackedProps {
  user: User;
}

function UserProfilePacked({ user: initialUser }: UserProfilePackedProps) {
  const { t } = useTranslation("profile", { keyPrefix: "user" });
  const { t: commons } = useTranslation("commons");
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);

  function saveProfile(values: Record<string, string>) {
    setUser((current) => ({
      ...current,
      name: values.name,
      avatar: values.avatar || undefined,
      bannerUrl: values.banner || undefined,
      contact: {
        ...current.contact,
        email: values.email,
        number: values.phone,
      },
    }));
    setEditing(false);
  }

  return (
    <ProfilePage
      bannerUrl={user.bannerUrl}
      avatarUrl={user.avatar}
      name={user.name}
      subtitle={user.contact?.email}
      eyebrow={t("kind")}
      actions={
        <PrimaryButton
          content={commons(editing ? "actions.cancel" : "actions.edit")}
          description={commons(editing ? "actions.cancel" : "actions.edit")}
          rounded
          onClick={() => setEditing((current) => !current)}
        />
      }>
      {editing ? (
        <ProfileEditForm
          title={t("editTitle")}
          fields={[
            { name: "name", label: t("fields.name"), value: user.name },
            { name: "email", label: t("fields.email"), value: user.contact?.email ?? "", type: "email" },
            { name: "phone", label: t("fields.phone"), value: user.contact?.number ?? "", type: "tel" },
            { name: "avatar", label: t("fields.avatar"), value: user.avatar ?? "", type: "url" },
            { name: "banner", label: t("fields.banner"), value: user.bannerUrl ?? "", type: "url" },
          ]}
          onCancel={() => setEditing(false)}
          onSave={saveProfile}
        />
      ) : (
        <ProfileInfoSection title={t("contactTitle")} description={t("contactDescription")}>
          <dl className="divide-y divide-black/8">
            <ProfileInfoRow label={t("fields.email")} value={user.contact?.email} />
            <ProfileInfoRow label={t("fields.phone")} value={user.contact?.number} />
          </dl>
        </ProfileInfoSection>
      )}
    </ProfilePage>
  );
}

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    getUser(OWN_USER_ID).then((result) => {
      if (active) setUser(result);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!user) return <ProfilePageSkeleton />;
  return <UserProfilePacked user={user} />;
}
