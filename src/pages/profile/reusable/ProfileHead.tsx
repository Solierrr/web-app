import { useTranslation } from "react-i18next";

interface ProfileHeadProps {
    background?: string;
    profileImage?: string;
}

export function ProfileHead({ background = "/pattern/orange.jpg", profileImage = "reusable" }: ProfileHeadProps) {
    const { t } = useTranslation("profile")

    return (
        <section className="relative h-[40vh] w-full" style={{ backgroundImage: `url(${background})` }}>
            <img className="absolute aspect-square rounded-medium" src={`url(${profileImage})`} alt={t("avatarAlt")} />
        </section>
    );
}