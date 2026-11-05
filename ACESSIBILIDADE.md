# Acessibilidade: NSC Garage

**Meta:** WCAG 2.2 nível AA, com os atalhos de acesso do eMAG 3.1 (o padrão brasileiro usado nos
sites gov.br) e o artigo 63 da Lei Brasileira de Inclusão (Lei 13.146/2015).

**Situação (5 de novembro de 2026):** todas as telas, da página inicial ao painel da oficina,
seguem o mesmo padrão e passam nos testes automáticos (axe-core, teclado, espaçamento de texto,
fonte ampliada e foco). O site tem painel de acessibilidade visível e uma declaração de
acessibilidade (`#/acessibilidade`). Faltam os testes manuais com leitores de tela e com pessoas
usuárias (veja "Próximos passos").

No modelo de requisitos, acessibilidade é **requisito não funcional** (RNF-01, que absorve RF-010
Leitores de tela e RF-011 Texto alternativo, mantendo os IDs), e vale para todas as telas. Os
casos de teste TC-010 e TC-011 são os testes descritos em "Verificações desta entrega".

## O padrão, em uma página

Toda tela nova deve seguir estas regras (é o que os testes conferem):

1. **Semântica primeiro.** Elementos nativos (`button`, `a`, `input`, `fieldset`/`legend`,
   `dl`, `table`), um `h1` por tela e títulos em ordem. Nada de `div` clicável.
2. **Rótulo visível em todo campo**, ligado pelo `for`; dica e erro ligados por
   `aria-describedby`; erro com `aria-invalid`, ícone e texto. O componente
   `components/forms/Field.tsx` faz essas ligações sozinho.
3. **Foco sempre visível e nunca coberto:** anel amarelo de 3px; o header e o botão flutuante
   nunca escondem o elemento em foco.
4. **O foco vai para onde a pessoa precisa ler:** título da nova tela, título da etapa, primeiro
   campo com erro, pergunta de confirmação, resultado da consulta.
5. **Mudanças sem troca de foco são anunciadas** em `role="status"` (horário ocupado em outra
   aba, ajuste do painel, ação no painel da oficina).
6. **Cor nunca sozinha:** situação com ícone + texto, opção escolhida com o quadradinho marcado,
   opção desativada com borda tracejada e o motivo escrito.
7. **Contraste:** texto 4,5:1 ou mais; bordas de controles e foco 3:1 ou mais (token `--color-edge`).
8. **Alvos de 44 × 44 px** ou mais.
9. **Texto em rem**, crescendo até 150%; grades de uma coluna com `minmax(0, 1fr)`; palavras longas
   quebram em vez de sair da caixa.
10. **Movimento com propósito e com saída:** pausa em todo movimento contínuo; nada se move com
    `data-motion="reduce"`.
11. **Confirmar antes do que não tem volta** (cancelar, apagar), no próprio lugar, sem janela modal.

## Como conferir os modos

O site segue sozinho as preferências do sistema: **reduzir movimento**, **contraste alto** e o
**modo de alto contraste do Windows**. Para mudar dentro do site, use o botão
**Acessibilidade** (ícone no topo de todas as telas). Para testes, os mesmos modos também abrem
por parâmetros na URL (a escolha fica salva no navegador):

| Parâmetro                | O que faz                                                         |
| ------------------------ | ----------------------------------------------------------------- |
| `?movimento=reduzido`    | Para animações, vídeo automático, fumaça e os carros que se movem |
| `?movimento=completo`    | Liga o movimento mesmo que o sistema peça para reduzir            |
| `?contraste=alto`        | Tema preto, branco e amarelo                                      |
| `?contraste=normal`      | Tema normal mesmo com contraste alto no sistema                   |
| `?fonte=125`             | Texto em 125% (aceita de 100 a 150)                               |
| `?acessibilidade=padrao` | Apaga as escolhas e volta a seguir o sistema                      |

Os parâmetros podem ser combinados e vêm antes da tela: `?contraste=alto&fonte=150#/agendar`.

## Painel de acessibilidade

`components/a11y/AccessibilityPanel.tsx`, no header de todas as telas. Segue o padrão
"disclosure" do WAI-ARIA: um botão com `aria-expanded` mostra o painel logo depois dele, sem
janela modal. Tem:

