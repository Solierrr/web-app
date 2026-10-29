import { describe, expect, it } from "vitest";
import type { ImageAnalysis } from "./aiAccessibility";
import { toImageVerdict } from "./aiAccessibility.utils";

function analysis(decision: ImageAnalysis["decision"], reason_codes: string[] = [], alt_text: string | null = null): ImageAnalysis {
  return { analysis_id: "a", request_id: "r", decision, reason_codes, risk_categories: [], alt_text, policy_version: "v4", model_version: "m" };
}

describe("toImageVerdict", () => {
  it("suggests the text only for an approved image", () => {
    expect(toImageVerdict(analysis("approved", [], " Painel solar "))).toEqual({ status: "suggested", altText: "Painel solar" });
    expect(toImageVerdict(analysis("approved"))).toEqual({ status: "unavailable" });
  });

  it.each([
    [["SEXUAL_CONTENT"], "inappropriate"],
    [["GRAPHIC_VIOLENCE"], "inappropriate"],
    [["PURPOSE_MISMATCH"], "purpose"],
    [["INVALID_IMAGE"], "invalid"],
    [["IMAGE_TOO_LARGE"], "invalid"],
  ])("blocks a rejected image with %j as %s", (codes, reason) => {
    expect(toImageVerdict(analysis("rejected", codes))).toEqual({ status: "blocked", reason });
  });

  it.each([
    [["UNCERTAIN_CLASSIFICATION"], "review"],
    [["PROVIDER_SAFETY_FLAG"], "review"],
    [["PROMPT_INJECTION", "UNCERTAIN_CLASSIFICATION"], "review"],
    [["PURPOSE_UNCERTAIN"], "purpose"],
    [["ANALYSIS_INCONSISTENT"], "review"],
  ])("does not let a review with %j proceed", (codes, reason) => {
    expect(toImageVerdict(analysis("review_required", codes))).toEqual({ status: "blocked", reason });
  });

  it.each([["PROVIDER_UNAVAILABLE"], ["ANALYSIS_INCOMPLETE"], ["ANALYSIS_INVALID"], ["CAPTION_INVALID"]])(
    "never blocks the upload because of the technical failure %s",
    (code) => {
      expect(toImageVerdict(analysis("review_required", [code]))).toEqual({ status: "unavailable" });
    },
  );

  it("ignores purpose codes only when the purpose is not strict", () => {
    expect(toImageVerdict(analysis("rejected", ["PURPOSE_MISMATCH"]), false)).toEqual({ status: "unavailable" });
    expect(toImageVerdict(analysis("review_required", ["PURPOSE_UNCERTAIN"]), false)).toEqual({ status: "unavailable" });
    expect(toImageVerdict(analysis("rejected", ["SEXUAL_CONTENT"]), false)).toEqual({ status: "blocked", reason: "inappropriate" });
  });
});
