import type { Meta, StoryObj } from "@storybook/react-vite";
import FieldFeedback from "./FieldFeedback";
const meta = {
  title: "Feedback/FieldFeedback",
  component: FieldFeedback,
  args: { id: "example-error", message: "Escolha uma marca cadastrada na lista." },
} satisfies Meta<typeof FieldFeedback>;
export default meta;
export const Required: StoryObj<typeof meta> = {};
export const Empty: StoryObj<typeof meta> = { args: { message: null } };
