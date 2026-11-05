# NSC Garage: notas para o Claude

Site institucional e sistema de agendamento da NSC Garage, oficina premium que também prepara carros
de drift e competição. Trabalho de extensão das disciplinas de Acessibilidade e Engenharia de
Software (Fatec Rubens Lara); o README é o documento da apresentação.
Converse com o usuário em português e use a skill `caveman` nas respostas do chat (o usuário quer
economizar tokens). Código, commits e docs ficam em texto normal.

## Economia de tokens

- Leia só o trecho necessário: `Grep` ou `Read` com offset/limit. O mapa abaixo evita explorar.
- Capturas de tela só quando a mudança for visual, recortadas na área e com `deviceScaleFactor: 1`.
- Ajuste pequeno: verificação rápida. Testes completos, vídeo e zip só se o usuário pedir ou antes
  de entregar ao cliente.

## Comandos

- Rápida (sempre): `npx prettier --write . && npx tsc --noEmit && npx eslint . && npm test && npm run build`
- Completa: sirva o build (`npx vite preview --port 4173 --strictPort` em segundo plano) e rode
  `axe.cjs`, `telas.cjs` (axe nas telas internas), `keyboard.cjs`, `agendamento.cjs` (fluxo só com
  teclado) e `layout.cjs` (5 telas), todos em `scripts/qa/` (o axe pede
  `npm i --no-save axe-core --legacy-peer-deps` uma vez). Resultado esperado: 0 violações, 0 cortes,
  0 focos cobertos, todos os ✓.
- `npm install` com pacote novo: use `--legacy-peer-deps` (bug do npm com os peers opcionais do
  Vitest 5); `npm ci` funciona normal.
- Skills de design (pasta ignorada pelo git; reinstalar de github.com/pbakaus/impeccable e
  github.com/Leonxlnx/taste-skill se faltar): `node .claude/skills/taste-skill/scripts/lint.mjs src`
  e `sh .claude/skills/impeccable/scripts/impeccable detect --json src index.html`. O
  `inspect.mjs` do taste precisa de `CHROME_PATH` apontando para um wrapper do Chromium com
  `--no-sandbox`.
- Achados já defendidos (não "corrigir"): taste `headline-lines` a 390px (slogan em 4 linhas no
  celular, pedido do cliente), `font-not-dealt` (Archivo escolhida), `pinned-over-picture` (topo
  preso, pedido do cliente) e os avisos de `padStart` (datas e hash); impeccable
  `design-system-font-size` (links do menu do celular) e `design-system-radius` (puxador das gavetas).

## Mapa

- `src/content/`: textos e dados (`site.ts` com nome, slogan, contatos e menu; `milestones.ts` com
  15 marcos, id único, data, foto com crédito ou `null`; `services.ts`).
- `src/components/sections/`: Hero (vídeo preso com saída das frases; `useFitsViewport`), Timeline
  (faixa escura + pista), About, Services (accordion), Contact.
- `src/components/timeline/`: FloorLane (SVG da pista, cones, barreiras de pneus), DriftCar,
  Milestone, RollingYear. `src/hooks/useDriftCar.ts` monta o traçado a partir dos marcos e lê as
  variáveis `--track-*`, `--cone-gap` e `--barrier-gap` de `.timeline-stage` (em px).
- `src/components/footer/FigureEight.tsx`: carro fazendo oitos em loop. `ui/Reveal.tsx`: entradas
  (a `MaskedLine` observa a máscara, não o texto escondido).
- `src/lib/accessibility.ts`: preferências (`data-motion`, `data-contrast`, `--font-scale`), evento
  de mudança; painel visível em `components/a11y/AccessibilityPanel.tsx`.
- `src/app/`: rotas por hash (`#/agendar`, `#/meus-agendamentos`, `#/painel`, `#/acessibilidade`,
  `#/privacidade`), foco e título a cada troca (`useRouteFocus`). Links para seções da inicial usam
  `sectionHref`.
