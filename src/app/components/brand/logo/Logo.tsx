import { useTranslation } from "react-i18next";


export default function Logo() {
    // TODO: translation

    const { t } = useTranslation("branding");

    return (
        <img src="" alt={t("")} />
    );
}