- **Tamanho do texto:** 100%, 112%, 125% e 150% (botões de opção; as setas trocam).
- **Alto contraste** e **Reduzir movimento:** chaves (`role="switch"`).
- **Restaurar padrão:** volta a seguir o sistema.
- Link para a declaração de acessibilidade.

Cada ajuste vale na hora e é anunciado (`role="status"`). Esc fecha e devolve o foco ao botão.
Toda a lógica está em `src/lib/accessibility.ts`:

```ts
import { FONT_SCALES, setAccessibilityPreferences } from "@/lib/accessibility";

setAccessibilityPreferences({ contrast: "high" }); // "system" | "high" | "normal"
setAccessibilityPreferences({ motion: "reduce" }); // "system" | "reduce" | "full"
setAccessibilityPreferences({ fontScale: FONT_SCALES[2] }); // 1 | 1.125 | 1.25 | 1.5
```

As preferências chegam ao CSS como atributos no `<html>`: `data-motion="reduce"` desliga as
animações (nos componentes, use o hook `useReducedMotion()`), `data-contrast="high"` troca as
cores do tema (`src/styles/theme.css`) e `--font-scale` multiplica todo o texto. O hook
`useAccessibilityPreferences()` lê o que está valendo agora.

## Atalhos de acesso (eMAG)

| Atalho  | Destino                    |
| ------- | -------------------------- |
| Alt + 1 | Conteúdo principal         |
| Alt + 2 | Menu                       |
| Alt + 3 | Contato (ordem de serviço) |
| Alt + 4 | Rodapé                     |

No Firefox use Alt + Shift + número e no Mac, Control + Option + número. Os quatro links aparecem no
topo ao primeiro Tab. Nas telas internas, "Ir para o contato" abre a página inicial já no contato.

## Telas com várias etapas e troca de tela

O site é uma aplicação de página única com navegação por `#/` (`src/app/router.ts`). Cada troca
de tela (`src/app/useRouteFocus.ts`):

- muda o título da aba (WCAG 2.4.2), por exemplo "Agendar avaliação | NSC Garage";
- leva o foco ao `h1` da nova tela e volta a rolagem ao topo, para o leitor anunciar onde a pessoa
  chegou (2.4.3);
- mantém os links internos da tela (como "Ir para o conteúdo") funcionando sem trocar de tela.

No agendamento, cada etapa é um formulário com `fieldset`/`legend`; o título da etapa recebe o
foco e é lido como "Etapa 2 de 4: Quando você traz o carro?". A lista de etapas abaixo da pista
marca a atual com `aria-current="step"` e as feitas com "(concluída)". A pista e o carro são
decorativos (`aria-hidden`).

## O que já está implementado

