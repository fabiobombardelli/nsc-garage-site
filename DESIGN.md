---
name: NSC Garage
description: O box da NSC depois do expediente. Piso de epóxi grafite, luz branca de LED e o vermelho laqueado do carrinho de ferramentas.
colors:
  carbon: "oklch(0.205 0.005 250)"
  carbon-deep: "oklch(0.13 0.004 250)"
  floor: "oklch(0.265 0.005 250)"
  raised: "oklch(0.305 0.005 250)"
  raised-strong: "oklch(0.36 0.005 250)"
  ink: "oklch(0.965 0.003 250)"
  muted: "oklch(0.78 0.006 250)"
  accent: "oklch(0.55 0.21 27)"
  accent-strong: "oklch(0.48 0.19 27)"
  on-accent: "oklch(0.985 0.002 250)"
  on-light: "oklch(0.18 0.004 250)"
  paint: "oklch(0.93 0.003 250)"
  asphalt: "oklch(0.165 0.004 250)"
  rubber: "oklch(0.1 0.003 250)"
  focus: "oklch(0.88 0.17 95)"
  danger: "oklch(0.76 0.15 25)"
typography:
  monument:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 8cqw, 7.5rem)"
    fontWeight: 800
    lineHeight: 0.86
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 62"
  head:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.4rem + 3vw, 4.25rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.005em"
    fontVariation: "'wdth' 62"
  lead:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Archivo Variable, Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.55
rounded:
  none: "0px"
  full: "999px"
spacing:
  page-margin-phone: "1.25rem"
  page-margin: "2rem"
  grid-gap: "min(1.5rem, 2vw)"
  section-gap-phone: "7.5rem"
  section-gap: "10rem"
  panel: "1.5rem"
  work-order: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-small:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    padding: "0 1.125rem"
    height: "2.75rem"
  button-quiet:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 1.5rem"
    height: "3.25rem"
  button-quiet-hover:
    backgroundColor: "{colors.raised-strong}"
  icon-button:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    size: "2.75rem"
  field:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.75rem 1rem"
    height: "3.25rem"
  header-bar:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    height: "4.5rem"
  drawer-front:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0.875rem 1.25rem 0.75rem"
    height: "4rem"
  drawer-front-hover:
    backgroundColor: "{colors.accent-strong}"
  drawer-body:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    padding: "1.25rem 1.25rem 1.5rem"
  light-panel:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-light}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "1.25rem"
  work-order:
    backgroundColor: "{colors.raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.work-order}"
  whatsapp-button:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.none}"
    size: "3.5rem"
---

# Design System: NSC Garage

## Overview

**Creative North Star: "O box à noite"**

O site é o box da NSC depois do expediente. O carro de corrida descansa sob barras de LED branco, o piso de epóxi grafite devolve a luz e o carrinho de ferramentas vermelho fica encostado na parede. Tudo sai desse lugar: o fundo é grafite em camadas (nunca preto puro), o texto é a luz do LED, e o vermelho da marca é a laca do carrinho, aplicada só em superfícies (ações, cones, gavetas e o campo do rodapé).

O movimento é o assunto. O vídeo da equipe ocupa a tela inteira sob o slogan; ao rolar, ele fica preso enquanto as duas frases saem pelas laterais, e só então a página segue. No meio da página, o 350Z #69 desce uma pista de asfalto preto pelo piso do box conforme a página rola, deixa borracha e acende cada cone por onde passa. No rodapé, ele faz oitos sem parar em volta de dois cones. O resto da página entra com gestos curtos e mecânicos: linhas que sobem de uma máscara como placas erguidas, fotos que abrem como persiana, anos que giram como contador. Tudo para no modo de movimento reduzido.

Recusas confirmadas pelo cliente e pela direção: a folha de papel branca (o claro demais escurecia a pista e o carro), a página preta com neon vermelho, cards idênticos com ícone e o hero centralizado.

**Key Characteristics:**

- Grafite em quatro degraus tonais, sem sombras em repouso
- Archivo comprimido 800 em caixa alta para monumentos e títulos; largura normal para ler
- Vermelho só como laca de superfície: ação, cones, gavetas, rodapé
- Cantos retos em toda a interface; curvas só no assunto (pista, cones, fumaça)
- Movimento que nasce do drift, com pausa e modo reduzido
- Tokens prontos para alto contraste, fonte ampliada e WCAG 2.2 AA

