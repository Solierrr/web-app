import { afterEach, expect, it } from "vitest";
import i18n from "@/config/i18n/internationalization";
import { HttpResponseError } from "@/lib/shared/http/http.service";
import { brandServiceError } from "./brand.utils";

afterEach(async () => { await i18n.changeLanguage("pt-BR"); });

it("preserves translated duplicate errors instead of displaying the server detail", async () => {
  await i18n.changeLanguage("en-US");
  const error = new Error("Local fallback", { cause: new HttpResponseError(409, "DUPLICATE_RESOURCE", "Detalhe em português") });
  expect(brandServiceError(error).message).toBe("A record with this information already exists.");
});

it("keeps the local fallback for an unknown code without exposing the remote detail", () => {
  const error = new Error("Local fallback", { cause: new HttpResponseError(422, "UNKNOWN_CODE", "Internal diagnostic") });
  expect(brandServiceError(error).message).toBe("Local fallback");
});
