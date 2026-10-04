import type { Meta, StoryObj } from "@storybook/react-vite";
import OfferCard from "./OfferCard";
import { panelOffer, infrastructureOffer } from "./CatalogFeed.stories.fixtures";
import { DEFAULT } from "@/config/i18n/browser/languages";
const meta = {
  title: "Marketplace/OfferCard",
  component: OfferCard,
  args: { offer: panelOffer, lang: DEFAULT },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OfferCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Panel: Story = {};
export const Infrastructure: Story = { args: { offer: infrastructureOffer } };
export const WithoutImage: Story = { args: { offer: { ...panelOffer, photos: { heroImage: { url: "", description: "" }, otherImages: [] } } } };