## Colors

Uma escala de grafite frio em quatro degraus, luz de LED para todo o texto e um único vermelho laqueado.

### Primary

- **Vermelho laqueado** (`accent`): botões de ação ("Agendar avaliação"), as gavetas do carrinho de serviços, o bloco "Pioneiros do drift no Brasil", o corpo dos cones, o botão do WhatsApp e o campo inteiro do rodapé. Sempre preenchimento com `on-accent` por cima (5,2:1).
- **Vermelho sob o ponteiro** (`accent-strong`): o mesmo vermelho no hover de botões e gavetas (6,9:1 com `on-accent`).

### Neutral

- **Grafite** (`carbon`): fundo da página, header sólido, menu do celular e o interior dos campos do formulário.
- **Grafite profundo** (`carbon-deep`): só a faixa de abertura da Trajetória, de ponta a ponta. É o tom mais escuro da página, para a pista e o carro saírem de trás dela com contraste contra o piso.
- **Piso de epóxi** (`floor`): o fundo da Trajetória, onde corre a pista.
- **Bancada** (`raised`): superfícies elevadas: a ordem de serviço, o interior das gavetas, as células da Trajetória e o fundo das fotos enquanto carregam.
- **Bancada sob o ponteiro** (`raised-strong`): hover das superfícies elevadas e trilho da barra de rolagem.
- **Luz de LED** (`ink`): todo o texto (16:1 sobre o grafite). Também é o **painel de luz**: a nota sobre a foto da Oficina, a célula clara da Trajetória e os atalhos de acesso.
- **LED difuso** (`muted`): texto secundário, como descrições dos marcos, rótulos dos fatos e dicas de campo (9:1 sobre o grafite, 6,7:1 sobre a bancada).
- **Tinta sobre o vermelho** (`on-accent`) e **tinta sobre a luz** (`on-light`): o texto que vai sobre o vermelho e sobre os painéis de luz.
- **Tinta de piso** (`paint`): as bordas e a faixa central da pista, a faixa branca dos cones e a fumaça.
- **Asfalto** (`asphalt`): a superfície da pista, mais escura que o piso em volta para a pista se destacar como uma pista de verdade.
- **Borracha** (`rubber`): marcas de pneu e base dos cones.

### Functional

- **Amarelo de foco** (`focus`): o anel de foco do teclado, 3px, com 9:1 ou mais sobre qualquer grafite. No rodapé vermelho o anel passa a `ink`.
- **Vermelho de alerta** (`danger`): borda e texto de erro nos campos (7,7:1 sobre o grafite, 5,8:1 sobre a bancada). Mais claro que a laca, porque é texto.

### Named Rules

**A Regra da Laca.** O vermelho é superfície, nunca texto sobre o grafite. Onde há vermelho, há texto claro por cima.

**A Regra do Grafite.** O fundo nunca é preto puro fora do alto contraste. A profundidade vem dos quatro degraus (`carbon` → `floor` → `raised` → `raised-strong`); o grafite profundo é a única exceção, reservado à faixa de onde a pista sai.

**A Regra dos Tokens.** Componentes usam só os tokens de cor; preto translúcido aparece apenas em sombras e no scrim do vídeo. O alto contraste (`data-contrast="high"` ou `prefers-contrast: more`) troca os tokens por preto, branco, `#d40000` e amarelo `#ffe500`, sem tocar nos componentes.

## Typography

**Display Font:** Archivo Variable no eixo de largura em 62% (comprimida), peso 800, caixa alta (com ui-sans-serif e system-ui)
**Body Font:** Archivo Variable em largura normal, pesos 400 e 600

**Character:** Uma família só, servida pelo próprio site (`@fontsource-variable/archivo`, com o eixo `wdth`). Comprimida e pesada, vira a letra pintada na parede de um box; na largura normal, volta a ser texto calmo de ler.

### Hierarchy

