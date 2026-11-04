# NSC Garage — Site institucional

Landing page da NSC Garage, oficina premium de manutenção, preparação de carros
de competição e drift.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS 4

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

`npm run build` gera um site 100% estático na pasta `dist/`. Ela pode ser
publicada em qualquer hospedagem (Vercel, Netlify, Cloudflare Pages,
Hostinger, cPanel…): basta enviar o conteúdo da pasta ou apontar o serviço
para o comando `npm run build` com diretório de saída `dist`.

## Estrutura

```
public/
  favicon.png
  media/                        vídeo do topo e seu poster (ver "Mídias")
src/
  App.tsx                       monta a página na ordem das seções
  content/
    site.ts                     nome, slogan e links do menu
    milestones.ts               marcos da linha do tempo
  components/
    layout/                     Header e Footer
    sections/                   Hero, Timeline e Workshop
    timeline/                   pista, carro animado e card de marco
    ui/Logo.tsx
  hooks/useDriftCar.ts          movimenta o carro conforme a rolagem
  lib/
    track.ts                    traçado da pista e cálculo do drift
    assets.ts                   caminhos do vídeo do topo
  assets/
    brand/                      logo da marca
    images/                     fotos e imagem do carro
  styles/
    global.css                  entrada dos estilos
    theme.css                   cores, fontes e tokens
    components/                 estilos de cada seção
```

## Edições comuns

- **Textos do menu, nome e slogan:** `src/content/site.ts`
- **Marcos da trajetória:** `src/content/milestones.ts` — adicione, remova ou
  reordene itens; a pista e o carro se ajustam sozinhos.
- **Cores e fontes:** `src/styles/theme.css` (o vermelho da marca é
  `--color-primary`).
- **Textos de cada seção:** no componente correspondente em
  `src/components/sections/`.

## Mídias

| Arquivo                                | Uso                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/assets/brand/logo.webp`           | Logo do header e do footer (fundo transparente)                                             |
| `src/assets/images/drift-car-top.webp` | Carro da linha do tempo, visto de cima, com a dianteira **para baixo** e fundo transparente |
| `public/media/hero-drift.webm`         | Vídeo do topo (1080p, sem áudio)                                                            |
| `public/media/hero-drift.mp4`          | Mesmo vídeo em MP4, para navegadores sem suporte a WebM                                     |
| `public/media/hero-poster.webp`        | Quadro exibido enquanto o vídeo carrega                                                     |

Para trocar o vídeo, gere as duas versões a partir do original com
[ffmpeg](https://ffmpeg.org):

```bash
ffmpeg -i original.mp4 -an -vf scale=1920:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 public/media/hero-drift.webm
ffmpeg -i original.mp4 -an -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart public/media/hero-drift.mp4
ffmpeg -ss 1 -i original.mp4 -frames:v 1 -vf scale=1920:-2 public/media/hero-poster.webp
```
