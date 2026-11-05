/**
 * Validação dos dados do cliente (UC-20 Validar Dados, RF-015).
 *
 * Formatos aceitos (requisito especial RE2 da revisão de requisitos):
 * - telefone brasileiro com DDD: celular com 11 dígitos (começa com 9)
 *   ou fixo com 10 dígitos (começa com 2 a 5);
 * - e-mail opcional, com usuário, @ e domínio;
 * - ano do carro opcional, com quatro dígitos.
 *
 * Cada mensagem diz o problema e como corrigir (WCAG 3.3.1 e 3.3.3).
 */

export type CustomerFormValues = {
  name: string;
  phone: string;
  email: string;
  vehicleModel: string;
  vehicleYear: string;
  notes: string;
  /** Autorização para usar os dados neste atendimento (LGPD, RNF-05). */
  consent: boolean;
};

export type CustomerField = keyof CustomerFormValues;
export type CustomerErrors = Partial<Record<CustomerField, string>>;

/** Limites de tamanho dos campos de texto. */
export const FIELD_LIMITS = { name: 80, email: 120, vehicleModel: 60, notes: 500 } as const;

/** Menor ano de carro aceito. */
const MIN_YEAR = 1950;

/** Deixa só os números e tira o DDI 55, se a pessoa tiver digitado. */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  return (digits.length === 12 || digits.length === 13) && digits.startsWith("55")
    ? digits.slice(2)
    : digits;
}

/** Telefone brasileiro válido: DDD sem zero + celular (9 + 8 dígitos) ou fixo (2 a 5 + 7 dígitos). */
export function isValidPhone(digits: string): boolean {
  return /^[1-9]{2}(9\d{8}|[2-5]\d{7})$/.test(digits);
}

/** "11987654321" → "(11) 98765-4321"; "1134567890" → "(11) 3456-7890". */
export function formatPhone(digits: string): string {
  const match = digits.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : digits;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidYear(year: string, now: Date): boolean {
  if (!/^\d{4}$/.test(year)) return false;
  const value = Number(year);
  return value >= MIN_YEAR && value <= now.getFullYear() + 1;
}

/** Valida a etapa "Seus dados". Devolve um erro por campo, na ordem do formulário. */
export function validateCustomer(values: CustomerFormValues, now: Date): CustomerErrors {
  const errors: CustomerErrors = {};
  const name = values.name.trim();
  const phone = normalizePhone(values.phone);
  const email = values.email.trim();
  const year = values.vehicleYear.trim();

  if (!name) errors.name = "Informe seu nome para a equipe saber com quem fala.";
  else if (name.length > FIELD_LIMITS.name)
    errors.name = `Use até ${FIELD_LIMITS.name} caracteres no nome.`;

  if (!phone) errors.phone = "Informe um telefone com DDD para a oficina confirmar o horário.";
  else if (!isValidPhone(phone))
    errors.phone = "Digite o telefone com DDD, por exemplo (11) 98765-4321.";

  if (email && !isValidEmail(email))
    errors.email = "Confira o e-mail: ele precisa de usuário, @ e domínio, como nome@exemplo.com.";

  if (!values.vehicleModel.trim())
    errors.vehicleModel = "Informe o modelo do carro, por exemplo Nissan 350Z.";

  if (year && !isValidYear(year, now))
    errors.vehicleYear = `Digite o ano com quatro dígitos, entre ${MIN_YEAR} e ${now.getFullYear() + 1}.`;

  if (values.notes.trim().length > FIELD_LIMITS.notes)
    errors.notes = `Use até ${FIELD_LIMITS.notes} caracteres nas observações.`;

  if (!values.consent)
    errors.consent = "Para agendar, autorize o uso dos seus dados neste atendimento.";

  return errors;
}
