#!/usr/bin/env python3
"""Monta dist/ do quiz Família Restaurada.

Uso:
  python3 build.py
  python3 build.py --asset-base https://escoladeintercessao.com.br/wp-content/uploads/familia-restaurada/
"""
import argparse, json, pathlib, re
from PIL import Image

B = pathlib.Path(__file__).parent
DEFAULT_BASE = "https://escoladeintercessao.com.br/wp-content/uploads/familia-restaurada/"
MAX_BYTES = 200 * 1024

RASTER = [
    ("assets/capas/01-casamento-quadrada.jpg", "fr-capa-casamento.webp"),
    ("assets/capas/02-filhos-quadrada.jpg", "fr-capa-filhos.webp"),
    ("assets/capas/03-oracao-quadrada.jpg", "fr-capa-oracao.webp"),
    ("assets/capas/04-financeiro-quadrada.jpg", "fr-capa-financeiro.webp"),
    ("assets/ezenete-autora.png", "fr-ezenete-autora.webp"),
    ("assets/preview/06-situacao-01-p1.png", "fr-preview-casamento.webp"),
    ("assets/preview/01-capa.png", "fr-preview-01-capa.webp"),
    ("assets/preview/02-sobre-a-autora.png", "fr-preview-02-sobre-a-autora.webp"),
    ("assets/preview/03-sumario-1.png", "fr-preview-03-sumario-1.webp"),
    ("assets/preview/04-sumario-2.png", "fr-preview-04-sumario-2.webp"),
    ("assets/preview/05-teoria.png", "fr-preview-05-teoria.webp"),
    ("assets/preview/07-situacao-01-p2.png", "fr-preview-07-situacao-p2.webp"),
    ("assets/preview/08-situacao-01-p3.png", "fr-preview-08-situacao-p3.webp"),
]
SVGS = [
    ("casamento.svg", "fr-simbolo-casamento.svg"),
    ("filhos.svg", "fr-simbolo-filhos.svg"),
    ("constancia.svg", "fr-simbolo-oracao.svg"),
    ("financeiro.svg", "fr-simbolo-financeiro.svg"),
    ("crise.svg", "fr-simbolo-crise.svg"),
    ("dias30.svg", "fr-simbolo-dias30.svg"),
    ("versiculos.svg", "fr-simbolo-versiculos.svg"),
]
CENAS = ["C1","C2","C15","C7","C10","C14","F2","F7","F8","F20","O7","O2","O5","O12","O1","O15","$1","$16","$11"]
AREAS = ["C","F","O","$"]

def noblank(s):
    return "\n".join(line for line in s.splitlines() if line.strip()) + "\n"

def to_webp(src, dest):
    im = Image.open(src)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
    w, h = im.size
    cap = 1600
    if w > cap:
        im = im.resize((cap, max(1, int(h * cap / w))), Image.Resampling.LANCZOS)
    q = 82
    while True:
        im.save(dest, "WEBP", quality=q, method=6)
        if dest.stat().st_size <= MAX_BYTES or q <= 40:
            break
        q -= 8
    side = 0
    while dest.stat().st_size > MAX_BYTES and im.size[0] > 480 and side < 6:
        nw = int(im.size[0] * 0.8)
        nh = max(1, int(im.size[1] * 0.8))
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        im.save(dest, "WEBP", quality=60, method=6)
        side += 1
    if dest.stat().st_size > MAX_BYTES:
        raise SystemExit("asset acima de 200 KB: %s (%s bytes)" % (dest.name, dest.stat().st_size))

