import { useTranslation } from "react-i18next";

export default function AdminDashboardPage() {
  const { t } = useTranslation("saas");

  return (
    <main className="mx-auto w-full max-w-7xl">
      <h1>{t("dashboard.title")}</h1>
      <p className="mt-3 text-gray">{t("dashboard.placeholder")}</p>
    </main>
  );
}
