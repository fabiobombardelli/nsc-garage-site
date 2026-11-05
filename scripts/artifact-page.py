"""Gera dist/nsc-garage.html para a prévia (Artifact) a partir do build.

A prévia bloqueia arquivos de fonte publicados junto da página; a fonte
Archivo (subconjunto latino, que cobre o português) vai embutida como
data URI e assume a variável --font-sans.
"""
import base64, glob, re, sys
dist = sys.argv[1]
index = open(f'{dist}/index.html', encoding='utf-8').read()
css = re.search(r'href="\./(assets/index-[^"]+\.css)"', index).group(1)
js = re.search(r'src="\./(assets/index-[^"]+\.js)"', index).group(1)
font = glob.glob(f'{dist}/assets/archivo-latin-wdth-normal-*.woff2')[0]
data = base64.b64encode(open(font, 'rb').read()).decode()
page = f'''<title>NSC Garage</title>
<meta name="theme-color" content="#151719" />
<link rel="stylesheet" crossorigin href="./{css}" />
<style>
  /* O site é escuro por escolha ("o box à noite"): fundo grafite antes do CSS do app carregar. */
  :root {{
    color-scheme: dark;
    background: #151719;
    --font-sans: "Archivo NSC", "Archivo Variable", "Archivo", ui-sans-serif, system-ui, sans-serif;
  }}
  body {{
    background: #151719;
    color: #f2f4f5;
  }}
  @font-face {{
    font-family: "Archivo NSC";
    font-style: normal;
    font-weight: 100 900;
    font-stretch: 62% 125%;
    font-display: block;
    src: url(data:font/woff2;base64,{data}) format("woff2");
  }}
</style>
<script type="module" crossorigin src="./{js}"></script>
<div id="root"></div>
'''
open(f'{dist}/nsc-garage.html', 'w', encoding='utf-8').write(page)
print(css, js, len(page) // 1024, 'KB')
