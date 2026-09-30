import type { Meta, StoryObj } from "@storybook/react-vite";
import EntityCard from "./EntityCard";
import professionalMock from "@/features/professionals/professional.d.mock";
import { toCardItem } from "@/features/professionals/pages/feed/ProfessionalFeed.utils";
import { DEFAULT as DEFAULT_LANGUAGE } from "@/config/inter/browser/languages";

const professional = professionalMock[0];
const item = toCardItem({
  id: professional.id,
  slug: professional.slug,
  name: professional.name,
  crea: professional.registrations?.[0]?.council ?? "",
  professions: professional.registrations?.map((registration) => registration.profession) ?? [],
}, DEFAULT_LANGUAGE);

const meta = {
  title: "Layout/Announcement/EntityCard",
  component: EntityCard,
  parameters: {
    layout: "centered",
  },
  args: {
    item,
    className: "w-40",
  },
} satisfies Meta<typeof EntityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSubtitle: Story = {
  args: { item: { ...item, subtitle: undefined } },
};

export const WithoutAvatar: Story = {
  args: { item: { ...item, avatarUrl: undefined } },
};
