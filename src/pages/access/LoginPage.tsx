import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Access from "@/components/access/Access";

export default function LoginPage() {
    const { t } = useTranslation("access");

    return (
        <Access
            heading="Solaria"
            helperText={<>{t("login.helperTextPrefix")} <Link to="/" className="text-hyperlink">{t("login.contactSupport")}</Link></>}
            fields={[
                { name: "email", type: "email", placeholder: t("fields.email.placeholder") },
                { name: "password", placeholder: t("fields.password.placeholder"), password: true },
            ]}
            submitLabel={t("login.submit")}
            footer={
                <div className="flex flex-col gap-2">
                    <Link to="/esqueci-senha" className="text-hyperlink">{t("login.forgotPassword")}</Link>
                    <p>{t("login.noAccountPrefix")} <Link to="/cadastro" className="text-hyperlink">{t("login.register")}</Link></p>
                </div>
            }
        />
    );
}
