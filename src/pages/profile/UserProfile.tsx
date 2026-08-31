import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ProfilePage from "@/pages/profile/ProfilePage";
import { PrimaryButton } from "@@/ui/button/Button.presets";
import { getUser } from "@/features/users/user/user.service";
import type { User } from "@/features/users/user/user";

// TODO: substituir pelo id do usuário autenticado quando o login estiver conectado à API real.
const OWN_USER_ID = "user-1";

export default function UserProfile() {
    const { t } = useTranslation("commons");
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        let active = true;

        getUser(OWN_USER_ID).then((result) => {
            if (active) setUser(result);
        });

        return () => { active = false; };
    }, []);

    if (!user) return null;

    return (
        <ProfilePage
            bannerUrl={user.bannerUrl}
            avatarUrl={user.avatar}
            name={user.name}
            subtitle={user.contact?.email}
            actions={
                <PrimaryButton
                    content={t("actions.edit")}
                    description={t("actions.edit")}
                    rounded
                />
            }
        >
            <div className="flex flex-col gap-2">
                {user.contact?.number && <p className="text-input-text">{user.contact.number}</p>}
            </div>
        </ProfilePage>
    );
}
