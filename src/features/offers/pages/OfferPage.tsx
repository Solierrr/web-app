import { getOfferStatus } from "@/features/offers/offer.utils";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OperationalPage from "@@/layout/operational-page/OperationalPage";
import { DEFAULT, isSupportedLanguage } from "@/config/inter/browser/languages";
import { routePaths } from "@/config/inter/paths";
import { useActiveContext } from "@/lib/shared/context/ActiveContext";
import { listCompanyOffers, type Offer } from "../offer.service";

export default function OfferPage() {
  const { t } = useTranslation("commons", { keyPrefix: "offers" });
  const { t: tSaas } = useTranslation("saas");
  const { offerId, lang: parameter } = useParams<{ offerId: string; lang: string }>();
  const lang = isSupportedLanguage(parameter) ? parameter : DEFAULT;
  const { company } = useActiveContext();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    if (!company) return;
    listCompanyOffers(company.id)
      .then((items) => {
        const item = items.find((entry) => entry.id === offerId);
        if (!item) throw new Error("Offer not found");
        if (active) setOffer(item);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [company, offerId]);
  const translation = offer?.translations.find((item) => item.locale === lang) ?? offer?.translations[0];
  return (
    <OperationalPage
      title={translation?.title ?? t("title")}
      loading={loading}
      compact
      actions={<Link to={routePaths.offersManagement(lang)}>{tSaas("details.back")}</Link>}>
      {error ? (
        <p role="alert">{tSaas("details.error")}</p>
      ) : (
        offer && (
          <>
            <p>{translation?.description}</p>
            <dl className="grid gap-4 rounded-small border border-operational-border p-4">
              <div>
                <dt className="text-sm text-operational-muted">{t("model")}</dt>
                <dd>
                  {offer.model.brand} {offer.model.model}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-operational-muted">{t("unitPrice")}</dt>
                <dd>{new Intl.NumberFormat(lang, { style: "currency", currency: "BRL" }).format(offer.unitPrice)}</dd>
              </div>
              <div>
                <dt className="text-sm text-operational-muted">{t("statusLabel")}</dt>
                <dd>{t(`status.${getOfferStatus(offer)}`)}</dd>
              </div>
              <div>
                <dt className="text-sm text-operational-muted">{t("availability")}</dt>
                <dd>{offer.availability}</dd>
              </div>
              {offer.discountPercentage != null && (
                <div>
                  <dt className="text-sm text-operational-muted">{t("discountLabel")}</dt>
                  <dd>{offer.discountPercentage}%</dd>
                </div>
              )}
              {offer.expirationDate && (
                <div>
                  <dt className="text-sm text-operational-muted">{t("expiration")}</dt>
                  <dd>{new Date(offer.expirationDate).toLocaleDateString(lang)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-operational-muted">{t("serviceRegions")}</dt>
                <dd>{offer.serviceRegions?.join(", ") || "—"}</dd>
              </div>
            </dl>
            {translation?.details && <p className="whitespace-pre-wrap">{translation.details}</p>}
          </>
        )
      )}
    </OperationalPage>
  );
}
