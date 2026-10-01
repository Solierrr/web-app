import { describe, expect, it } from "vitest";
import { isCorporateEmail, isSafeMailtoAddress, validateCnpj, validateCpf } from "./validation.utils";

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

describe("isSafeMailtoAddress", () => {
  it("accepts a plain address", () => {
    expect(isSafeMailtoAddress("novo@empresa.com")).toBe(true);
  });

  it("rejects characters that could add recipients, headers or break the link", () => {
    for (const value of ["a@b.com?bcc=x@y.com", "a@b.com,c@d.com", "a@b.com;c@d.com", "a b@c.com", "a@b.com&cc=x", "a%40b.com", "a@b", "", "<a@b.com>"]) {
      expect(isSafeMailtoAddress(value)).toBe(false);
    }
  });
});

describe("isCorporateEmail", () => {
  it("accepts an address on the company domain", () => {
    expect(isCorporateEmail("contato@solarxpto.com.br")).toBe(true);
  });

  it("rejects free mail providers regardless of case", () => {
    for (const value of ["a@gmail.com", "a@Hotmail.com", "a@yahoo.com.br", " a@outlook.com "]) expect(isCorporateEmail(value)).toBe(false);
  });

  it("rejects a value without a domain", () => {
    expect(isCorporateEmail("sem-arroba")).toBe(false);
  });
});
