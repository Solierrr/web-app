import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "@/components/ui/button/Button";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("commons");

  return (
    <section>
      <h1>{t("notFound.title")}</h1>
      <h3>{t("notFound.subtitle")}</h3>
      <Button description={t("actions.back")} onClick={() => { navigate("/"); }} />
    </section>
  );
}