- **Monument** (800, wdth 62, `clamp(1.75rem, 8cqw, 7.5rem)`, 0.86): só o slogan do topo. É medido pela largura útil do container (cqw), então a frase mais longa ocupa 79% da largura com ou sem barra de rolagem, deixando o vídeo respirar. Em containers abaixo de 30rem (celular), passa a `clamp(1.75rem, 13cqw, 3.25rem)` e cada frase quebra em duas linhas equilibradas, porque uma linha por frase deixaria o slogan com cerca de 28px.
- **Head** (800, wdth 62, `clamp(2.25rem, 1.4rem + 3vw, 4.25rem)`, 0.9): títulos de seção, os anos dos marcos e o bloco vermelho da Oficina.
- **Lead** (400, `clamp(1.25rem, 1.1rem + 0.7vw, 1.625rem)`, 1.35): frase do topo, aberturas de seção, títulos dos marcos (600) e contatos do rodapé (600).
- **Body** (400, `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)`, 1.55): texto corrido, com 34–52ch de medida. Botões e rótulos de campo usam 600.
- **Small** (600, 0.875rem, 1.55): menu (com 0.01em), dicas, rótulos dos fatos, legenda do vídeo e textos legais. Notas em 400.

### Named Rules

**A Regra dos Cinco Tamanhos.** Texto de leitura usa só os cinco tamanhos acima, todos em rem, para crescer com o zoom e com a escala de fonte do site (até 150%).

**A Regra do Monumento.** Letra comprimida que preenche uma medida é calculada pela própria medida: o slogan (79% da largura útil), o nome no rodapé (`100cqw / 4.65`, de margem a margem), a palavra "Serviços" (`27.8cqw` da coluna do carrinho) e os links do menu do celular (`clamp(3rem, 2rem + 6vw, 4.5rem)`). Todos podem quebrar (`overflow-wrap: anywhere`) se o texto crescer, em vez de serem cortados.

**A Regra do Slogan.** "Carros são nossa paixão. Competir é a obsessão." aparece sempre completo, nas duas frases, no h1 do topo.

## Layout

Grade de 12 colunas com espaço de `min(1.5rem, 2vw)` entre colunas, largura útil máxima de 96rem e margens laterais iguais (1.25rem no celular, 2rem a partir de 48rem). As seções se separam por 7.5rem (celular) ou 10rem de espaço e por troca de piso (grafite → epóxi → grafite → vermelho), nunca por linhas.

Cada seção tem composição própria:

- **Topo:** vídeo em tela cheia com as duas frases do slogan em cantos opostos e nada entre elas. Com movimento liberado, a seção tem duas telas de altura e o palco fica preso (sticky) durante a primeira: as frases saem, o vídeo fica sozinho e depois sobe. Se o slogan não couber na altura da tela (fonte muito ampliada), o topo não fica preso e cresce além da tela em vez de cortar.
- **Trajetória:** a abertura (foto quadrada que se dissolve em direção ao texto) fica numa faixa de grafite profundo de ponta a ponta, por cima do começo da pista. Abaixo, o piso com a pista em S no centro, saindo de baixo da faixa, e os marcos alternando de lado; abaixo de 64rem, a pista corre pela esquerda.
- **Oficina:** foto larga de 8 colunas com a nota em painel de luz no canto, e a coluna lateral com o bloco vermelho e os fatos.
- **Serviços:** coluna central estreita (42rem) com o título de ponta a ponta e as gavetas.
- **Contato:** o cupom da ordem de serviço em 10 colunas, com picote a 42%.
- **Rodapé:** o campo vermelho com o nome de margem a margem.

Pontos de quebra: 40rem (a legenda do vídeo sai), 48rem (margens, cupom em pé, Trajetória em uma coluna) e 64rem (menu vira "Menu", a pista vai para a esquerda, Oficina e rodapé empilham).

Grades de uma coluna declaram `minmax(0, 1fr)`, para que nenhum conteúdo largo (um select, uma palavra longa) empurre a coluna para fora da tela. Distâncias até a pista ficam em px, como a própria pista: com a fonte ampliada, o texto ganha largura em vez de ser empurrado.

## Elevation & Depth

