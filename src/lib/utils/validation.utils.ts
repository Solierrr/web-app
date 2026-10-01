import type { ResultValidation } from "./validation";

export function validateEmail(input: string): ResultValidation {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!input) return { isValid: false, message: "Email é obrigatório" };
  if (!regex.test(input)) return { isValid: false, message: "Email inválido" };

  return { isValid: true };
}

export function validatePassword(input: string): ResultValidation {
  if (input.length < 8) return { isValid: false, message: "Senha deve ter no mínimo 8 caracteres" };
  if (!/[A-Z]/.test(input)) return { isValid: false, message: "Senha deve ter ao menos uma letra maiúscula" };
  if (!/[0-9]/.test(input)) return { isValid: false, message: "Senha deve ter ao menos um número" };

  return { isValid: true };
}

export function validatePhone(input: string): ResultValidation {
  const onlyNumbers = input.replace(/\D/g, "");

  if (!onlyNumbers) return { isValid: false, message: "Telefone é obrigatório" };
  if (onlyNumbers.length < 10 || onlyNumbers.length > 11) return { isValid: false, message: "Telefone deve ter 10 ou 11 dígitos" };

  return { isValid: true };
}

export function validateMaxWidth(input: string, max: number, field: string): ResultValidation {
  if (input.length > max) return { isValid: false, message: `${field} deve ter no máximo ${max} caracteres` };

  return { isValid: true };
}

export function validateRequired(input: string, field: string): ResultValidation {
  if (!input || input.trim() === "") return { isValid: false, message: `${field} é obrigatório` };
  return { isValid: true };
}

function checkDigit(digits: number[], weightsStart: number): number {
  let sum = 0;
  let weight = weightsStart;
  for (const digit of digits) {
    sum += digit * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function validateCpf(input: string): ResultValidation {
  const digits = input.replace(/\D/g, "");
  if (!digits) return { isValid: false, message: "CPF é obrigatório" };
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return { isValid: false, message: "CPF inválido" };

  const numbers = digits.split("").map(Number);
  const firstCheck = checkDigit(numbers.slice(0, 9), 10);
  const secondCheck = checkDigit(numbers.slice(0, 10), 11);
  if (firstCheck !== numbers[9] || secondCheck !== numbers[10]) return { isValid: false, message: "CPF inválido" };

  return { isValid: true };
}

export function validateCnpj(input: string): ResultValidation {
  const digits = input.replace(/\D/g, "");
  if (!digits) return { isValid: false, message: "CNPJ é obrigatório" };
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return { isValid: false, message: "CNPJ inválido" };

  const numbers = digits.split("").map(Number);
  const firstCheck = checkDigit(numbers.slice(0, 12), 5);
  const secondCheck = checkDigit(numbers.slice(0, 13), 6);
  if (firstCheck !== numbers[12] || secondCheck !== numbers[13]) return { isValid: false, message: "CNPJ inválido" };

  return { isValid: true };
}

export function isSafeMailtoAddress(value: string): boolean {
  return /^[^\s@,;?&%#<>"]+@[^\s@,;?&%#<>"]+\.[^\s@,;?&%#<>"]+$/.test(value);
}