def manifest(written):
    lines = [
        "# Assets do quiz Família Restaurada",
        "",
        "Suba esta pasta na mídia do WordPress e rode o build com a URL pública da pasta:",
        "",
        "```",
        "python3 build.py --asset-base https://escoladeintercessao.com.br/wp-content/uploads/familia-restaurada/",
        "```",
        "",
        "O argumento preenche `CFG.assetBase`. Cada chave de `CFG.images` vira essa URL + o nome do arquivo. Base vazia (`python3 build.py --asset-base \"\"`) deixa as URLs vazias e o quiz não desenha imagem (sem ícone quebrado).",
        "",
        "Regra na tela: imagem da situação, senão a da área, senão nada. `loading=\"lazy\"` e caixa 4:3.",
        "",
        "## Já otimizados (neste pacote)",
        "",
    ]
    for name, nbytes in written:
        lines.append("- `%s` — %d KB" % (name, max(1, round(nbytes / 1024))))
    lines += ["", "## A gerar (ainda não estão neste pacote)", ""]
    for code in CENAS:
        key = '"%s"' % code if code.startswith("$") else code
        lines.append("- `fr-cena-%s.webp` — ilustração da situação. Chave `CFG.images.%s`." % (code, key))
    for a in AREAS:
        key = '"area_$"' if a == "$" else "area_" + a
        lines.append("- `fr-area-%s.webp` — fallback da área. Chave `CFG.images.%s`." % (a, key))
    lines += [
        "- `fr-p3.webp` — ilustração do bloco P3. Chave `CFG.images.p3`.",
        "- `fr-relato-1.webp` — print @katianascimento9902. Chave `CFG.images.relato1`.",
        "- `fr-relato-2.webp` — print @andrezarosolen. Chave `CFG.images.relato2`.",
        "- `fr-relato-3.webp` — print @maria.rgoncalves. Chave `CFG.images.relato3`.",
        "",
        "Enquanto esses arquivos não existirem na pasta pública, o quiz esconde a caixa (a capa, a foto da autora, o preview do casamento e os símbolos já estão ligados).",
        "",
        "Códigos financeiros no mapa usam `$` (`$1`, `$16`, `$11`), o mesmo id interno do quiz é D1, D16 e D11.",
        "",
    ]
    return "\n".join(lines)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--asset-base", default=DEFAULT_BASE, help="URL absoluta da pasta de mídia, com ou sem barra final")
    args = ap.parse_args()
    base = (args.asset_base or "").strip()
    if base and not base.endswith("/"):
        base += "/"
    if re.search(r'["\\\n\r]', base):
        raise SystemExit("asset-base não pode ter aspas, barra invertida ou quebra de linha")

    svgdir = B / "assets" / "simbolos"
    sym = {k: (svgdir / f"{k}.svg").read_text().strip() for k in ["casamento", "filhos", "constancia", "financeiro"]}
    css = noblank((B / "src" / "base.css").read_text() + "\n" + (B / "src" / "extra.css").read_text())
    js = "".join((B / f"src/app{i}.js").read_text() for i in range(1, 7))
    js = js.replace("__SYMBOLS__", json.dumps(sym, ensure_ascii=False))
    js = js.replace("__ASSET_BASE__", base)
    js = noblank(js)
    snippet = (
        '<meta charset="utf-8">\n'
        '<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">\n'
        '<div id="fr-quiz"></div>\n<style>\n' + css + "</style>\n<script>\n" + js + "</script>\n"
    )
    if re.search(r"<(style|script)>\n\s*\n", snippet) or "\n\n" in css or "\n\n" in js:
        raise SystemExit("linha em branco dentro de style/script")

    d = B / "dist"
    d.mkdir(exist_ok=True)
    (d / "quiz-codigo-para-colar.txt").write_text(snippet)
    (d / "quiz-app-source.html").write_text(snippet)
    page = (
        "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
        "<title>O que está acontecendo na minha casa? · Pra. Ezenete Rodrigues</title>\n"
        "<meta name=\"description\" content=\"Teste gratuito: entenda por que isso tá acontecendo na sua casa e o que fazer, na oração, pra essa situação.\">\n"
        "<meta name=\"robots\" content=\"noindex\">\n<meta name=\"theme-color\" content=\"#FFFFFF\">\n"
        "<style>html,body{margin:0;padding:0;background:#FFFFFF;overflow-x:hidden}</style>\n</head>\n<body>\n"
        + snippet + "</body>\n</html>\n"
    )
    w = d / "familia-restaurada-quiz"
    w.mkdir(exist_ok=True)
    (w / "index.html").write_text(page)

    ad = d / "assets"
    ad.mkdir(exist_ok=True)
    written = []
    for rel, name in RASTER:
        dest = ad / name
        to_webp(B / rel, dest)
        written.append((name, dest.stat().st_size))
    for src_name, dest_name in SVGS:
        raw = (svgdir / src_name).read_text()
        colored = raw.replace("currentColor", "#A25A38")
        dest = ad / dest_name
        dest.write_text(colored)
        written.append((dest_name, dest.stat().st_size))
    (ad / "MANIFEST.md").write_text(manifest(written))

    sec, col, wid = "f1a2b3c4", "d5e6f7a8", "b9c0d1e2"
    widget = {
        "id": wid, "elType": "widget", "widgetType": "html",
        "settings": {"html": snippet}, "elements": [],
    }
    column = {
        "id": col, "elType": "column", "isInner": False,
        "settings": {
            "_column_size": 100,
            "padding": {"unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": True},
        },
        "elements": [widget],
    }
    section = {
        "id": sec, "elType": "section", "isInner": False,
        "settings": {
            "layout": "full_width", "gap": "no",
            "background_background": "classic", "background_color": "#FFFFFF",
            "padding": {"unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": True},
            "margin": {"unit": "px", "top": "0", "right": "0", "bottom": "0", "left": "0", "isLinked": True},
        },
        "elements": [column],
    }
    pack = {
        "content": [section],
        "page_settings": [],
        "version": "0.4",
        "title": "Quiz Família Restaurada",
        "type": "section",
    }
    (d / "elementor-quiz-familia-restaurada.json").write_text(json.dumps(pack, ensure_ascii=False))
    print("ok", len(snippet), "assetBase", base or "(vazio)", "assets", len(written))

if __name__ == "__main__":
    main()
