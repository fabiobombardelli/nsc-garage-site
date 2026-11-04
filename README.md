# NSC Garage — Site institucional

Landing page da NSC Garage, oficina premium de manutenção e preparação de carros de
competição e drift.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4 · fonte Hanken Grotesk (servida pelo
próprio site)

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

`npm run build` gera um site 100% estático na pasta `dist/`, com caminhos relativos. Pode ser
publicado em qualquer hospedagem (Vercel, Netlify, Cloudflare Pages, Hostinger, cPanel…), na
raiz do domínio ou numa subpasta.

## A página, de cima para baixo

1. **Topo** — o vídeo da equipe aparece por uma janela no papel e abre até a tela cheia ao
   rolar.
2. **Trajetória** — "Andamos de [vídeo] desde 2015": o 350Z #69 percorre a pista conforme a
   página rola, deixa marcas de pneu e acende o clipping point de cada marco.
3. **Oficina** — quem é a NSC, com os fatos (fundador, títulos, pioneirismo).
4. **Serviços** — tabela de serviços; cada "Orçar" abre o WhatsApp com a mensagem pronta.
5. **Contato** — a ficha de inscrição (cupom) que monta a mensagem e abre o WhatsApp.
6. **Rodapé** — campo vermelho com o número do WhatsApp; o carro dá três zerinhos.

## Estrutura

```
public/media/                   vídeos (topo e loop do título) e poster
src/
  App.tsx                       ordem das seções
  content/                      TEXTOS E DADOS (edite aqui)
    site.ts                     nome, ação principal, menu e dados de contato
    milestones.ts               marcos da Trajetória
    services.ts                 serviços
  components/
    layout/                     Header e Footer
    sections/                   Hero, Timeline, About, Services, Contact
    timeline/                   pista, carro, marco e ano com contador
    footer/DonutCar.tsx         o zerinho do rodapé
    contact/ContactForm.tsx     formulário que envia pelo WhatsApp
    ui/                         Logo, botão flutuante e vídeo dentro do título
  hooks/
    useDriftCar.ts              monta a pista e move o carro com a rolagem
    useHeroWindow.ts            abre a janela do vídeo do topo
    useReveal.ts                dispara as entradas ao rolar
    useInView.ts                visibilidade de um elemento
  lib/
    track.ts                    traçado da pista e cálculo do drift
    whatsapp.ts                 links do WhatsApp
    assets.ts                   caminhos dos vídeos
  assets/
    brand/logo.webp             logo
    images/                     carro visto de cima, fotos ilustrativas
    images/footage/             quadros reais do vídeo da equipe
  styles/
    theme.css                   cores, tipografia e tokens
    controls.css                botões e links
    motion.css                  entradas ao rolar
    sections/                   um arquivo por seção
DESIGN.md                       sistema visual documentado
PRODUCT.md                      fatos do negócio que o design respeita
```

## Edições comuns

- **WhatsApp, Instagram, endereço e horário:** objeto `contact` em `src/content/site.ts`. O
  número é usado no formulário, nos botões "Orçar", no botão flutuante e no rodapé.
- **Marcos da Trajetória:** `src/content/milestones.ts`. Adicione, remova ou reordene; a pista
  ganha uma curva por marco automaticamente.
- **Serviços:** `src/content/services.ts`. O formulário lista os mesmos serviços.
- **Cores e tipografia:** `src/styles/theme.css` (o vermelho da marca é `--color-accent`). Antes
  de mudar, leia `DESIGN.md`.
- **Textos de cada seção:** no componente correspondente em `src/components/sections/`.

## Mídias

| Arquivo                                | Uso                                                               |
| -------------------------------------- | ----------------------------------------------------------------- |
| `src/assets/brand/logo.webp`           | Logo (fundo transparente)                                         |
| `src/assets/images/drift-car-top.webp` | Carro visto de cima: dianteira **para baixo**, fundo transparente |
| `src/assets/images/footage/*.webp`     | Quadros do vídeo da equipe usados como fotos                      |
| `src/assets/images/*-drift.jpg`        | Fotos ilustrativas de box e peças — **trocar pelas reais**        |
| `public/media/hero-drift(-mobile).*`   | Vídeo do topo (1080p no computador, 720p no celular)              |
| `public/media/slide-loop.*`            | Trecho de 2 s do carro de lado, dentro do título da Trajetória    |

Para trocar o vídeo do topo, gere as versões a partir do original com [ffmpeg](https://ffmpeg.org):

```bash
ffmpeg -i original.mp4 -an -vf scale=1920:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 public/media/hero-drift.webm
ffmpeg -i original.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero-drift.mp4
ffmpeg -i original.mp4 -an -vf scale=-2:720 -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 public/media/hero-drift-mobile.webm
ffmpeg -i original.mp4 -an -vf scale=-2:720 -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero-drift-mobile.mp4
ffmpeg -ss 1 -i original.mp4 -frames:v 1 -vf scale=1920:-2 public/media/hero-poster.webp
```

## Antes de publicar

- [ ] Trocar os dados de exemplo em `src/content/site.ts` (WhatsApp, endereço, horário).
- [ ] Confirmar os marcos da Trajetória (textos e anos são provisórios).
- [ ] Trocar as fotos ilustrativas de box e peças pelas reais.
