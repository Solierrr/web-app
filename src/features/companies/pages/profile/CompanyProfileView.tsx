import type { ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfileChannel from "@@/layout/profile/ProfileChannel";
import Switcher from "@@/ui/switcher/Switcher";
import ValueField from "@@/ui/value-field/ValueField";
import type { CatalogCompany } from "../../company.service";
import CompanyProfileProjects from "./CompanyProfileProjects";
import { CompanyBadges } from "./CompanyProfile.reusable";

export default function CompanyProfileView({
  company,
  operational = false,
  actions,
  children,
  summary,
  offers,
  canViewProjects = false,
}: {
  company: Pick<CatalogCompany, "id" | "tradeName" | "slug" | "logoUrl" | "bannerUrl" | "activities" | "city" | "state" | "hasTechnicalTeam">;
  operational?: boolean;
  actions?: ReactNode;
  children?: ReactNode;
  summary?: ReactNode;
  offers?: ReactNode;
  canViewProjects?: boolean;
}) {
  const { t } = useTranslation("profile", { keyPrefix: "company" });
  const { t: tMarketplace } = useTranslation("marketplace");
  const { t: tFeed } = useTranslation("feed");
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const tabs = [
    ...(operational ? [{ key: "about", label: t("about") }] : []),
    ...(offers ? [{ key: "offers", label: operational ? t("offers") : tMarketplace("products") }] : []),
    ...(canViewProjects ? [{ key: "projects", label: t("projects") }] : []),
  ];
  const requested = params.get("tab");
  const selected = tabs.some((tab) => tab.key === requested) ? requested! : (tabs[0]?.key ?? "about");
  function url(key: string) {
    const next = new URLSearchParams(params);
    next.set("tab", key);
    return `${pathname}?${next}`;
  }
  return (
    <ProfileChannel
      operational={operational}
      name={company.tradeName}
      bannerUrl={company.bannerUrl}
      avatarUrl={company.logoUrl}
      subtitle={[company.city, company.state].filter(Boolean).join(", ") || undefined}
      metadata={
        operational ? (
          company.activities?.map((activity) => <ValueField key={activity}>{tFeed(`company.activities.${activity}`)}</ValueField>)
        ) : (
          <CompanyBadges company={company} />
        )
      }
      actions={actions}
      navigation={
        <div className="flex min-w-0 flex-col gap-8">
          {summary}
          {(operational || tabs.length > 1) && (
            <Switcher label={t("navigation")} activeUrl={url(selected)} options={tabs.map((tab) => ({ url: url(tab.key), content: tab.label }))} />
          )}
        </div>
      }>
      {selected === "projects" ? (
        <CompanyProfileProjects key={company.id} companyId={company.id} />
      ) : selected === "offers" || (!operational && offers) ? (
        offers
      ) : (
        <>
          {children}
          {operational && offers}
        </>
      )}
    </ProfileChannel>
  );
}
