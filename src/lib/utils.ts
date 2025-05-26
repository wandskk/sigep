import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateTemporaryPassword(length = 8) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  
  // Garante pelo menos um caractere de cada tipo
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Maiúscula
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Minúscula
  password += "0123456789"[Math.floor(Math.random() * 10)]; // Número
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Especial
  
  // Preenche o resto da senha
  for (let i = password.length; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Embaralha a senha
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

export function formatPhoneNumber(phone: string): string {
  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos
  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  // Se não tiver 10 ou 11 dígitos, retorna o número original
  return phone;
}
