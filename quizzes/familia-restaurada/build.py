import json, os, pathlib
B = pathlib.Path(__file__).parent
svgdir = pathlib.Path('/workspace/familia-restaurada/design-system/template/svg')
sym = {k:(svgdir/f'{k}.svg').read_text().strip() for k in ['casamento','filhos','constancia','financeiro']}
css = (B/'src/base.css').read_text() + (B/'src/extra.css').read_text()
js = ''.join((B/f'src/app{i}.js').read_text() for i in range(1,7)).replace('__SYMBOLS__', json.dumps(sym, ensure_ascii=False))
snippet = ('<meta charset="utf-8">\n<link href="https://fonts.googleapis.com/css2?family=Raleway:wght@600;700;800&family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">\n'
  '<div id="fr-quiz"></div>\n<style>\n' + css + '</style>\n<script>\n' + js + '</script>\n')
d = B/'dist'; d.mkdir(exist_ok=True)
(d/'quiz-codigo-para-colar.txt').write_text(snippet)
(d/'quiz-app-source.html').write_text(snippet)
page = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  '<title>O que está acontecendo na minha casa? · Pra. Ezenete Rodrigues</title>\n<meta name="description" content="Teste gratuito: entenda por que isso tá acontecendo na sua casa e o que fazer, na oração, pra essa situação.">\n'
  '<meta name="robots" content="noindex">\n<meta name="theme-color" content="#FFFFFF">\n<style>html,body{margin:0;padding:0;background:#FFFFFF}</style>\n</head>\n<body>\n' + snippet + '</body>\n</html>\n')
w = d/'familia-restaurada-quiz'; w.mkdir(exist_ok=True)
(w/'index.html').write_text(page)
print('ok', len(snippet))
