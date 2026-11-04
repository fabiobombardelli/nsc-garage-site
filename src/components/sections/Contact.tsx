import { AtSign, Clock, Mail, MapPin, MessageCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/contact/ContactForm";
import { contact } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

export function Contact() {
  return (
    <section
      id="contato"
      className="relative z-30 border-t border-border bg-secondary py-20 sm:py-28"
    >
      <div className="container-site grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="eyebrow">Contato</p>
          <h2 className="section-title mt-3">Vamos acelerar seu projeto?</h2>
          <p className="mt-6 max-w-[46ch] leading-relaxed text-muted-foreground">
            Conte sobre o seu carro e o que você busca. Nossa equipe responde pelo WhatsApp para
            agendar uma avaliação.
          </p>

          <ul className="mt-10 space-y-6">
            <ContactItem icon={MessageCircle} label="WhatsApp">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link">
                {contact.whatsapp.display}
              </a>
            </ContactItem>

            {contact.instagram && (
              <ContactItem icon={AtSign} label="Instagram">
                <a
                  href={`https://instagram.com/${contact.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  @{contact.instagram}
                </a>
              </ContactItem>
            )}

            {contact.email && (
              <ContactItem icon={Mail} label="E-mail">
                <a href={`mailto:${contact.email}`} className="link">
                  {contact.email}
                </a>
              </ContactItem>
            )}

            <ContactItem icon={MapPin} label="Endereço">
              <span className="block">{contact.address.street}</span>
              <span className="block">{contact.address.city}</span>
              {contact.address.mapsUrl && (
                <a
                  href={contact.address.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link mt-1 inline-block"
                >
                  Como chegar
                </a>
              )}
            </ContactItem>

            <ContactItem icon={Clock} label="Horário">
              {contact.hours.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </ContactItem>
          </ul>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}

type ContactItemProps = { icon: LucideIcon; label: string; children: ReactNode };

function ContactItem({ icon: Icon, label, children }: ContactItemProps) {
  return (
    <li className="flex gap-4">
      <Icon className="mt-0.5 shrink-0 text-primary" size={20} aria-hidden="true" />
      <div className="text-sm leading-relaxed">
        <p className="text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          {label}
        </p>
        <div className="mt-1 text-foreground">{children}</div>
      </div>
    </li>
  );
}
