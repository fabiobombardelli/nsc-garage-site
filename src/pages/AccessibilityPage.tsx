import { PageHeader } from "@/components/layout/PageHeader";
import { schedulingRules } from "@/content/scheduling";
import { backendMode } from "@/features/scheduling";
import { whatsappLink } from "@/lib/whatsapp";

const SHORTCUTS = [
  { keys: "Alt + 1", target: "Conteúdo principal" },
  { keys: "Alt + 2", target: "Menu" },
  { keys: "Alt + 3", target: "Contato (ordem de serviço)" },
  { keys: "Alt + 4", target: "Rodapé" },
];

/** Data da última revisão desta declaração. */
const LAST_REVIEW = "5 de novembro de 2026";

/**
 * Declaração de acessibilidade: o compromisso, os recursos, como navegar,
 * o que foi verificado e as limitações conhecidas, com um canal para
 * relatar barreiras (recomendação do eMAG e próximo passo de
 * ACESSIBILIDADE.md).
 */
export function AccessibilityPage() {
  return (
    <div className="page container-site">
      <PageHeader
        title="Acessibilidade"
        lead="Como o site da NSC Garage foi feito para todas as pessoas, e como ajustá-lo para você."
      />

      <article className="prose">
        <section aria-labelledby="compromisso">
          <h2 id="compromisso">Nosso compromisso</h2>
          <p>
            Queremos que todas as pessoas consigam conhecer a oficina, agendar e acompanhar um
            atendimento, inclusive quem usa leitor de tela, navega só pelo teclado, enxerga pouco, é
            daltônico ou sente desconforto com movimento na tela.
          </p>
          <p>
            A meta é o nível AA das Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2, do
            W3C, seguindo também o Modelo de Acessibilidade em Governo Eletrônico (eMAG 3.1) e o
            artigo 63 da Lei Brasileira de Inclusão (Lei 13.146/2015).
          </p>
        </section>

        <section aria-labelledby="ajustes">
          <h2 id="ajustes">Ajuste o site para você</h2>
          <p>
            O botão <strong>Acessibilidade</strong>, no topo de todas as telas, abre o painel com
            três ajustes. A escolha fica salva neste navegador.
          </p>
          <ul>
            <li>
              <strong>Tamanho do texto:</strong> de 100% a 150%, sem quebrar a página.
            </li>
            <li>
              <strong>Alto contraste:</strong> preto, branco e amarelo, também pensado para
              daltônicos.
            </li>
            <li>
              <strong>Reduzir movimento:</strong> para o vídeo, a fumaça e as animações do carro.
            </li>
          </ul>
          <p>
            Sem mexer em nada, o site já segue o que estiver configurado no seu sistema: movimento
            reduzido, contraste alto e o modo de alto contraste do Windows.
          </p>
        </section>

        <section aria-labelledby="atalhos">
          <h2 id="atalhos">Atalhos de teclado</h2>
          <p>
            Os atalhos seguem o padrão do eMAG, o mesmo dos sites do governo. Os links aparecem no
            topo ao apertar Tab pela primeira vez.
          </p>
          <table className="prose-table">
            <caption className="sr-only-text">Atalhos de teclado do site</caption>
            <thead>
              <tr>
                <th scope="col">Atalho</th>
                <th scope="col">Leva para</th>
              </tr>
            </thead>
            <tbody>
              {SHORTCUTS.map((shortcut) => (
                <tr key={shortcut.keys}>
                  <td>
                    <kbd>{shortcut.keys}</kbd>
                  </td>
                  <td>{shortcut.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>No Firefox, use Alt + Shift + número. No Mac, Control + Option + número.</p>
        </section>

        <section aria-labelledby="navegar">
          <h2 id="navegar">Navegando pelo teclado e com leitor de tela</h2>
          <ul>
            <li>Tab e Shift + Tab passam pelos links, botões e campos, na ordem da tela.</li>
            <li>
              Nas escolhas do agendamento (serviço, dia, horário) e na nota da avaliação, as setas
              trocam a opção.
            </li>
            <li>Esc fecha o menu do celular e o painel de acessibilidade.</li>
            <li>
              Ao trocar de tela, o foco vai para o título da nova tela, e o leitor anuncia onde você
              chegou. Erros de formulário aparecem em texto ao lado do campo, e o foco vai para o
              primeiro campo com problema.
            </li>
            <li>
              Nada no site tem limite de tempo. O cancelamento pelo site vai até{" "}
              {schedulingRules.customerCancelHours} horas antes do horário, regra da oficina, e
              depois disso a equipe atende pelo WhatsApp.
            </li>
          </ul>
        </section>

        <section aria-labelledby="verificado">
          <h2 id="verificado">O que já foi verificado</h2>
          <ul>
            <li>
              Testes automáticos com o axe-core em todas as telas, nos temas padrão e de alto
              contraste, com movimento reduzido e com o texto em 150%, no computador e no celular.
            </li>
            <li>Percurso completo pelo teclado, também por teste automático.</li>
            <li>
              Contraste de todas as combinações de texto acima do mínimo do nível AA (4,5:1), e dos
              controles acima de 3:1.
            </li>
            <li>
              Sem rolagem lateral de 320 a 1920 pixels de largura, com zoom e espaçamento de texto
              ampliados.
            </li>
          </ul>
        </section>

        <section aria-labelledby="limitacoes">
          <h2 id="limitacoes">Limitações conhecidas</h2>
          <ul>
            <li>
              Os testes manuais com leitores de tela (NVDA, VoiceOver e TalkBack) ainda vão ser
              feitos com pessoas usuárias.
            </li>
            <li>
              O vídeo do topo é ilustrativo e sem som. Ele tem uma descrição curta, mas não tem
              audiodescrição.
            </li>
            {backendMode === "local" && (
              <li>
                Nesta versão de demonstração, os agendamentos ficam guardados só no navegador usado.
              </li>
            )}
          </ul>
        </section>

        <section aria-labelledby="barreira">
          <h2 id="barreira">Encontrou uma barreira?</h2>
          <p>
            Conte para a gente o que aconteceu e em qual tela. Vamos responder e corrigir.{" "}
            <a
              className="text-link"
              href={whatsappLink(
                "Olá! Encontrei um problema de acessibilidade no site da NSC Garage:",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Avisar pelo WhatsApp
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
