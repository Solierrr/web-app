import type { Meta, StoryObj } from "@storybook/react-vite";
import RegistrationStatus from "./RegistrationStatus";
const meta = { title: "Feedback/RegistrationStatus", component: RegistrationStatus, args: { status: "PENDING" } } satisfies Meta<
  typeof RegistrationStatus
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Pending: Story = {};
export const Approved: Story = { args: { status: "APPROVED" } };
export const Rejected: Story = { args: { status: "REJECTED", reason: "Envie um certificado legível para continuar a revisão." } };
