import type { Meta, StoryObj } from "@storybook/react-vite";
import Icon from "./Icon";
import Colors from "@/shared/styles/colors/colors.enum";

const ICON_NAMES = ["home", "user", "settings", "search", "chevronDown", "x", "eye", "eyeOff", "shoppingCart", "globe", "heart", "loader"] as const;

const meta = {
  title: "UI/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "home",
    size: 24,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-6">
      {ICON_NAMES.map((name) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <Icon name={name} color={Colors.ORANGE} />
          <span className="text-lower">{name}</span>
        </div>
      ))}
    </div>
  ),
};