| Critério WCAG                                  | Como o site atende                                                                                                                                                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1.1.1 Conteúdo não textual (A)                 | Fotos com texto alternativo descritivo. O vídeo do topo tem descrição e legenda visível. Carros, pistas, cones, fumaça e a vaga do estado vazio são decorativos e ficam ocultos para leitores de tela.             |
| 1.3.1 Informações e relações (A)               | Regiões (`header`, `nav`, `main`, `footer`), um `h1` por tela, títulos em ordem, `fieldset`/`legend` nos grupos de opções, `dl` nas informações do agendamento, tabela com cabeçalhos na declaração.               |
| 1.3.2 Sequência com significado (A)            | A ordem do código é a ordem de leitura, inclusive no slogan, nas etapas do agendamento e no cupom (etapa antes do resumo).                                                                                         |
| 1.3.5 Identificar o propósito da entrada (AA)  | `autocomplete` em nome, telefone (`tel-national`), e-mail e senha (`current-password`).                                                                                                                            |
| 1.4.1 Uso de cor (A)                           | Situação com ícone + texto; opção escolhida com o quadradinho marcado; opção desativada com borda tracejada e motivo escrito; erro com ícone e texto; links sublinhados.                                           |
| 1.4.3 Contraste mínimo (AA)                    | Todos os pares de texto passam com folga (tabela abaixo), inclusive sobre o vídeo e sobre a laca vermelha.                                                                                                         |
| 1.4.4 Redimensionar texto (AA)                 | Tamanhos em rem, que crescem com o zoom e com o painel (até 150%). O menu vira "Menu" quando os links não cabem.                                                                                                   |
| 1.4.10 Reflow (AA)                             | Sem rolagem horizontal de 320 a 1920 px, em todas as telas, também com a fonte em 150%.                                                                                                                            |
| 1.4.11 Contraste não textual (AA)              | Borda de 2px `--color-edge` em todo controle (3,7:1 sobre a bancada, 4,9:1 sobre o grafite); anel de foco amarelo de 3px; contornos visíveis no alto contraste do Windows.                                         |
| 1.4.12 Espaçamento de texto (AA)               | Com o espaçamento máximo do critério, nenhum texto é cortado de 320 a 1920 px, em todas as telas, também com a fonte em 150%.                                                                                      |
| 1.4.13 Conteúdo em foco ou passagem (AA)       | Não há conteúdo que aparece ao passar o mouse. O painel de acessibilidade só abre por clique ou Enter e fecha com Esc.                                                                                             |
| 2.1.1 Teclado (A)                              | Tudo funciona pelo teclado: menu, gavetas, formulários, escolha de serviço, dia, horário e nota (setas), cancelamento, painel da oficina, painel de acessibilidade, pausas e atalhos.                              |
| 2.1.2 Sem bloqueio do teclado (A)              | O menu do celular prende o foco só enquanto aberto; Esc e "Fechar" liberam e devolvem o foco ao botão "Menu". O painel de acessibilidade não prende o foco.                                                        |
| 2.1.4 Atalhos por caractere (A)                | Os atalhos sempre usam uma tecla modificadora (Alt).                                                                                                                                                               |
| 2.2.1 Ajustável por temporização (A)           | Nenhuma tela tem limite de tempo. O prazo de cancelamento (24 h antes) é regra do negócio, não tempo de tela.                                                                                                      |
| 2.2.2 Pausar, parar, ocultar (A)               | Vídeo do topo e carro do rodapé têm pausa e param fora da tela. O "zerinho" do comprovante gira sem parar e também tem pausa e para fora da tela. O carro da pista de etapas só anda quando a pessoa avança (1 s). |
| 2.3.1 Três flashes (A)                         | Não há flashes.                                                                                                                                                                                                    |
| 2.4.1 Ignorar blocos (A)                       | Atalhos de acesso e o destino `#conteudo` em todas as telas.                                                                                                                                                       |
| 2.4.2 Página com título (A)                    | Cada tela tem título próprio na aba.                                                                                                                                                                               |
| 2.4.3 Ordem do foco (A)                        | Segue a ordem visual. Na troca de tela e de etapa, o foco vai para o título; depois de cancelar, para o título do cartão; depois de mudar a situação no painel, para "Avisar cliente pelo WhatsApp".               |
| 2.4.4 Finalidade do link (A)                   | Textos descritivos; links do WhatsApp avisam "(abre em nova aba)"; "Alterar" na revisão diz o quê ("Alterar serviço").                                                                                             |
| 2.4.6 Cabeçalhos e rótulos (AA)                | Cada seção, etapa e dia da agenda tem título; cada campo tem rótulo visível.                                                                                                                                       |
| 2.4.7 Foco visível (AA)                        | Anel amarelo de 3px afastado 3px; no rodapé vermelho e no painel de luz do protocolo, anel escuro ou claro conforme o fundo.                                                                                       |
| 2.4.11 Foco não encoberto (AA, novo na 2.2)    | O header fixo nunca cobre o elemento em foco (`scroll-padding-top` e correção no `Header.tsx`); `scroll-padding-bottom` deixa o foco acima do botão flutuante, que só existe na página inicial.                    |
| 2.5.3 Rótulo no nome (A)                       | O nome acessível começa pelo texto visível ("Agendar avaliação de preparação para drift"; o botão Acessibilidade tem o mesmo nome do texto).                                                                       |
| 2.5.7 Movimentos de arrastar (AA, novo na 2.2) | Nada depende de arrastar.                                                                                                                                                                                          |
| 2.5.8 Tamanho do alvo (AA, novo na 2.2)        | Todos os controles têm 44 × 44 px ou mais, inclusive as estrelas da avaliação e os botões "Alterar".                                                                                                               |
| 3.1.1 Idioma da página (A)                     | `lang="pt-BR"`.                                                                                                                                                                                                    |
| 3.2.3 Navegação consistente (AA)               | Header, atalhos e rodapé iguais em todas as telas, na mesma ordem; o link da tela atual leva `aria-current="page"`.                                                                                                |
| 3.2.4 Identificação consistente (AA)           | A mesma ação tem o mesmo nome em toda parte ("Agendar avaliação", "Cancelar agendamento") e o mesmo visual (botão de laca para a ação principal, de contorno para a secundária).                                   |
| 3.2.6 Ajuda consistente (A, novo na 2.2)       | O contato pelo WhatsApp fica no rodapé de todas as telas, sempre no mesmo lugar.                                                                                                                                   |
| 3.3.1 Identificação do erro (A)                | Erro em texto, com ícone, `aria-invalid` e foco no primeiro campo com problema.                                                                                                                                    |
| 3.3.2 Rótulos ou instruções (A)                | Rótulos visíveis, obrigatórios explicados em texto, dicas de formato ligadas ao campo ("como (11) 98765-4321").                                                                                                    |
| 3.3.3 Sugestão de erro (AA)                    | Cada erro diz como corrigir ("Digite o telefone com DDD, por exemplo (11) 98765-4321").                                                                                                                            |
| 3.3.4 Prevenção de erros (AA)                  | O agendamento passa por uma revisão com "Alterar" em cada linha antes de gravar; cancelar e apagar pedem confirmação.                                                                                              |
| 3.3.7 Entrada redundante (A, novo na 2.2)      | Nada é pedido duas vezes: o resumo mostra o que já foi escolhido, o telefone do agendamento já vem na consulta e o protocolo vem no link do comprovante.                                                           |
| 3.3.8 Autenticação acessível (AA, novo na 2.2) | O acesso ao painel é por senha comum, que aceita colar e gerenciador de senhas. Não há teste cognitivo.                                                                                                            |
| 4.1.2 Nome, função, valor (A)                  | Elementos nativos; gavetas no padrão accordion; menu como diálogo; painel de acessibilidade como disclosure (`aria-expanded`); chaves com `role="switch"`; filtros com `aria-pressed`.                             |
| 4.1.3 Mensagens de status (AA)                 | Anunciados sem mover o foco: resultado do formulário, horário ocupado em outra aba, protocolo copiado, ajustes do painel, mudanças de situação no painel da oficina, quantidade de agendamentos encontrados.       |

