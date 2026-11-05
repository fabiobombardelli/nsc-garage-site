/**
 * Protocolo do agendamento (RN-07): "NSC-" seguido de 6 caracteres.
 *
 * O alfabeto não tem 0/O nem 1/I/L, que se confundem quando o cliente
 * lê o protocolo em voz alta ou copia à mão. São 30⁶ ≈ 729 milhões de
 * combinações; o serviço ainda confere se o código já existe antes de usar.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 6;
const PREFIX = "NSC-";
const PATTERN = new RegExp(`^${PREFIX}[${ALPHABET}]{${LENGTH}}$`);

/** Gera um protocolo novo. `random` pode ser trocado nos testes. */
export function generateProtocol(random: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < LENGTH; i += 1) {
    code += ALPHABET[Math.floor(random() * ALPHABET.length)] ?? ALPHABET[0];
  }
  return PREFIX + code;
}

/**
 * Normaliza o que a pessoa digitou: maiúsculas, sem espaços, e com o
 * prefixo "NSC-" mesmo que ela tenha digitado só os 6 caracteres.
 */
export function normalizeProtocol(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  // Só tira o "NSC" se sobrar mais que o código (um código pode começar com N, S, C).
  const code = compact.length > LENGTH && compact.startsWith("NSC") ? compact.slice(3) : compact;
  return PREFIX + code;
}

/** Indica se o texto (já normalizado) tem o formato de um protocolo. */
export function isProtocolFormat(protocol: string): boolean {
  return PATTERN.test(protocol);
}
