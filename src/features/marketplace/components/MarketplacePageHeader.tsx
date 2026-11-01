import Marketplace from "../Marketplace";
import type { FeedCategory } from "../marketplace.utils";
import MarketplaceHeading from "./MarketplaceHeading";

// O começo de toda página de lista do marketplace (produtos, infraestrutura, serviços e empresas): título, subtítulo e o
// seletor de visões, centralizados, e só depois o conteúdo.
export default function MarketplacePageHeader({ title, description, category }: { title: string; description: string; category: FeedCategory }) {
  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      <MarketplaceHeading title={title} description={description} centered />
      <Marketplace category={category} />
    </div>
  );
}
