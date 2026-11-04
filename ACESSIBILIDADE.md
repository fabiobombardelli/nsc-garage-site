# Acessibilidade: NSC Garage

**Meta:** WCAG 2.2 nível AA, com os atalhos de acesso do eMAG (o padrão brasileiro usado nos sites
gov.br).

**Situação:** a base de design e de código está pronta e foi verificada com testes automáticos. A
auditoria formal, os testes com leitores de tela e o painel de acessibilidade visível ficam para
quando chegar o documento WCAG de referência (veja "Próximos passos").

## Como conferir os modos

O site segue sozinho as preferências do sistema: **reduzir movimento**, **contraste alto** e o
**modo de alto contraste do Windows**. Para ver cada modo sem mexer no sistema, abra o site com um
destes parâmetros na URL. A escolha fica salva no navegador.

| Parâmetro                | O que faz                                                    |
| ------------------------ | ------------------------------------------------------------ |
| `?movimento=reduzido`    | Para animações, vídeo automático, fumaça e o carro do rodapé |
| `?movimento=completo`    | Liga o movimento mesmo que o sistema peça para reduzir       |
| `?contraste=alto`        | Tema preto, branco e amarelo                                 |
| `?contraste=normal`      | Tema normal mesmo com contraste alto no sistema              |
| `?fonte=125`             | Texto em 125% (aceita de 100 a 150)                          |
| `?acessibilidade=padrao` | Apaga as escolhas e volta a seguir o sistema                 |

Os parâmetros podem ser combinados: `?contraste=alto&fonte=150`.

## Como ligar um painel de acessibilidade

Toda a lógica está em `src/lib/accessibility.ts`. Um painel futuro (botões "A+", "Alto contraste",
"Reduzir movimento") só precisa chamar uma função; o CSS e os componentes já reagem.

```ts
import { FONT_SCALES, setAccessibilityPreferences } from "@/lib/accessibility";

setAccessibilityPreferences({ contrast: "high" }); // "system" | "high" | "normal"
setAccessibilityPreferences({ motion: "reduce" }); // "system" | "reduce" | "full"
setAccessibilityPreferences({ fontScale: FONT_SCALES[2] }); // 1 | 1.125 | 1.25 | 1.5
```

As preferências chegam ao CSS como atributos no `<html>`:

- `data-motion="reduce"` desliga as animações; nos componentes React, use o hook `useReducedMotion()`.
- `data-contrast="high"` troca as cores do tema (`src/styles/theme.css`).
- `--font-scale` multiplica todo o texto.

## Atalhos de acesso (eMAG)

| Atalho  | Destino                    |
| ------- | -------------------------- |
| Alt + 1 | Conteúdo principal         |
| Alt + 2 | Menu                       |
| Alt + 3 | Contato (ordem de serviço) |
| Alt + 4 | Rodapé                     |

No Firefox use Alt + Shift + número e no Mac, Control + Option + número. Os quatro links aparecem no
topo ao primeiro Tab.

## O que já está implementado

