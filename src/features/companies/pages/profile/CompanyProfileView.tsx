import type { ReactNode } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProfileChannel from "@@/layout/profile/ProfileChannel";
import Switcher from "@@/ui/switcher/Switcher";
import ValueField from "@@/ui/value-field/ValueField";
import type { CatalogCompany } from "../../company.service";
import CompanyProfileProjects from "./CompanyProfileProjects";

export default function CompanyProfileView({
  company,
  operational = false,
  actions,
  children,
  offers,
  canViewProjects = false,
}: {
  company: Pick<CatalogCompany, "id" | "tradeName" | "slug" | "logoUrl" | "bannerUrl" | "activities" | "city" | "state">;
  operational?: boolean;
  actions?: ReactNode;
  children: ReactNode;
  offers?: ReactNode;
  canViewProjects?: boolean;
}) {
  const { t } = useTranslation("profile", { keyPrefix: "company" });
  const { t: tFeed } = useTranslation("feed");
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const tabs = [
    { key: "about", label: t("about") },
    ...(offers ? [{ key: "offers", label: t("offers") }] : []),
    ...(canViewProjects ? [{ key: "projects", label: t("projects") }] : []),
  ];
  const selected = tabs.some((tab) => tab.key === params.get("tab")) ? params.get("tab")! : "about";
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
      subtitle={[company.city, company.state].filter(Boolean).join(" / ") || undefined}
      metadata={company.activities?.map((activity) => (
        <ValueField key={activity}>{tFeed(`company.activities.${activity}`)}</ValueField>
      ))}
      actions={actions}
      navigation={
        <Switcher label={t("navigation")} activeUrl={url(selected)} options={tabs.map((tab) => ({ url: url(tab.key), content: tab.label }))} />
      }>
      {selected === "projects" ? (
        <CompanyProfileProjects key={company.id} companyId={company.id} />
      ) : selected === "offers" ? (
        offers
      ) : (
        <>
          {children}
          {offers}
        </>
      )}
    </ProfileChannel>
  );
}
