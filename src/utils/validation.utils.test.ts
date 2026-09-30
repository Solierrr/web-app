import { describe, expect, it } from "vitest";
import { validateCnpj, validateCpf } from "./validation.utils";

describe("validateCpf", () => {
  it("accepts a valid cpf, with or without formatting", () => {
    expect(validateCpf("52998224725").isValid).toBe(true);
    expect(validateCpf("529.982.247-25").isValid).toBe(true);
  });

  it("rejects a cpf with a wrong check digit", () => {
    expect(validateCpf("52998224700").isValid).toBe(false);
  });

  it("rejects a cpf with all repeated digits", () => {
    expect(validateCpf("11111111111").isValid).toBe(false);
  });

  it("rejects an empty value", () => {
    expect(validateCpf("").isValid).toBe(false);
  });
});

describe("validateCnpj", () => {
  it("accepts a valid cnpj, with or without formatting", () => {
    expect(validateCnpj("11444777000161").isValid).toBe(true);
    expect(validateCnpj("11.444.777/0001-61").isValid).toBe(true);
  });

  it("rejects a cnpj with a wrong check digit", () => {
    expect(validateCnpj("11444777000100").isValid).toBe(false);
  });

  it("rejects a cnpj with all repeated digits", () => {
    expect(validateCnpj("11111111111111").isValid).toBe(false);
  });

  it("rejects an empty value", () => {
    expect(validateCnpj("").isValid).toBe(false);
  });
});
