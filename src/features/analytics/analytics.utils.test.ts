import { describe, expect, it } from "vitest";
import { countBy, kpisToCsv, pickKpis } from "./analytics.utils";

describe("analytics.utils", () => {
  it("builds a csv with a header and one row per indicator", () => {
    expect(kpisToCsv([{ label: "Ofertas ativas", value: 3 }], ["indicador", "valor"])).toBe("indicador,valor\nOfertas ativas,3");
  });

  it("quotes cells with commas or quotes", () => {
    expect(kpisToCsv([{ label: 'Empresas, "aprovadas"', value: 2 }], ["indicador", "valor"])).toBe('indicador,valor\n"Empresas, ""aprovadas""",2');
  });

  it("counts matching items and drops the indicators that failed to load", () => {
    expect(countBy([1, 2, 3, 4], (item) => item % 2 === 0)).toBe(2);
    expect(
      pickKpis([
        ["a", 1],
        ["b", null],
        ["c", 0],
      ]),
    ).toEqual([
      { key: "a", value: 1 },
      { key: "c", value: 0 },
    ]);
  });
});