### Contraste das cores do tema

| Par (texto ou controle sobre fundo)             | Contraste | Mínimo AA          |
| ----------------------------------------------- | --------- | ------------------ |
| Texto principal sobre o grafite                 | 16,2:1    | 4,5:1              |
| Texto principal sobre a bancada (cupom, fichas) | 12,1:1    | 4,5:1              |
| Texto principal sobre o piso (pista, vaga)      | 13,8:1    | 4,5:1              |
| Texto secundário sobre o grafite                | 9,0:1     | 4,5:1              |
| Texto secundário sobre a bancada                | 6,7:1     | 4,5:1              |
| Texto secundário sobre o piso                   | 7,6:1     | 4,5:1              |
| Texto sobre a faixa escura da Trajetória        | 18,2:1    | 4,5:1              |
| Texto claro sobre o vermelho (botões, opção)    | 5,2:1     | 4,5:1              |
| Texto claro sobre o vermelho do hover           | 6,9:1     | 4,5:1              |
| Texto escuro sobre o painel de luz (protocolo)  | 17,0:1    | 4,5:1              |
| Selo "Pendente" (texto sobre bancada forte)     | 9,8:1     | 4,5:1              |
| Mensagem de erro sobre a bancada                | 5,8:1     | 4,5:1              |
| Slogan sobre o vídeo (pior de 19 quadros)       | 5,55:1    | 3:1 (texto grande) |
| Borda de controle sobre a bancada               | 3,7:1     | 3:1                |
| Borda de controle sobre o grafite               | 4,9:1     | 3:1                |
| Borda clara da opção escolhida sobre o vermelho | 4,9:1     | 3:1                |
| Anel de foco sobre o grafite                    | 12,5:1    | 3:1                |

