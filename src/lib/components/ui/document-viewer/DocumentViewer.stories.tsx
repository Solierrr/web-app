import type { Meta, StoryObj } from "@storybook/react-vite";
import DocumentViewer from "./DocumentViewer";
import { expect } from "storybook/test";
async function load(id: string) {
  if (id === "image") {
    const response = await fetch("/pattern/orange.jpg");
    return response.blob();
  }
  if (id === "pdf" || id === "docx") {
    const response = await fetch(id === "pdf" ? "/mock-documents/certificado-demonstrativo.pdf" : "/mock-documents/formacao-demonstrativa.docx");
    if (!response.ok) throw new Error("Fixture unavailable");
    return response.blob();
  }
  return new Blob(["Documento demonstrativo do Storybook"], { type: "text/plain" });
}
const meta = {
  title: "UI/DocumentViewer",
  component: DocumentViewer,
  args: { document: { id: "pdf", name: "Certificado demonstrativo.pdf", contentType: "application/pdf" }, load },
  decorators: [
    (Story) => (
      <div className="flex h-screen flex-col bg-operational-surface p-6">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DocumentViewer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PDF: Story = {};
export const DOCX: Story = {
  args: {
    document: {
      id: "docx",
      name: "Formação demonstrativa.docx",
      contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  },
};
export const Image: Story = {
  args: { document: { id: "image", name: "Referência do projeto.jpg", contentType: "image/jpeg" } },
  play: async ({ canvas }) => {
    await expect(await canvas.findByRole("img", { name: "Referência do projeto.jpg" }, { timeout: 10000 })).toBeVisible();
  },
};
export const Unsupported: Story = { args: { document: { id: "txt", name: "Notas.txt", contentType: "text/plain" } } };
export const Loading: Story = { args: { load: () => new Promise<Blob>(() => undefined) } };
export const Failed: Story = {
  args: {
    load: async () => {
      throw new Error("Fixture offline");
    },
  },
};