Plano, com camadas tonais. A profundidade vem dos degraus do grafite e da sobreposição real: a pista da Trajetória passa por baixo da abertura e da seção seguinte, e o topo cobre o que vem depois. Superfícies de interface não têm sombra em repouso.

### Shadow Vocabulary

- **Flutuação** (`box-shadow: 0 12px 28px oklch(0 0 0 / 45%)`): só o botão do WhatsApp, que de fato flutua sobre o conteúdo.
- **Contato do carro** (`filter: drop-shadow(0 6px 5px oklch(0 0 0 / 55%))`): o 350Z sobre o piso.
- **Scrim do vídeo** (gradiente vertical de preto 78% → 30% → 20% → 85%): escurece só as bordas do vídeo, onde ficam as frases do slogan, e garante pelo menos 3:1 para o texto grande em qualquer quadro (medido em 19 quadros: pior caso 5,55:1).

### Named Rules

**A Regra do Piso.** Profundidade é tom e sobreposição, não sombra. A sombra só existe onde algo realmente flutua ou toca o chão.

## Shapes

Cantos retos (0px) em toda a interface: botões, campos, fotos, gavetas, cupom, painéis, header e menu. As únicas curvas pertencem ao assunto: o traçado em S da pista e o "8" do rodapé, os cones vistos de cima (círculos concêntricos), as nuvens de fumaça (`999px`), os entalhes e a fileira de furos do picote do cupom, e o puxador de alumínio das gavetas (0.15rem). Ícones em traço de 2px.

Bordas de 2px transparentes nos controles: invisíveis no tema normal, viram contorno no modo de alto contraste do Windows (forced colors).

## Components

### Buttons

Retângulos de laca, firmes e diretos.

- **Shape:** cantos retos (0px), borda transparente de 2px.
- **Primary:** vermelho laqueado com texto `on-accent` em 600, altura mínima de 3.25rem, 0 1.5rem de padding e uma seta que avança 0.25rem sob o ponteiro. Encolhe para 0.97 ao pressionar. Mesmo rótulo em toda a página: "Agendar avaliação".
- **Hover / Focus:** fundo `accent-strong` (180ms); foco com o anel amarelo de 3px afastado 3px.
- **Small:** 2.75rem de altura e texto small, no header.
- **Quiet:** bancada com texto `ink`, hover em `raised-strong`.
- **Icon button:** quadrado de 2.75rem em grafite translúcido (72%), para pausar o vídeo e a animação do rodapé.
- **Text link:** sublinhado de 0.08em afastado 0.24em, a 45% da cor, que ganha força no hover e no foco (sempre cheio no alto contraste).

### Painel de luz

O texto em `on-light` sobre um painel em `ink`, como uma placa iluminada: a nota sobre a foto da Oficina, a célula "Ver os marcos" (hover em `muted`) e os atalhos de acesso. Cantos retos, 1.25rem de padding.

### Inputs / Fields

- **Style:** grafite sobre a bancada da ordem de serviço, borda transparente de 2px, cantos retos, altura mínima de 3.25rem, 0.75rem 1rem de padding. Rótulo visível em 600 acima; dica em small `muted`, ligada ao campo.
- **Focus:** o anel amarelo de 3px.
- **Error:** borda `danger`, ícone de alerta e texto `danger` em 600; nunca só a cor.

### Navigation

- **Header:** fixo, 4.5rem, transparente sobre o vídeo; ganha grafite sólido depois de 24px de rolagem. Recolhe ao descer (passado 60% da tela) e volta ao subir ou ao receber foco. Nunca cobre o elemento em foco.
- **Links:** small 600; sob o ponteiro, o texto rola para cima e é trocado por uma cópia (420ms, ease-expo). A ação principal é o botão small.
- **Celular (abaixo de 64rem):** links e ação vão para "Menu", um diálogo de tela cheia em grafite. Os links aparecem em Archivo comprimido 800 e entram em sequência. Esc fecha e o foco fica preso no diálogo.

### A pista do box (componente assinatura)

