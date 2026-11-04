# NSC Garage: site institucional

Site da NSC Garage, oficina premium de manutenção e preparação de carros de drift e competição.

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Motion (animações) e a fonte Archivo,
servida pelo próprio site.

## Rodando localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev        # servidor de desenvolvimento em http://localhost:5173
```

| Comando           | O que faz                                        |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Ambiente de desenvolvimento com recarga ao vivo  |
| `npm run build`   | Verifica os tipos e gera o site final em `dist/` |
| `npm run preview` | Serve a versão de `dist/` para conferência       |
| `npm run lint`    | Procura problemas no código                      |
| `npm run format`  | Formata todos os arquivos com Prettier           |

## Publicação

`npm run build` gera um site 100% estático na pasta `dist/`, com caminhos relativos. Ele pode ser
publicado em qualquer hospedagem (Vercel, Netlify, Cloudflare Pages, Hostinger, cPanel…), na raiz do
domínio ou numa subpasta.

## A página, de cima para baixo

O conceito visual é **"o box à noite"**: a oficina depois do expediente, com piso de epóxi grafite,
luz branca de LED e o vermelho do carrinho de ferramentas. Os detalhes estão em `DESIGN.md`.

1. **Topo:** o vídeo da equipe em tela cheia com o slogan completo, "Carros são nossa paixão.
   Competir é a obsessão.", uma frase em cada canto. Ao rolar, o vídeo fica preso enquanto as duas
   frases saem pelas laterais, e só então a página segue.
2. **Trajetória:** a foto do 350Z se dissolve em direção ao texto. Abaixo, o carro desce o piso do
   box por uma pista de asfalto preto conforme a página rola, deixa marcas de pneu e acende o cone
   de cada marco.
3. **Oficina:** quem é a NSC: foto do box, o bloco "Pioneiros do drift no Brasil" e os fatos.
4. **Serviços:** o carrinho de ferramentas. Cada gaveta abre no lugar com o que o serviço inclui e o
   pedido de orçamento pelo WhatsApp.
5. **Contato:** a ordem de serviço. O formulário monta a mensagem e abre o WhatsApp.
6. **Rodapé:** o campo vermelho com o nome de ponta a ponta, os contatos e o carro fazendo oitos sem
   parar.

## Estrutura

```
public/media/                   vídeo do topo (computador e celular) e poster
src/
  App.tsx                       ordem das seções
  main.tsx                      ponto de entrada (fonte, acessibilidade)
  content/                      TEXTOS E DADOS (edite aqui)
    site.ts                     nome, slogan, ação principal, menu e contatos
    milestones.ts               marcos da Trajetória
    services.ts                 serviços (gavetas e formulário)
  components/
    a11y/AccessShortcuts.tsx    atalhos de acesso (Alt + 1 a 4)
    layout/                     Header, MobileMenu e Footer
    sections/                   Hero, Timeline, About, Services, Contact
    timeline/                   faixa do piso, carro, marco e ano com contador
    footer/FigureEight.tsx      o carro fazendo oitos no rodapé
    contact/WorkOrderForm.tsx   formulário que envia pelo WhatsApp
    ui/                         Logo, entradas animadas e botão do WhatsApp
  hooks/
    useDriftCar.ts              monta a faixa e move o carro com a rolagem
    useReducedMotion.ts         segue o modo de movimento reduzido
    useInView.ts                visibilidade de um elemento
  lib/
    accessibility.ts            preferências de acessibilidade
    track.ts                    traçado da faixa, do oito e cálculo do drift
    whatsapp.ts                 links do WhatsApp
    assets.ts                   caminhos do vídeo
  assets/
    brand/logo.webp             logo
    images/                     carro visto de cima e fotos ilustrativas
    images/footage/             quadros do vídeo da equipe
  styles/
    theme.css                   cores, tipografia, tokens e alto contraste
    accessibility.css           atalhos, forced colors e movimento reduzido
    controls.css                botões e links
    sections/                   um arquivo por seção
