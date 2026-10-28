import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CompanyProfileView from "./CompanyProfileView";
import ActionLink from "@@/ui/button/ActionLink";
import { getAuthSession } from "@/lib/shared/auth/authToken.utils";
import ProfilePageSkeleton from "@/lib/components/layout/profile/ProfilePageSkeleton";
import OfferCard from "@/features/marketplace/components/OfferCard";
import OfferShelf from "@/features/marketplace/components/OfferShelf";
import { getCatalogCompanyBySlug, type CatalogCompany } from "@/features/companies/company.service";
import { getCatalogSolarPanels } from "@/features/solar-panel/solarPanel.service";
import type { SolarPanelAnnouncement } from "@/features/solar-panel/solarPanel.announcement";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { routePaths } from "@/config/i18n/paths";
import ProfileAbout from "@@/layout/profile/ProfileAbout";

interface CompanyProfilePackedProps {
  company: CatalogCompany;
}

function CompanyProfilePacked({ company }: CompanyProfilePackedProps) {
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const { t } = useTranslation("commons");
  const { t: publicProfile } = useTranslation("profile", { keyPrefix: "public" });
  const { t: marketplace } = useTranslation("marketplace");
  const { t: tCompany } = useTranslation("profile", { keyPrefix: "company" });
  const [offersFailed, setOffersFailed] = useState(false);
  const [offers, setOffers] = useState<SolarPanelAnnouncement[] | null>(null);

  useEffect(() => {
    let active = true;
    getCatalogSolarPanels(lang)
      .then((result) => {
        if (active) setOffers(result.filter((offer) => offer.companySlug === company.slug));
      })
      .catch(() => {
        if (active) {
          setOffersFailed(true);
          setOffers([]);
        }
      });
    return () => {
      active = false;
    };
  }, [company.slug, lang]);

  const offersContent = (
    <section className="flex min-w-0 flex-col gap-6" aria-busy={offers === null}>
      {offersFailed ? (
        <p role="alert">{tCompany("offersFailed")}</p>
      ) : offers === null ? (
        <p role="status">{tCompany("loadingOffers")}</p>
      ) : offers.length === 0 ? (
        <p className="text-body text-operational-muted">{tCompany("noOffers")}</p>
      ) : (
        <OfferShelf
          title={offers.some((offer) => offer.panel.productType === "INFRASTRUCTURE") ? publicProfile("allOffers") : marketplace("products")}>
          {offers.map((offer) => (
            <div key={offer.id} className="w-72 shrink-0 snap-start sm:w-88">
              <OfferCard offer={offer} lang={lang} />
            </div>
          ))}
        </OfferShelf>
      )}
    </section>
  );
  return (
    <CompanyProfileView
      company={company}
      canViewProjects={!!getAuthSession()?.accessToken}
      offers={offersContent}
      summary={<ProfileAbout title={tCompany("about")} text={company.description} />}
      actions={
        <ActionLink
          to={routePaths.contactCompany(lang, company.id)}
          content={t("actions.contact")}
          description={t("actions.contact")}
          className="min-h-11"
        />
      }
    />
  );
}

function CompanyProfileResource({ companySlug }: { companySlug: string }) {
  const { t } = useTranslation("chat");
  const [company, setCompany] = useState<CatalogCompany | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getCatalogCompanyBySlug(companySlug)
      .then((result) => {
        if (active) setCompany(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [companySlug]);

  if (error)
    return (
      <p role="alert" className="p-6">
        {t("companyLoadError")}
      </p>
    );
  if (!company) return <ProfilePageSkeleton channel />;

  return <CompanyProfilePacked key={company.id} company={company} />;
}

export default function CompanyProfile() {
  const { companySlug = "" } = useParams<{ companySlug: string }>();
  return <CompanyProfileResource key={companySlug} companySlug={companySlug} />;
}
