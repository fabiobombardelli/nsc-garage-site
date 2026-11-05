import { contact } from "@/content/site";

/** Gera o link do WhatsApp da oficina, opcionalmente com uma mensagem pronta. */
export function whatsappLink(message?: string): string {
  return whatsappLinkTo(contact.whatsapp.number, message);
}

/**
 * Link do WhatsApp para qualquer número. `number` aceita só os dígitos com
 * DDD ("11987654321"); o DDI 55 do Brasil é colocado se faltar.
 */
export function whatsappLinkTo(number: string, message?: string): string {
  const digits = number.replace(/\D/g, "");
  const withCountry = digits.length <= 11 ? `55${digits}` : digits;
  const url = new URL(`https://wa.me/${withCountry}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}
