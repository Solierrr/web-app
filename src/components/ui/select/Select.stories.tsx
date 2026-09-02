import type { Meta, StoryObj } from "@storybook/react-vite";
import Select from "./Select";
import { DefaultSelect, BooleanSelect } from "./Select.presets";
import { SolarPanelType } from "@/features/solar-panel/solarPanel.enum";

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "type",
    options: Object.values(SolarPanelType),
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <DefaultSelect {...args} />,
};

export const Rounded: Story = {
  args: { rounded: true },
  render: (args) => <DefaultSelect {...args} />,
};

export const WithDefaultValue: Story = {
  args: { defaultValue: SolarPanelType.POLYCRYSTALLINE },
  render: (args) => <DefaultSelect {...args} />,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <DefaultSelect {...args} />,
};

export const Boolean: Story = {
  args: { name: "active" },
  render: (args) => <BooleanSelect {...args} />,
};
