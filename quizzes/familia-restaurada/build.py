#!/usr/bin/env python3
"""Monta dist/ do quiz Família Restaurada.

Uso:
  python3 build.py --asset-base https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/
  python3 build.py --asset-base URL --asset-map mapa.json
"""
import argparse, json, pathlib, re, shutil
from PIL import Image

B = pathlib.Path(__file__).parent
DEFAULT_BASE = "https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/"
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
RELATOS = [
    ("assets/relatos/relato-1.jpg", "fr-relato-1.webp"),
    ("assets/relatos/relato-2.jpg", "fr-relato-2.webp"),
    ("assets/relatos/relato-3.jpeg", "fr-relato-3.webp"),
]
AREA_PREV = [
    ("assets/previews-areas/filhos-situacao.png", "fr-preview-filhos.webp"),
    ("assets/previews-areas/oracao-situacao-p1.png", "fr-preview-oracao.webp"),
    ("assets/previews-areas/financeiro-situacao-p1.png", "fr-preview-financeiro.webp"),
]
KEY_NOTES = [
    ("fr-cena-c1.webp", "C1"), ("fr-cena-c2.webp", "C2"), ("fr-cena-c15.webp", "C15"),
    ("fr-cena-c7.webp", "C7"), ("fr-cena-c10.webp", "C10"), ("fr-cena-c14.webp", "C14"),
    ("fr-cena-f2.webp", "F2"), ("fr-cena-f7.webp", "F7"), ("fr-cena-f8.webp", "F8"), ("fr-cena-f20.webp", "F20"),
    ("fr-cena-o7.webp", "O7"), ("fr-cena-o2.webp", "O2"), ("fr-cena-o5.webp", "O5"),
    ("fr-cena-o12.webp", "O12"), ("fr-cena-o1.webp", "O1"), ("fr-cena-o15.webp", "O15"),
    ("fr-cena-s1.webp", '"$1" (D1)'), ("fr-cena-s16.webp", '"$16" (D16)'), ("fr-cena-s11.webp", '"$11" (D11)'),
    ("fr-area-c.webp", "area_C"), ("fr-area-f.webp", "area_F"), ("fr-area-o.webp", "area_O"),
    ("fr-area-s.webp", '"area_$"'),
    ("fr-p3-quadrada.webp", "p3 (caixa 1:1)"),
    ("fr-p3.webp", "4:3 do P3, no pacote; a tela usa a quadrada"),
    ("fr-preview-casamento.webp", "preview_C"), ("fr-preview-filhos.webp", "preview_F"),
    ("fr-preview-oracao.webp", "preview_O"), ("fr-preview-financeiro.webp", "preview_D"),
    ("fr-relato-1.webp", "relato1 · @katianascimento9902"),
    ("fr-relato-2.webp", "relato2 · @andrezarosolen"),
    ("fr-relato-3.webp", "relato3 · @maria.rgoncalves"),
]

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
    by = {name: nbytes for name, nbytes in written}
    lines = [
        "# Assets do quiz Família Restaurada",
        "",
        "Suba os arquivos de imagem e SVG (não o MANIFEST) na mídia de www.ezeneterodrigues.com.br.",
        "Os nomes já estão em minúsculas. O WordPress não muda o nome ao minúsculo.",
        "O `$` do financeiro virou `s` no arquivo (`fr-cena-s1.webp`, `fr-cena-s16.webp`, `fr-cena-s11.webp`, `fr-area-s.webp`). A chave interna continua `$1`, `$16`, `$11` e `area_$`.",
        "",
        "Depois do upload, se os nomes saírem iguais:",
        "",
        "```",
        "python3 build.py --asset-base https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/",
        "```",
        "",
        "Se o WordPress acrescentar sufixo (`fr-cena-c1-1.webp`), grave um JSON e passe `--asset-map`. A chave é o nome do arquivo neste pacote; o valor é a URL absoluta.",
        "",
        "```",
        "python3 build.py --asset-base https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/ --asset-map mapa.json",
        "```",
        "",
        "```json",
        '{ "fr-cena-c1.webp": "https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/fr-cena-c1-1.webp" }',
        "```",
        "",
        "O mapa cobre só os arquivos renomeados. O resto usa a base + o nome em minúsculas. Base vazia e sem mapa não desenha imagem.",
        "",
        "Na tela: ilustração da situação, senão a da área, senão nada. `loading=\"lazy\"` e caixa 4:3. O P3 usa `fr-p3-quadrada.webp` (1:1). `fr-p3.webp` é o 4:3, incluído no pacote.",
        "",
        "## Arquivos para upload",
        "",
    ]
    for name, nbytes in written:
        note = ""
        for fn, key in KEY_NOTES:
            if fn == name:
                note = " — CFG.images." + key
                break
        lines.append("- `%s` — %d KB%s" % (name, max(1, round(nbytes / 1024)), note))
    missing = [fn for fn, _ in KEY_NOTES if fn not in by]
    if missing:
        lines += ["", "Faltando no pacote: " + ", ".join(missing)]
    lines.append("")
    return "\n".join(lines)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--asset-base", default=DEFAULT_BASE, help="URL absoluta da pasta de mídia, com ou sem barra final")
    ap.add_argument("--asset-map", default="", help="JSON com nome do arquivo -> URL absoluta")
    args = ap.parse_args()
    base = (args.asset_base or "").strip()
    if base and not base.endswith("/"):
        base += "/"
    if re.search(r'["\\\n\r]', base):
        raise SystemExit("asset-base não pode ter aspas, barra invertida ou quebra de linha")
    amap = {}
    if args.asset_map:
        raw = json.loads(pathlib.Path(args.asset_map).read_text())
        if not isinstance(raw, dict):
            raise SystemExit("asset-map precisa ser um objeto JSON")
        for k, v in raw.items():
            if not isinstance(k, str) or not isinstance(v, str):
                raise SystemExit("asset-map só aceita texto")
            if re.search(r'[\n\r]', v):
                raise SystemExit("URL do mapa não pode ter quebra de linha")
            amap[k.strip().lower()] = v.strip()

    svgdir = B / "assets" / "simbolos"
    sym = {k: (svgdir / f"{k}.svg").read_text().strip() for k in ["casamento", "filhos", "constancia", "financeiro"]}
    css = noblank((B / "src" / "base.css").read_text() + "\n" + (B / "src" / "extra.css").read_text())
    js = "".join((B / f"src/app{i}.js").read_text() for i in range(1, 7))
    js = js.replace("__SYMBOLS__", json.dumps(sym, ensure_ascii=False))
    js = js.replace("__ASSET_BASE__", base)
    js = js.replace("__ASSET_MAP__", json.dumps(amap, ensure_ascii=False))
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
    for rel, name in RASTER + RELATOS + AREA_PREV:
        dest = ad / name.lower()
        to_webp(B / rel, dest)
        written.append((dest.name, dest.stat().st_size))
    ill = B / "assets" / "ilustracoes"
    for src in sorted(ill.glob("*.webp")):
        dest = ad / src.name.lower()
        shutil.copy2(src, dest)
        if dest.stat().st_size > MAX_BYTES:
            raise SystemExit("ilustração acima de 200 KB: %s" % dest.name)
        written.append((dest.name, dest.stat().st_size))
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
