import { contact } from "@/content/site";

/** Gera o link do WhatsApp da oficina, opcionalmente com uma mensagem pronta. */
export function whatsappLink(message?: string): string {
  const url = new URL(`https://wa.me/${contact.whatsapp.number}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}
