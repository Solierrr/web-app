import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/access/Access";

export default function ForgotPasswordPage() {
    const { t } = useTranslation("access");

    return (
        <Access
            heading="Solaria"
            helperText={t("forgotPassword.helperText")}
            fields={[
                { name: "email", type: "email", placeholder: t("fields.email.placeholder") },
            ]}
            submitLabel={t("forgotPassword.submit")}
            footer={<p>{t("forgotPassword.rememberedPasswordPrefix")} <Link to="/login" className="text-hyperlink">{t("forgotPassword.backToLogin")}</Link></p>}
        />
    );
}
