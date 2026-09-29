import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AccessInfoPage from "./AccessInfoPage";
import { redeemAccessCode } from "@/features/companies/companyManagement.service";

vi.mock("@/features/companies/companyManagement.service", () => ({ redeemAccessCode: vi.fn() }));

describe("AccessInfoPage", () => {
  it("redeems the access code and shows an error on failure", async () => {
    vi.mocked(redeemAccessCode).mockRejectedValue(new Error("invalid"));

    render(
      <MemoryRouter>
        <AccessInfoPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Código de acesso"), { target: { value: "abc12345" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(redeemAccessCode).toHaveBeenCalledWith("ABC12345"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
