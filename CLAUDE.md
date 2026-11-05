# NSC Garage: notas para o Claude

Site institucional da NSC Garage, oficina premium que também prepara carros de drift e competição.
Converse com o usuário em português e use a skill `caveman` nas respostas do chat (o usuário quer
economizar tokens). Código, commits e docs ficam em texto normal.

## Economia de tokens

- Leia só o trecho necessário: `Grep` ou `Read` com offset/limit. O mapa abaixo evita explorar.
- Capturas de tela só quando a mudança for visual, recortadas na área e com `deviceScaleFactor: 1`.
- Ajuste pequeno: verificação rápida. Testes completos, vídeo e zip só se o usuário pedir ou antes
  de entregar ao cliente.

## Comandos

- Rápida (sempre): `npx prettier --write . && npx tsc --noEmit && npx eslint . && npm run build`
- Completa: sirva o build (`npx vite preview --port 4173 --strictPort` em segundo plano) e rode
  `node scripts/qa/axe.cjs`, `node scripts/qa/layout.cjs` e `node scripts/qa/keyboard.cjs`
  (o axe pede `npm i --no-save axe-core` uma vez). Resultado esperado: 0 violações, 0 cortes,
  0 focos cobertos, todos os ✓.
- Skills de design (pasta ignorada pelo git; reinstalar de github.com/pbakaus/impeccable e
  github.com/Leonxlnx/taste-skill se faltar): `node .claude/skills/taste-skill/scripts/lint.mjs src`
  e `sh .claude/skills/impeccable/scripts/impeccable detect --json src index.html`. O
  `inspect.mjs` do taste precisa de `CHROME_PATH` apontando para um wrapper do Chromium com
  `--no-sandbox`.
- Achados já defendidos (não "corrigir"): taste `headline-lines` a 390px (slogan em 4 linhas no
  celular, pedido do cliente), `font-not-dealt` (Archivo escolhida) e `pinned-over-picture` (topo
  preso, pedido do cliente); impeccable `design-system-font-size` (links do menu do celular) e
  `design-system-radius` (puxador das gavetas).

## Mapa

- `src/content/`: textos e dados (`site.ts` com nome, slogan, contatos e menu; `milestones.ts`;
  `services.ts`).
- `src/components/sections/`: Hero (vídeo preso com saída das frases; `useFitsViewport`), Timeline
  (faixa escura + pista), About, Services (accordion), Contact.
- `src/components/timeline/`: FloorLane (SVG da pista, cones, barreiras de pneus), DriftCar,
  Milestone, RollingYear. `src/hooks/useDriftCar.ts` monta o traçado a partir dos marcos e lê as
  variáveis `--track-*`, `--cone-gap` e `--barrier-gap` de `.timeline-stage` (em px).
- `src/components/footer/FigureEight.tsx`: carro fazendo oitos em loop. `ui/Reveal.tsx`: entradas
  (a `MaskedLine` observa a máscara, não o texto escondido).
- `src/lib/accessibility.ts`: preferências (`data-motion`, `data-contrast`, `--font-scale`).
- `src/styles/theme.css`: tokens `--color-*`, tamanhos, utilitários e tema de alto contraste.
  `sections/*.css`: um arquivo por seção.
- `DESIGN.md` + `.impeccable/design.json`: sistema visual. `PRODUCT.md`: fatos do negócio.
  `ACESSIBILIDADE.md`: WCAG. Atualize-os quando o visual ou a acessibilidade mudarem.

## Regras

- O slogan "Carros são nossa paixão. Competir é a obsessão." aparece sempre completo, nas duas
  frases, no h1 do topo (`site.tagline`). Nunca dividir, encurtar ou levar metade para outro texto.
- Mundo visual "o box à noite": grafite (o cliente rejeitou fundo claro), texto em luz de LED,
  vermelho só como superfície com texto claro por cima. Cantos retos. Só tokens de cor; o alto
  contraste troca os tokens, nunca os componentes.
- Meta WCAG 2.2 AA: texto em rem, pausa em todo movimento contínuo, nada se move com
  `data-motion="reduce"`, grades de uma coluna com `minmax(0, 1fr)`, foco visível que o header nunca
  cobre, erros com texto e ícone.
- Nunca invente títulos, números, depoimentos ou patrocinadores. São provisórios: contatos
  (`site.ts`), textos e anos dos marcos, itens dos serviços, fotos de box e peças.

## Prévia e git

- Prévia privada: https://claude.ai/artifact/QqUqWcAq4dmLca1rbQRTda. Para atualizar: `npm run build`,
  `python3 scripts/artifact-page.py dist` e publicar `dist/nsc-garage.html` com `root: dist`,
  passando em `files` os assets de hash novo e `null` nos antigos (liste com `scope: "files"`). A
  prévia bloqueia arquivos de fonte e parâmetros de URL: o script embute a Archivo na página.
- Git local na branch `main`, sem remoto. Commits em português, autor "NSC Garage".
- Próximas fases: implementação WCAG a partir do documento do cliente e um sistema de chamados
  (o formulário `WorkOrderForm.tsx` é o ponto de partida).
