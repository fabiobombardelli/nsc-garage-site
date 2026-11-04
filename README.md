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
  media/hero-drift.webm         vídeo de fundo do topo (ver "Mídias")
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
    assets.ts                   caminhos de logo e vídeo
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

| Arquivo                                | Uso                                                                                                             |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `src/assets/brand/logo.png`            | Logo no header e footer. Sem ele, o nome aparece em texto.                                                      |
| `public/media/hero-drift.webm`         | Vídeo do topo. Sem ele, aparece a foto `track-drift.jpg`.                                                       |
| `src/assets/images/drift-car-top.webp` | Carro visto de cima na linha do tempo. A dianteira deve apontar **para baixo** e o fundo deve ser transparente. |
