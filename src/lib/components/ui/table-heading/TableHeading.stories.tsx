import type { Meta, StoryObj } from "@storybook/react-vite";
import TableHeading from "./TableHeading";
const meta = {
  title: "UI/TableHeading",
  component: TableHeading,
  args: { label: "Potência", direction: "asc", onSort: () => {} },
  decorators: [
    (Story) => (
      <table>
        <thead>
          <tr>
            <Story />
          </tr>
        </thead>
      </table>
    ),
  ],
} satisfies Meta<typeof TableHeading>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
