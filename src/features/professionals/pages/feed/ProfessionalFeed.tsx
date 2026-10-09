import Marketplace from "@/features/marketplace/Marketplace";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getFeedView } from "@/features/marketplace/marketplace.utils";
import { TechnicalAffiliationType } from "@/features/professionals/professional.enum";
import { getCatalogTeams, teamCompany, type CatalogTeam } from "@/features/professionals/professionalTeam.service";
import CompanyFeaturedCard from "@/features/companies/pages/feed/CompanyFeaturedCard";
import { useTranslation } from "react-i18next";
import EntityCorridor from "@/lib/components/layout/announcement/corridor/EntityCorridor";
import Skeleton from "@@/feedback/skeleton/Skeleton";
import { ImageSkeleton } from "@@/feedback/skeleton/Skeleton.presets";
import { getCatalogTechnicians, type CatalogTechnician } from "@/features/professionals/professional.service";
import { DEFAULT as DEFAULT_LANGUAGE, isSupportedLanguage } from "@/config/i18n/browser/languages";
import { toCardItem } from "./ProfessionalFeed.utils";
import WrapperLayout from "@/config/WrapperLayout";

function ProfessionalFeedContent({ items, teams }: { items: CatalogTechnician[]; teams?: CatalogTeam[] }) {
  const { t } = useTranslation("commons");
  const { t: tFeed } = useTranslation("feed");
  const { lang: langParam } = useParams<{ lang: string }>();
  const lang = isSupportedLanguage(langParam) ? langParam : DEFAULT_LANGUAGE;
  const [params] = useSearchParams();
  const view = getFeedView("professionals", params.get("view"));
  const filtered = view === "independent" ? items.filter((item) => item.affiliationType === TechnicalAffiliationType.INDEPENDENT) : items;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1>{tFeed("services.title")}</h1>
        <p className="text-black/70">{tFeed("professional.description")}</p>
      </div>

      <div className="flex justify-center">
        <Marketplace category="professionals" />
      </div>

      {view === "teams" ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {teams?.map((team) => (
            <CompanyFeaturedCard key={team.id} company={teamCompany(team)} lang={lang} />
          ))}
        </div>
      ) : (
        <EntityCorridor title={t("navbar.professionals")} items={filtered.map((professional) => toCardItem(professional, lang))} />
      )}
      {(view === "teams" ? !teams?.length : !filtered.length) && <p>{tFeed("services.empty")}</p>}
    </div>
  );
}

function ProfessionalFeedSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true">
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton height="2.25rem" width="12rem" />
        <Skeleton height="1.5rem" width="60%" />
      </div>

      <div className="flex justify-center">
        <Marketplace category="professionals" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton height="1.65rem" width="10rem" />
        <div className="flex flex-row gap-6 overflow-hidden">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex w-40 shrink-0 flex-col items-center gap-2">
              <ImageSkeleton className="rounded-full" />
              <Skeleton height="1.25rem" width="80%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfessionalFeed() {
  const [items, setItems] = useState<CatalogTechnician[] | null>(null);
  const [error, setError] = useState(false);
  const { t } = useTranslation("feed");
  const [params] = useSearchParams();
  const view = getFeedView("professionals", params.get("view"));
  const [teams, setTeams] = useState<CatalogTeam[] | null>(null);
  const [teamError, setTeamError] = useState(false);

  useEffect(() => {
    if (view !== "teams") return;
    let active = true;
    getCatalogTeams()
      .then((result) => {
        if (active) {
          setTeams(result);
          setTeamError(false);
        }
      })
      .catch(() => {
        if (active) setTeamError(true);
      });
    return () => {
      active = false;
    };
  }, [view]);

  useEffect(() => {
    let active = true;

    getCatalogTechnicians()
      .then((result) => {
        if (active) setItems(result);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  if (view === "teams" ? teamError : error) {
    return (
      <WrapperLayout>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1>{t("services.title")}</h1>
          <p className="text-black/70">{t("professional.description")}</p>
        </div>
        <div className="my-8 flex justify-center">
          <Marketplace category="professionals" />
        </div>
        <p role="alert">{t("professional.loadError")}</p>
      </WrapperLayout>
    );
  }
  if (view === "teams" ? teams !== null : items !== null) {
    return (
      <WrapperLayout>
        <ProfessionalFeedContent items={items ?? []} teams={teams ?? undefined} />
      </WrapperLayout>
    );
  } else {
    return (
      <WrapperLayout>
        <ProfessionalFeedSkeleton />
      </WrapperLayout>
    );
  }
}
