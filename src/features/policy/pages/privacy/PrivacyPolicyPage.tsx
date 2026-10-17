import { useTranslation } from "react-i18next";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation("policy");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <h1>{t("privacy")}</h1>
      <p>{t("pending")}</p>
    </main>
  );
}
