import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/access/Access";

export default function RegisterPage() {
    const { t } = useTranslation("access");

    return (
        <Access
            heading="Solaria"
            helperText={t("register.helperText")}
            fields={[
                { name: "name", placeholder: t("fields.name.placeholder") },
                { name: "email", type: "email", placeholder: t("fields.email.placeholder") },
                { name: "password", placeholder: t("fields.password.placeholder"), password: true },
                { name: "confirmPassword", placeholder: t("fields.confirmPassword.placeholder"), password: true },
            ]}
            submitLabel={t("register.submit")}
            footer={<p>{t("register.hasAccountPrefix")} <Link to="/login" className="text-hyperlink">{t("register.login")}</Link></p>}
        />
    );
}
