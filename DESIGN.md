---
name: NSC Garage
description: A ficha de julgamento de uma bateria de drift, em papel, tinta carbono e o vermelho da marca.
colors:
  paper: "oklch(0.952 0.004 240)"
  surface: "oklch(0.912 0.005 240)"
  ink: "oklch(0.19 0.006 250)"
  muted: "oklch(0.43 0.008 250)"
  accent: "oklch(0.55 0.215 28)"
  accent-strong: "oklch(0.49 0.2 28)"
  asphalt: "oklch(0.28 0.006 250)"
  asphalt-raised: "oklch(0.34 0.006 250)"
  rubber: "oklch(0.12 0.004 250)"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 0.4rem + 10.2vw, 9.5rem)"
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: "-0.05em"
  head:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.2rem + 4.2vw, 4.25rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  lead:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 1.15rem + 0.9vw, 1.875rem)"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.005em"
  small:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  none: "0px"
spacing:
  page-margin-phone: "20px"
  page-margin: "32px"
  grid-gap: "24px"
  section-gap-phone: "120px"
  section-gap: "160px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
  button-small:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "40px"
  field-on-ink:
    backgroundColor: "{colors.asphalt-raised}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    height: "52px"
  header-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    height: "68px"
---

# Design System: NSC Garage

## Overview

O site é a ficha oficial de uma bateria de drift: o papel em que o esporte é julgado, um esporte que a NSC ajudou a estruturar no Brasil. Papel frio e claro como fundo, tinta carbono para todo o texto e o vermelho da marca usado como a caneta do juiz: só na ação principal, nos clipping points e no campo do rodapé.

O movimento é o assunto. O 350Z #69 percorre a pista da Trajetória conforme a página rola, deixando borracha no asfalto e acendendo cada clipping point por onde passa; no rodapé ele dá três zerinhos. Tudo o mais é contido para que esses momentos apareçam.

Recusas: a página preta com caixa-alta condensada e neon vermelho, cards idênticos com ícone, hero centralizado, rótulos pequenos acima de títulos.

## Colors

### Primary

**Vermelho da marca** (`accent`) é a única cor saturada. Aparece em três lugares e só neles: botões de ação, clipping points acesos e o campo inteiro do rodapé. `accent-strong` é o mesmo vermelho sob o ponteiro.

### Neutral

**Papel** (`paper`) cobre 70–90% da página e é frio, nunca creme. **Superfície** (`surface`) é um tom abaixo e separa seções (Oficina) sem linhas. **Tinta** (`ink`) é a cor de todo texto corrido; **tinta secundária** (`muted`) é só para notas e descrições curtas. **Asfalto** (`asphalt`) desenha a pista e é o fundo do cupom de inscrição; **asfalto elevado** (`asphalt-raised`) preenche os campos sobre ele. **Borracha** (`rubber`) é a cor das marcas de pneu.

### Named Rules

- **A caneta do juiz.** O vermelho marca o que importa agir ou notar; nunca decora.
- **Papel frio.** Nada de creme, marfim ou luz amarelada no fundo.

## Typography

Uma família, Hanken Grotesk, servida pelo próprio site (pesos 400 e 500), sempre em caixa normal.

### Hierarchy

- **display**: frases de pôster (título da Trajetória com o vídeo no lugar de "lado", o número do WhatsApp).
- **head**: títulos de seção e o título do topo; dois níveis no máximo por tela.
- **lead**: frases de afirmação (texto da Oficina, abertura da Trajetória, títulos dos marcos).
- **body**: texto corrido, sempre na tinta cheia.
- **small**: menu, notas, rótulos dos fatos.

### Named Rules

- **Cinco tamanhos.** Nenhum tamanho fora da escala acima.
- **Duas linhas.** Todo título cabe em duas linhas em qualquer largura.

## Layout

Grade de 12 colunas, margens laterais iguais (20 px no celular, 32 px do tablet em diante), largura útil máxima de 96 rem. Seções separadas por 120–160 px de espaço ou por uma mudança de fundo (papel → superfície → papel → vermelho), nunca por linhas. Cada seção tem composição própria: janela no topo, pista central com marcos alternados, texto com capitular fotográfica, tabela empurrada à direita com foto presa à esquerda, cupom, campo vermelho.

## Elevation & Depth

Plano. Nenhuma sombra em repouso. A única sombra é a do botão flutuante do WhatsApp, que de fato flutua sobre o conteúdo. Profundidade vem da sobreposição real: a pista passa por baixo do título e da seção seguinte.

## Shapes

Cantos retos em tudo (botões, fotos, campos, cupom). As únicas curvas são as do assunto: o traçado da pista, os cones dos clipping points, os entalhes do cupom e os círculos de borracha do zerinho.

## Components

### Buttons

Um formato só: retângulo vermelho, texto em papel, cantos retos, encolhe levemente ao pressionar. A ação principal tem o mesmo nome em toda a página ("Agendar avaliação").

### Inputs / Fields

Blocos preenchidos em asfalto elevado sobre o cupom escuro, sem borda, rótulos acessíveis ocultos e placeholders descritivos.

### Navigation

Barra de papel: logo, três links de texto e a ação principal. No celular, os links ficam atrás da palavra "Menu".

### Pista da Trajetória (componente assinatura)

Traçado calculado a partir das posições dos marcos (um ápice por marco, alternando de lado), asfalto de 100 px no desktop e 44 px no celular, faixa central tracejada em papel, duas faixas de borracha reveladas até o carro e um clipping point por marco que fica vermelho quando o carro passa.

## Do's and Don'ts

### Do:

- Usar fotos e quadros reais do vídeo da equipe sempre que existirem.
- Deixar o carro e a pista como o único momento barulhento da página.
- Manter todo conteúdo visível sem JavaScript e com "reduzir movimento".

### Don't:

- Não colocar rótulos pequenos acima de títulos nem numerar seções.
- Não usar gradientes, linhas finas de separação, caixas com contorno de 1 px ou sombras em repouso.
- Não inventar títulos, depoimentos, números ou patrocinadores.
