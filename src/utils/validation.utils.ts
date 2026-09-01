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