ACESSIBILIDADE.md               o que já atende ao WCAG e como testar
DESIGN.md                       sistema visual documentado
PRODUCT.md                      fatos do negócio que o design respeita
```

## Edições comuns

- **WhatsApp, Instagram, endereço e horário:** objeto `contact` em `src/content/site.ts`. O número
  é usado no formulário, nas gavetas, no botão flutuante e no rodapé.
- **Slogan:** `site.tagline` em `src/content/site.ts`. É parte da marca: aparece sempre completo,
  nas duas frases.
- **Marcos da Trajetória:** `src/content/milestones.ts`. Adicione, remova ou reordene; a faixa
  ganha uma curva e um cone por marco automaticamente.
- **Serviços:** `src/content/services.ts`. O formulário lista os mesmos serviços.
- **Cores e tipografia:** `src/styles/theme.css` (o vermelho da marca é `--color-accent`). Antes de
  mudar, leia `DESIGN.md`, e confira o contraste em `ACESSIBILIDADE.md`.
- **Textos de cada seção:** no componente correspondente em `src/components/sections/`.

## Acessibilidade

O site segue as preferências do sistema (movimento reduzido, contraste alto) e tem atalhos de
acesso no padrão eMAG. Para conferir cada modo, abra com `?movimento=reduzido`, `?contraste=alto`
ou `?fonte=150` na URL (e `?acessibilidade=padrao` para voltar). Tudo está em `ACESSIBILIDADE.md`.

## Mídias

| Arquivo                                | Origem e uso                                                                                                       |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `src/assets/brand/logo.webp`           | Logo enviado pelo cliente (fundo transparente)                                                                     |
| `src/assets/images/drift-car-top.webp` | 350Z visto de cima, enviado pelo cliente e clareado (curva gama 0,7): dianteira **para baixo**, fundo transparente |
| `src/assets/images/footage/*.webp`     | Quadros extraídos do vídeo da equipe (`hero.webm`, enviado pelo cliente)                                           |
| `src/assets/images/*-drift.jpg`        | Fotos ilustrativas de box e peças, vindas do projeto original: **trocar pelas reais**                              |
| `public/media/hero-drift(-mobile).*`   | Vídeo do topo, convertido do `hero.webm` (1080p no computador, 720p no celular)                                    |
| `public/media/hero-poster.webp`        | Quadro do vídeo exibido enquanto ele carrega                                                                       |

Para trocar o vídeo do topo, gere as versões a partir do original com [ffmpeg](https://ffmpeg.org):

```bash
ffmpeg -i original.mp4 -an -vf scale=1920:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 public/media/hero-drift.webm
ffmpeg -i original.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero-drift.mp4
ffmpeg -i original.mp4 -an -vf scale=-2:720 -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 public/media/hero-drift-mobile.webm
ffmpeg -i original.mp4 -an -vf scale=-2:720 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero-drift-mobile.mp4
ffmpeg -ss 1 -i original.mp4 -frames:v 1 -vf scale=1920:-2 public/media/hero-poster.webp
```

Para tirar um quadro do vídeo e usar como foto (troque `12` pelo segundo desejado):

```bash
ffmpeg -ss 12 -i original.mp4 -frames:v 1 -vf scale=1600:-2 -c:v libwebp -quality 80 src/assets/images/footage/novo-quadro.webp
```

## Antes de publicar

- [ ] Trocar os dados de exemplo em `src/content/site.ts` (WhatsApp, endereço, horário,
      Instagram).
- [ ] Confirmar os marcos da Trajetória (textos e anos são provisórios; "Na pista desde" usa o
      primeiro ano da lista).
- [ ] Confirmar o que cada serviço inclui em `src/content/services.ts` (itens de exemplo).
- [ ] Trocar as fotos ilustrativas de box e peças pelas reais.

## Próximas etapas

- **Acessibilidade:** quando chegar o documento WCAG de referência, seguir os próximos passos de
  `ACESSIBILIDADE.md` (painel de acessibilidade, testes com leitores de tela).
- **Sistema de chamados:** abertura e acompanhamento de serviços. O formulário da ordem de serviço
  (`WorkOrderForm.tsx`) é o ponto de partida, e o sistema deve seguir os tokens de `DESIGN.md` e os
  padrões de `ACESSIBILIDADE.md`.