- `src/pages/`: uma página por tela. `src/features/scheduling/`: domínio puro + testes (`domain/`),
  contrato `SchedulingService` (`services/contract.ts`) com duas versões: demonstração
  (`services/schedulingService.ts` + repositório em `data/`) e online (`data/supabase/`, carregada
  sob demanda). `index.ts` escolhe pelo build (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`;
  modelo em `.env.example`). Telas em `components/booking|customer|admin`. Regras da agenda em
  `src/content/scheduling.ts`.
- `supabase/`: migração SQL (tabelas, RLS sem permissões, funções `security definer` que repetem as
  regras, índice único por horário) e testes no PGlite (`agenda.test.ts` no SQL, `servico.test.ts`
  com a versão online). Regra nova = domínio + migração nova + teste dos dois lados.
- `PUBLICAR.md`: Supabase, login da equipe (`oficina_admins`), hospedagem e domínio.
  `public/_headers`: cabeçalhos de segurança da hospedagem.
- `src/components/car/`: DriftCar, PitLane (progresso), DonutFinish (comprovante), ParkedCar.
  `components/forms/Field.tsx`: campo acessível. `components/ui/InlineConfirm.tsx`: confirmação.
- `docs/rastreabilidade.md`: RF/RN/RNF → UC → código → teste. Atualize ao mudar um requisito.
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
  cobre, erros com texto e ícone, controles com borda `--color-edge`, foco no título a cada tela e
  etapa, confirmação no lugar (sem modal). As 11 regras estão no topo de `ACESSIBILIDADE.md`.
- Animação de carro que é cena (oito do rodapé, zerinho do comprovante) roda em loop contínuo, com
  pausa, parada fora da tela e versão parada no movimento reduzido (pedido do cliente). Carro que
  mostra estado (pistas) só anda quando o estado muda.
- Regras de negócio só em `features/scheduling/domain/` (nunca em componente), cada uma com teste
  que cita o TC (e repetidas nas funções SQL, para o modo online). Painel: e-mail e senha do
  Supabase online; senha `oficina2026` só na demonstração.
- Integrantes do grupo: o README tem espaço reservado; não invente nomes.
- Nunca invente títulos, números, depoimentos ou patrocinadores. Fatos da NSC só de
  `docs/historia-nsc.md` (base de conhecimento com fontes e confiança; usar só os confirmados). Os
  marcos vêm da seção 11 do documento da equipe. São provisórios: WhatsApp e horário (`site.ts`),
  itens dos serviços, a foto do box e as fotos da Trajetória (de terceiros, com crédito; o usuário
  vai mandar versões tratadas para trocar uma a uma em `src/assets/images/history/`).

## Publicação

No ar desde 5/11/2026 em **https://nsc.vox.dev.br** (passos 1 a 5 do `PUBLICAR.md` feitos e
conferidos no domínio: agendar, painel, confirmar, concluir, WhatsApp, consultar, cancelar, avaliar,
painel de acessibilidade; agendamentos de teste apagados).

- Supabase: organização "NSC Garage" (Free), projeto `nsc-garage`, ref `qbbrwgkjyldzgykytijl`,
  região São Paulo (`sa-east-1`). Migração `20261105000000_agenda.sql` aplicada, cadastro aberto
  desligado, Site URL `https://nsc.vox.dev.br`. Login da oficina (`oficina_admins`):
  `fabiobombardellijr@gmail.com`. O site usa a chave publishable (`sb_publishable_…`).
- Cloudflare Pages: projeto `nsc-garage` (`nsc-garage.pages.dev`), ligado ao GitHub (app da
  Cloudflare autorizado só neste repositório), build `npm run build` → `dist`. `VITE_SUPABASE_URL` e
  `VITE_SUPABASE_ANON_KEY` só em Production; Preview roda em modo demonstração.
- DNS: o `vox.dev.br` usa os servidores DNS da Cloudflare (mesma conta), não os do Registro.br. O
  registro `nsc` é um CNAME → `nsc-garage.pages.dev` criado pelo Pages nessa zona (substituiu um
  `A nsc → 185.158.133.1` antigo, com aval do usuário). Não mexa nos outros registros.
- WhatsApp de testes: `5513981197295` (trocar pelo da oficina em `site.ts`).
- Node local: 22 em `~/.local/node` (no PATH do usuário); o Windows não tem `winget`.

- O usuário digita as próprias senhas e e-mails de login; você navega, preenche o resto e confere.
- A chave `service_role`/`secret` nunca vai para o site, para o `.env` nem para o chat. O `.env`
  leva só a URL e a chave anon/publishable.
- Conta da oficina no painel: o usuário cria em Authentication → Users; você roda o `insert` em
  `oficina_admins` com o e-mail que ele disser.
- Agendamentos de teste: use um telefone fictício e apague no SQL Editor depois
  (`delete from public.agendamentos where cliente_telefone = '…';`).

## Prévia e git

- Prévia privada: https://claude.ai/artifact/QqUqWcAq4dmLca1rbQRTda. Para atualizar: `npm run build`,
  `python3 scripts/artifact-page.py dist` e publicar `dist/nsc-garage.html` com `root: dist`,
  passando em `files` os assets de hash novo e `null` nos antigos (liste com `scope: "files"`). A
  prévia bloqueia arquivos de fonte e parâmetros de URL: o script embute a Archivo na página.
- GitHub: `fabiobombardelli/nsc-garage-site` (privado). A `main` é o que está no ar: o Cloudflare
  Pages publica a cada push, e o fluxo `Verificação` (`.github/workflows/ci.yml`) roda a verificação
  rápida. Mudança grande: branch + pull request (a prévia da branch roda em modo demonstração).
  Commits em português, autor "NSC Garage".
- Próximas fases: notificação automática, anti-robô no
  agendamento, testes manuais com leitores de tela, medir desempenho (RNF-03).
