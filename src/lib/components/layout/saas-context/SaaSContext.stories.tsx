import type { Meta, StoryObj } from "@storybook/react-vite";
import SaaSContext from "./SaaSContext";
import { ActiveContextProvider } from "../../../../../.storybook/mocks/ActiveContext";
const meta = {
  title: "Layout/SaaS/Context",
  component: SaaSContext,
  decorators: [
    (Story, context) => (
      <ActiveContextProvider initialKind={context.parameters.initialKind ?? "company"}>
        <div className="w-72">
          <Story />
        </div>
      </ActiveContextProvider>
    ),
  ],
} satisfies Meta<typeof SaaSContext>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Company: Story = {};
export const Collapsed: Story = { args: { collapsed: true } };
export const Personal: Story = { parameters: { initialKind: "personal" } };