O traçado em S é calculado a partir dos marcos, com um ápice por marco alternando de lado. É desenhado em três camadas, como uma pista de verdade: bordas brancas (`paint` a 70%, 3px de cada lado), o asfalto preto (`asphalt`) e uma faixa central tracejada bem sutil (`paint` a 30%, 3px). A pista tem 152px de largura no desktop e 64px abaixo de 64rem, cerca de três vezes a largura do carro.

- **Borracha:** duas faixas em `rubber` são reveladas até o carro.
- **Cones:** um por marco, na borda voltada para o conteúdo. Ficam apagados (0.45) e acendem (1.0, com um anel que pulsa uma vez) quando o carro passa.
- **Carro:** o 350Z (48px; 32px no celular) tem o ângulo de drift calculado pela curvatura e solta fumaça só enquanto a página rola.
- **Anos:** os dígitos giram como um contador mecânico (1100ms, 70ms por coluna); leitores de tela recebem o ano inteiro.

### O carrinho de ferramentas

Gavetas vermelhas de 4rem, com 6px entre elas e um puxador de alumínio no alto que sobe 0.1rem sob o ponteiro. Cada gaveta abre no lugar (altura automática, 450ms) e mostra o interior em bancada: descrição, o que costuma incluir (marcadores quadrados em vermelho) e o pedido de orçamento. Segue o padrão accordion do WAI-ARIA.

### A ordem de serviço

Um cupom na bancada com picote a 42%: dois entalhes de 1.75rem nas bordas e uma fileira de furos pontilhados de 5px. Abaixo de 48rem o cupom fica em pé e o picote vira horizontal. O formulário monta a mensagem e abre o WhatsApp.

### O oito no campo vermelho

Uma lemniscata (640×300, raios de 270×112) com dois cones brancos de faixa grafite. O carro (5.4% da largura) roda em loop contínuo a 240 unidades/s, e as marcas de borracha se acumulam até 0.55 de opacidade. Pausa por botão, para quando sai da tela e não anda no movimento reduzido.

### Movimento

- **Entradas:** blocos sobem 24px e aparecem (900ms, ease-expo, 80ms por item); títulos sobem de dentro de uma máscara (1s); fotos abrem como persiana (1100ms, ease-in-out).
- **Topo preso:** durante uma tela de rolagem, as frases saem pelas laterais (até ±115%, acelerando e inclinando até 10°), o scrim do vídeo cai de 1 para 0.3 e o vídeo se assenta (1.08 → 1); no último terço só o vídeo aparece.
- **Rolagem:** o nome do rodapé cresce de 0.94 a 1.
- **Movimento reduzido:** com `data-motion="reduce"` ou `prefers-reduced-motion`, transformações viram troca instantânea, o topo não fica preso, o vídeo não toca sozinho, a fumaça some e o carro do rodapé fica parado.

## Do's and Don'ts

### Do:

- **Do** manter o slogan "Carros são nossa paixão. Competir é a obsessão." completo no h1 do topo, nas duas frases.
- **Do** usar só os tokens de cor; o alto contraste troca os tokens, não os componentes.
- **Do** manter texto em 4,5:1 ou mais e controles e foco em 3:1 ou mais, inclusive sobre o vídeo (o scrim existe para isso).
- **Do** usar fotos e quadros reais do vídeo da equipe sempre que existirem.
- **Do** dar pausa a todo movimento contínuo e pará-lo por completo no modo de movimento reduzido.
- **Do** dimensionar texto em rem e deixar monumentos quebrarem em vez de cortar.

### Don't:

- **Don't** voltar ao fundo claro ou branco (rejeitado pelo cliente) nem usar preto puro fora do alto contraste.
- **Don't** usar o vermelho como cor de texto sobre o grafite.
- **Don't** separar, encurtar ou reescrever o slogan, nem levar metade dele para o texto de apoio.
- **Don't** usar cards idênticos com ícone, rótulos pequenos acima de títulos ou seções numeradas.
- **Don't** usar linhas finas de separação, contornos de 1px, brilho ou neon, nem sombras em superfícies de interface; gradiente só no scrim do vídeo e no fade da foto da Trajetória.
- **Don't** indicar estado só por cor: erro tem ícone e texto, gaveta aberta tem o ícone girado e `aria-expanded`.
- **Don't** inventar títulos, depoimentos, números ou patrocinadores.