| Critério WCAG                                 | Como o site atende                                                                                                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1.1 Conteúdo não textual (A)                | Fotos com texto alternativo descritivo. O vídeo do topo tem descrição e legenda visível. Carro, pista, cones e fumaça são decorativos e ficam ocultos para leitores de tela. |
| 1.3.1 Informações e relações (A)              | Regiões (`header`, `nav`, `main`, `footer`), um `h1` e títulos em ordem, lista ordenada dos marcos, lista de definições dos fatos, rótulos ligados aos campos.               |
| 1.3.2 Sequência com significado (A)           | A ordem do código é a ordem de leitura, inclusive nas duas frases do slogan.                                                                                                 |
| 1.3.5 Identificar o propósito da entrada (AA) | O campo de nome tem `autocomplete="name"`.                                                                                                                                   |
| 1.4.1 Uso de cor (A)                          | Erro tem ícone e texto, links são sublinhados, gaveta aberta tem ícone girado e `aria-expanded`. Nada depende só de cor, inclusive para daltônicos.                          |
| 1.4.3 Contraste mínimo (AA)                   | Todos os pares de texto passam com folga (tabela abaixo), inclusive sobre o vídeo.                                                                                           |
| 1.4.4 Redimensionar texto (AA)                | Tamanhos em rem, que crescem com o zoom do navegador e com a escala do site (até 150%).                                                                                      |
| 1.4.10 Reflow (AA)                            | Sem rolagem horizontal de 320 a 1920 px.                                                                                                                                     |
| 1.4.11 Contraste não textual (AA)             | Anel de foco amarelo de 3px; controles com borda que vira contorno no modo de alto contraste do Windows.                                                                     |
| 1.4.12 Espaçamento de texto (AA)              | Com o espaçamento máximo do critério, nenhum texto é cortado de 320 a 1920 px, também com a fonte em 150%.                                                                   |
| 2.1.1 Teclado (A)                             | Menu, gavetas, formulário, pausas e atalhos funcionam pelo teclado.                                                                                                          |
| 2.1.2 Sem bloqueio do teclado (A)             | O menu do celular prende o foco só enquanto aberto; Esc e "Fechar" liberam e devolvem o foco ao botão "Menu".                                                                |
| 2.1.4 Atalhos por caractere (A)               | Os atalhos sempre usam uma tecla modificadora (Alt).                                                                                                                         |
| 2.2.2 Pausar, parar, ocultar (A)              | Vídeo do topo e carro do rodapé têm botão de pausa e param fora da tela. O carro da Trajetória só anda quando a pessoa rola.                                                 |
| 2.3.1 Três flashes (A)                        | Não há flashes.                                                                                                                                                              |
| 2.4.1 Ignorar blocos (A)                      | Atalhos de acesso e o destino `#conteudo`.                                                                                                                                   |
| 2.4.2 Página com título (A)                   | `<title>` descritivo.                                                                                                                                                        |
| 2.4.3 Ordem do foco (A)                       | Segue a ordem visual.                                                                                                                                                        |
| 2.4.4 Finalidade do link (A)                  | Textos descritivos; links do WhatsApp avisam "(abre em nova aba)" para leitores de tela.                                                                                     |
| 2.4.6 Cabeçalhos e rótulos (AA)               | Cada seção tem título; cada campo tem rótulo visível.                                                                                                                        |
| 2.4.7 Foco visível (AA)                       | Anel amarelo de 3px afastado 3px (9:1 ou mais sobre o grafite); no rodapé vermelho, anel claro.                                                                              |
| 2.4.11 Foco não encoberto (AA, novo na 2.2)   | O header fixo nunca cobre o elemento em foco (`scroll-padding-top` e correção no `Header.tsx`).                                                                              |
| 2.5.8 Tamanho do alvo (AA)                    | Todos os controles têm 44 × 44 px ou mais (o critério pede 24).                                                                                                              |
| 3.1.1 Idioma da página (A)                    | `lang="pt-BR"`.                                                                                                                                                              |
| 3.3.1 Identificação do erro (A)               | Erro em texto, com ícone, `aria-invalid` e foco no primeiro campo com problema.                                                                                              |
| 3.3.2 Rótulos ou instruções (A)               | Rótulos visíveis, campos obrigatórios explicados em texto, dicas ligadas ao campo.                                                                                           |
| 4.1.2 Nome, função, valor (A)                 | Elementos nativos; gavetas no padrão accordion (`aria-expanded`, `aria-controls`); menu como diálogo (`role="dialog"`, `aria-modal`); botões de pausa com nome que muda.     |
| 4.1.3 Mensagens de status (AA)                | O resultado do formulário é anunciado (`role="status"`).                                                                                                                     |

### Contraste das cores do tema

