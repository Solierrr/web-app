import type { Meta, StoryObj } from "@storybook/react-vite";
import Corridor from "./Corridor";
import solarPanelAnnouncementMock from "@/features/solar-panel/solarPanelAnnouncement.d.mock";

const meta = {
  title: "Layout/Announcement/Corridor",
  component: Corridor,
  parameters: {
    layout: "padded",
  },
  args: {
    title: "Placas solares em destaque",
    items: solarPanelAnnouncementMock,
  },
} satisfies Meta<typeof Corridor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
