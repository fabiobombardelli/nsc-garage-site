import { PageHeader } from "@/components/layout/PageHeader";
import { contact, site } from "@/content/site";
import { backendMode } from "@/features/scheduling";
import { whatsappLink } from "@/lib/whatsapp";

/** Data da última revisão deste aviso. */
const LAST_REVIEW = "5 de novembro de 2026";

/**
 * Aviso de privacidade (LGPD, Lei 13.709/2018; RNF-05). Descreve o que o
 * site coleta no agendamento, para quê, onde fica e como pedir acesso,
 * correção ou exclusão.
 *
 * TODO: texto-base fiel ao que o sistema faz. A oficina deve revisar
 * (prazo de guarda e responsável pelo atendimento aos pedidos) antes de
 * publicar.
 */
export function PrivacyPage() {
  return (
    <div className="page container-site">
      <PageHeader
        title="Privacidade"
        lead="Quais dados o site pede no agendamento, para que servem e como pedir para corrigir ou apagar."
      />

      <article className="prose">
        <section aria-labelledby="privacidade-quem">
          <h2 id="privacidade-quem">Quem cuida dos dados</h2>
          <p>
            {site.name}, {contact.address.street}, {contact.address.city}. Telefone{" "}
            {contact.phone.display}.
          </p>
        </section>

        <section aria-labelledby="privacidade-quais">
          <h2 id="privacidade-quais">Quais dados pedimos</h2>
          <ul>
            <li>No agendamento: nome, telefone, e-mail (opcional), o carro e as observações.</li>
            <li>Depois do atendimento: a nota e o comentário, se você quiser avaliar.</li>
            <li>
              O site não usa cookies de propaganda nem ferramentas de rastreamento. As escolhas do
              painel de acessibilidade ficam só no seu navegador.
            </li>
          </ul>
        </section>

        <section aria-labelledby="privacidade-para">
          <h2 id="privacidade-para">Para que usamos</h2>
          <p>
            Só para confirmar e registrar o seu atendimento: falar com você pelo WhatsApp ou pelo
            telefone, preparar a avaliação do carro e guardar o histórico que você consulta em “Meus
            agendamentos”. A base legal é o seu consentimento, dado na caixa de autorização do
            agendamento, e o atendimento que você pediu (LGPD, art. 7º, incisos I e V).
          </p>
        </section>

        <section aria-labelledby="privacidade-onde">
          <h2 id="privacidade-onde">Onde ficam</h2>
          <p>
            {backendMode === "supabase"
              ? "Numa base de dados na nuvem (Supabase), com acesso restrito à equipe da oficina por login. Quem visita o site só vê os horários ocupados, sem nenhum dado pessoal. Os dados não são vendidos nem passados a terceiros."
              : "Nesta versão de demonstração, os agendamentos ficam guardados só no navegador usado, e nada é enviado para a oficina."}
          </p>
        </section>

        <section aria-labelledby="privacidade-direitos">
          <h2 id="privacidade-direitos">Seus direitos</h2>
          <p>
            Você pode pedir a qualquer momento para ver, corrigir ou apagar os seus dados, e retirar
            a autorização (LGPD, art. 18). Os dados ficam guardados pelo tempo do atendimento e do
            que a lei exigir.{" "}
            <a
              className="text-link"
              href={whatsappLink("Olá! Quero falar sobre os meus dados no site da NSC Garage.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fazer um pedido pelo WhatsApp
              <span className="sr-only-text"> (abre em nova aba)</span>
            </a>
            .
          </p>
          <p className="prose-meta">Última revisão: {LAST_REVIEW}.</p>
        </section>
      </article>
    </div>
  );
}