| Texto sobre fundo                                | Contraste | Mínimo AA          |
| ------------------------------------------------ | --------- | ------------------ |
| Texto principal sobre o grafite                  | 16,2:1    | 4,5:1              |
| Texto principal sobre a bancada (cupom, gavetas) | 12,1:1    | 4,5:1              |
| Texto secundário sobre o grafite                 | 9,0:1     | 4,5:1              |
| Texto secundário sobre a bancada                 | 6,7:1     | 4,5:1              |
| Texto sobre a faixa escura da Trajetória         | 18,2:1    | 4,5:1              |
| Texto claro sobre o vermelho (botões, rodapé)    | 5,2:1     | 4,5:1              |
| Texto claro sobre o vermelho do hover            | 6,9:1     | 4,5:1              |
| Texto escuro sobre o painel de luz               | 17,0:1    | 4,5:1              |
| Mensagem de erro sobre a bancada                 | 5,8:1     | 4,5:1              |
| Slogan sobre o vídeo (pior de 19 quadros)        | 5,55:1    | 3:1 (texto grande) |
| Anel de foco sobre o grafite                     | 12,5:1    | 3:1                |

**Alto contraste:** branco sobre preto (21:1), branco sobre o vermelho `#d40000` (5,5:1), erro
`#ff8a8a` sobre preto (9,3:1) e foco amarelo `#ffe500` (16,5:1). Os componentes não mudam; só as
cores do tema.

### Movimento reduzido

Com o modo ligado:

- As entradas viram troca instantânea, sem deslocamento.
- O topo não fica preso na tela: as frases do slogan não saem e a página rola direto.
- O vídeo do topo não toca sozinho; o botão de reprodução continua lá.
- A fumaça some, e os anéis dos cones e o carro do rodapé ficam parados.
- O carro da Trajetória continua acompanhando a rolagem, porque é a própria pessoa que o move.

## Verificações desta entrega

- **axe-core 4.14:** 0 violações no tema padrão, no alto contraste, com movimento reduzido e com a
  fonte em 150%, em 1440 e 390 px.
- **Teclado:** percurso completo com Tab e Shift+Tab, menu do celular, gavetas, formulário, pausas
  e atalhos, por teste automático no navegador.
- **Foco não encoberto:** 0 elementos cobertos pelo header em 136 paradas de foco (1440 px) e 135
  (390 px).
- **Espaçamento de texto e fonte ampliada:** 0 textos cortados de 320 a 1920 px.
- **Contraste sobre o vídeo:** 19 quadros medidos; pior caso de 5,55:1.

## Pontos de atenção para a auditoria

1. **Slogan do topo:** é medido pela largura da tela para caber em uma linha. Por isso mantém o
   mesmo tamanho físico com o zoom do navegador, embora já seja cerca de sete vezes maior que o
   texto. Se a auditoria pedir que ele também cresça com o zoom, troque a medida por uma fórmula com
   parte em rem.
2. **Campos do formulário:** não têm borda visível. O grafite sobre a bancada dá 1,3:1, e quem
   identifica o campo é o rótulo visível. Se a auditoria pedir 3:1 no limite do campo, adicione uma
   borda de 2px na cor `muted`.
3. **Atalhos (accesskey):** a combinação muda de navegador para navegador e pode coincidir com
   atalhos de leitores de tela. Os mesmos links também funcionam pelo Tab.
4. **Vídeo do topo:** é ilustrativo, sem som, e tem uma descrição curta. Se o cliente o considerar
   informativo, adicione uma descrição mais longa (critério 1.2.1).
5. **Palavras longas:** com fonte em 150%, espaçamento máximo e tela de 320 px ao mesmo tempo, uma
   palavra pode quebrar no meio, sem perda de conteúdo.
6. **Carro da Trajetória:** continua acompanhando a rolagem no modo de movimento reduzido, porque é a
   própria pessoa que o move. O critério que pediria pará-lo (2.3.3) é de nível AAA.
7. **Ainda não feito:** o painel de acessibilidade visível (a API está pronta) e os testes manuais
   com NVDA, VoiceOver e TalkBack.

## Próximos passos

Quando chegar o documento WCAG de referência:

1. Ligar cada requisito do documento a uma linha da tabela acima (matriz de rastreabilidade).
2. Criar o painel de acessibilidade no topo: tamanho da fonte, alto contraste e movimento.
3. Testar com leitores de tela e registrar os resultados aqui.
4. Publicar uma declaração de acessibilidade, se o cliente quiser.

O futuro sistema de abertura e acompanhamento de chamados deve seguir os mesmos padrões: tokens do
tema, rótulos visíveis, erros em texto, mensagens de status anunciadas e foco visível.
