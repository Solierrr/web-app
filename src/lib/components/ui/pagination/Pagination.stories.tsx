import type { Meta, StoryObj } from "@storybook/react-vite";
import Pagination from "./Pagination";
import { useState, type ComponentProps } from "react";
import { fn, expect, userEvent } from "storybook/test";
function Interactive(args: ComponentProps<typeof Pagination>) {
  const [page, setPage] = useState(args.page);
  return (
    <Pagination
      {...args}
      page={page}
      onPageChange={(value) => {
        setPage(value);
        args.onPageChange(value);
      }}
    />
  );
}
const meta = {
  title: "UI/Pagination",
  component: Pagination,
  render: (args) => <Interactive {...args} />,
  args: { page: 1, total: 102, pageSize: 5, onPageChange: fn(), appearance: "borderless", summaryMode: "pages" },
} satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "Próxima página" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Página 2 de 21");
  },
};
export const LastPage: Story = { args: { page: 21 } };
export const Empty: Story = { args: { total: 0 } };
export const Bordered: Story = { args: { appearance: "bordered", summaryMode: "items" } };
