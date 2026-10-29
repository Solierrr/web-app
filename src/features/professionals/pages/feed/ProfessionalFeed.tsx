import { Fragment, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Marketplace from "@/features/marketplace/Marketplace";
import { getFeedView } from "@/features/marketplace/marketplace.utils";
import { useMarketplaceCatalog } from "@/features/marketplace/marketplace.hooks";
import MarketplaceLayout from "@/features/marketplace/components/MarketplaceLayout";
import OfferShelf from "@/features/marketplace/components/OfferShelf";
import MarketplaceResults from "@/features/marketplace/components/MarketplaceResults";
import { DEFAULT, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { TechnicalAffiliationType } from "../../professional.enum";
import { getCatalogTechnicians } from "../../professional.service";
import { getCatalogTeams, teamCompany, type CatalogTeam } from "../../professionalTeam.service";
import CompanyFeaturedCard from "@/features/companies/pages/feed/CompanyFeaturedCard";
import ProfessionalCard from "./ProfessionalCard";
import { ServiceHighlight } from "./ProfessionalFeed.reusable";
import { serviceShelves } from "./ProfessionalFeed.utils";

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
  const shelves = serviceShelves(filtered);
  return (
    <MarketplaceLayout>
      <h1 className="sr-only">{t("services")}</h1>
      <div className="flex justify-center">
        <Marketplace category="professionals" />
      </div>
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
        {teamView ? (
          <div className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
            {(teams ?? []).map((team) => (
              <CompanyFeaturedCard key={team.id} company={teamCompany(team)} lang={lang} />
            ))}
          </div>
        ) : (
          <>
            <ServiceHighlight format="installation" professionals={filtered} lang={lang} />
            {shelves.map((shelf, index) => (
              <Fragment key={shelf.key}>
                <OfferShelf title={t(`serviceFeed.shelves.${shelf.key}`)}>
                  {shelf.items.map((professional) => (
                    <div key={professional.id} className="w-72 shrink-0 snap-start sm:w-88">
                      <ProfessionalCard professional={professional} lang={lang} />
                    </div>
                  ))}
                </OfferShelf>
                {(index + 1) % 2 === 0 && (
                  <ServiceHighlight format={index % 4 === 1 ? "inspection" : "maintenance"} professionals={filtered} lang={lang} />
                )}
              </Fragment>
            ))}
          </>
        )}
      </MarketplaceResults>
    </MarketplaceLayout>
  );
}
