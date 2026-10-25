import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Marketplace from "@/features/marketplace/Marketplace";
import { getFeedView } from "@/features/marketplace/marketplace.utils";
import { useMarketplaceCatalog } from "@/features/marketplace/marketplace.hooks";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import MarketplaceHeading from "@/features/marketplace/components/MarketplaceHeading";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { TechnicalAffiliationType } from "../../professional.enum";
import { getCatalogTechnicians } from "../../professional.service";
import { getCatalogTeams, teamCompany, type CatalogTeam } from "../../professionalTeam.service";
import CompanyFeaturedCard from "@/features/companies/pages/feed/CompanyFeaturedCard";
import ProfessionalCard from "./ProfessionalCard";
import ServiceCollections from "./ServiceCollections";

export default function ProfessionalFeed() {
  const { t } = useTranslation("marketplace");
  const { t: feed } = useTranslation("feed");
  const { lang: value } = useParams();
  const lang = isSupportedLanguage(value) ? value : DEFAULT;
  const [params] = useSearchParams();
  const view = getFeedView("professionals", params.get("view"));
  const { items, error, retry } = useMarketplaceCatalog(getCatalogTechnicians);
  const [teams, setTeams] = useState<CatalogTeam[] | null>(null);
  const [teamError, setTeamError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (view !== "teams") return;
    let active = true;
    getCatalogTeams()
      .then((data) => {
        if (active) {
          setTeams(data);
          setTeamError(false);
        }
      })
      .catch(() => {
        if (active) setTeamError(true);
      });
    return () => {
      active = false;
    };
  }, [view, revision]);
  const filtered = (items ?? []).filter((item) => view !== "independent" || item.affiliationType === TechnicalAffiliationType.INDEPENDENT);
  const teamView = view === "teams";
  return (
    <MarketplaceLayout>
      <MarketplaceHeading title={t("servicesTitle")} description={t("servicesDescription")} centered />
      <ServiceCollections lang={lang} />
      <section className="flex flex-col gap-8">
        <h2 className="text-subtitle font-semi-bold">{t("professionalsHeading")}</h2>
        <Marketplace category="professionals" />
        <MarketplaceResults
          loading={teamView ? !teams && !teamError : !items && !error}
          error={(teamView ? teamError : error) ? feed("professional.loadError") : undefined}
          empty={(teamView ? teams && !teams.length : items && !filtered.length) ? feed("services.empty") : undefined}
          onRetry={
            teamView
              ? () => {
                  setTeamError(false);
                  setTeams(null);
                  setRevision((n) => n + 1);
                }
              : retry
          }>
          <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {teamView
              ? teams?.map((team) => <CompanyFeaturedCard key={team.id} company={teamCompany(team)} lang={lang} />)
              : filtered.map((professional) => <ProfessionalCard key={professional.id} professional={professional} lang={lang} />)}
          </div>
        </MarketplaceResults>
      </section>
    </MarketplaceLayout>
  );
}
