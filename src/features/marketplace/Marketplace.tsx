import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Switcher from "@@/ui/switcher/Switcher";
import { getFeedView, feedViews, type FeedCategory } from "./marketplace.utils";

interface MarketplaceProps {
  category: FeedCategory;
  search?: boolean;
}

export default function Marketplace({ category }: MarketplaceProps) {
  const { pathname, hash } = useLocation();
  const [params] = useSearchParams();
  const { t } = useTranslation("feed");
  const selected = getFeedView(category, params.get("view"));
  const options = feedViews[category].map((view) => {
    const query = new URLSearchParams(params);
    query.set("view", view);
    return { content: t(`views.${view}`), url: `${pathname}?${query}${hash}` };
  });

  return <Switcher label={t(`views.labels.${category}`)} activeUrl={options[feedViews[category].indexOf(selected)].url} options={options} />;
}