**Alto contraste:** branco sobre preto (21:1), branco sobre o vermelho `#d40000` (5,5:1), erro
`#ff8a8a` sobre preto (9,3:1), bordas de controle brancas e foco amarelo `#ffe500` (16,5:1). Os
componentes não mudam; só as cores do tema.

### Movimento reduzido

Com o modo ligado:

- As entradas viram troca instantânea, sem deslocamento.
- O topo não fica preso na tela e o vídeo não toca sozinho; o botão de reprodução continua lá.
- A fumaça some, e os anéis dos cones e o carro do rodapé ficam parados.
- No agendamento, o carro aparece direto no cone da etapa, e o "zerinho" do comprovante fica
  parado, com o círculo de borracha já marcado (sem botão de pausa, porque nada se move).
- O carro da Trajetória continua acompanhando a rolagem, porque é a própria pessoa que o move.

## Verificações desta entrega

Todos os testes ficam em `scripts/qa/` e rodam contra o build servido
(`npm run build && npx vite preview --port 4173`).

| Teste               | O que confere                                                                                                       | Resultado                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `axe.cjs`           | axe-core 4 na página inicial: padrão, alto contraste, movimento reduzido e fonte 150%, em 1440 e 390 px             | 0 violações nos 8 cenários                                                  |
| `telas.cjs`         | axe-core em 13 estados das telas internas (cada etapa, erros, comprovante, consulta, avaliação, painel, declaração) | 0 violações em 104 verificações (13 × 4 modos × 2)                          |
| `keyboard.cjs`      | Atalhos, gavetas, ordem de serviço e menu do celular só pelo teclado                                                | 19 de 19 ✓                                                                  |
| `agendamento.cjs`   | O agendamento inteiro só pelo teclado: foco em cada etapa, erros, troca de tela, cancelar, painéis                  | 20 de 20 ✓                                                                  |
| `layout.cjs`        | Espaçamento de texto (1.4.12) e fonte 150% em 5 telas e 6 larguras, sem cortes; foco nunca coberto pelo header      | 0 cortes em 60 combinações; 0 focos cobertos em 138 paradas (1440 e 390 px) |
| `npm test` (Vitest) | Regras de negócio e casos de uso (TC-014 a TC-021)                                                                  | 54 de 54 ✓                                                                  |

## Pontos de atenção para a auditoria

1. **Slogan do topo:** é medido pela largura da tela para caber em uma linha. Por isso mantém o
   mesmo tamanho físico com o zoom do navegador, embora já seja cerca de sete vezes maior que o
   texto. Se a auditoria pedir que ele também cresça com o zoom, troque a medida por uma fórmula com
   parte em rem.
2. **Atalhos (accesskey):** a combinação muda de navegador para navegador e pode coincidir com
   atalhos de leitores de tela. Os mesmos links também funcionam pelo Tab.
3. **Vídeo do topo:** é ilustrativo, sem som, e tem uma descrição curta. Se o cliente o considerar
   informativo, adicione uma descrição mais longa (critério 1.2.1).
4. **Palavras longas:** com fonte em 150%, espaçamento máximo e tela de 320 px ao mesmo tempo, uma
   palavra pode quebrar no meio, sem perda de conteúdo.
5. **Carro da Trajetória:** continua acompanhando a rolagem no modo de movimento reduzido, porque é a
   própria pessoa que o move. O critério que pediria pará-lo (2.3.3) é de nível AAA.
6. **Painel da oficina (protótipo):** a senha é conferida no navegador e os dados ficam no
   `localStorage`. Isso não afeta a acessibilidade, mas é uma limitação de segurança documentada no
   README; em produção o acesso vai para o servidor.
7. **Ainda não feito:** testes manuais com NVDA (Windows), VoiceOver (iPhone e Mac) e TalkBack
   (Android), e testes com pessoas usuárias.

## Próximos passos

1. Roteiro manual com NVDA e VoiceOver no agendamento completo, registrando os resultados aqui
   (TC-010).
2. Teste com pessoas usuárias com deficiência, se possível com o cliente.
3. Revisar a declaração de acessibilidade (`src/pages/AccessibilityPage.tsx`) a cada entrega.
