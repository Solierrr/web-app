import { DetailField } from "@@/layout/operational-page/OperationalDetails";
import ToolbarAction from "@@/ui/button/ToolbarAction";
import { getOfferStatus } from "@/features/offers/offer.utils";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listCompanyOffers, type Offer } from "../offer.service";

export default function OfferPage() {
  const { t } = useTranslation("commons", { keyPrefix: "offers" });
  const { t: tSaas } = useTranslation("saas");
  const { offerId, lang: parameter } = useParams<{ offerId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company } = useActiveContext();
  const [offer, setOffer] = useState<Offer | null>(null);
  const requestKey = `${company?.id}:${offerId}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    if (!company) return;
    listCompanyOffers(company.id)
      .then((items) => {
        const item = items.find((entry) => entry.id === offerId);
        if (!item) throw new Error("Offer not found");
        if (active) {
          setOffer(item);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setLoadedKey(requestKey);
        }
      });
    return () => {
      active = false;
    };
  }, [company, offerId, requestKey]);
  const translation = offer?.translations.find((item) => item.locale === lang) ?? offer?.translations[0];
  return (
    <OperationalPage
      title={translation?.title ?? t("title")}
      loading={loading || loadedKey !== requestKey}
      compact
      centered
      sideBackground
      actions={
        <ToolbarAction to={routePaths.offersManagement(lang)} icon="chevronLeft" label={tSaas("details.back")} content={tSaas("details.back")} />
      }>
      {error ? (
        <p role="alert">{tSaas("details.error")}</p>
      ) : (
        offer && (
          <>
            <p>{translation?.description}</p>
            <dl className="grid gap-4 rounded-surface border-ui bg-white shadow-surface p-6 sm:grid-cols-2">
              <DetailField
                label={t("model")}
                value={
                  <>
                    {offer.model.brand} {offer.model.model}
                  </>
                }
              />
              <DetailField
                label={t("unitPrice")}
                value={new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}
              />
              <DetailField label={t("statusLabel")} value={t(`status.${getOfferStatus(offer)}`)} />
              <DetailField label={t("availability")} value={offer.availability} />
              {offer.discountPercentage != null && <DetailField label={t("discountLabel")} value={<>{offer.discountPercentage}%</>} />}
              {offer.expirationDate && <DetailField label={t("expiration")} value={new Date(offer.expirationDate).toLocaleDateString(lang)} />}
              <DetailField label={t("serviceRegions")} value={offer.serviceRegions?.join(", ") || "—"} />
            </dl>
            {translation?.details && <p className="whitespace-pre-wrap">{translation.details}</p>}
          </>
        )
      )}
    </OperationalPage>
  );
}
