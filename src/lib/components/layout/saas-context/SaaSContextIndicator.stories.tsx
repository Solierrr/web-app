import type { Meta, StoryObj } from "@storybook/react-vite";
import SaaSContextIndicator from "./SaaSContextIndicator";
import { ActiveContextProvider } from "../../../../../.storybook/mocks/ActiveContext";
const meta = {
  title: "Layout/SaaS/ContextIndicator",
  component: SaaSContextIndicator,
  decorators: [
    (Story, context) => (
      <ActiveContextProvider initialKind={context.parameters.initialKind ?? "company"} platformAdmin={context.parameters.platformAdmin ?? false}>
        <Story />
      </ActiveContextProvider>
    ),
  ],
} satisfies Meta<typeof SaaSContextIndicator>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CompanyAdmin: Story = {};
export const Personal: Story = { parameters: { initialKind: "personal" } };
export const PlatformAdmin: Story = { parameters: { initialKind: "personal", platformAdmin: true } };
