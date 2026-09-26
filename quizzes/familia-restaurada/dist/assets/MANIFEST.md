# Assets do quiz Família Restaurada

Suba os arquivos de imagem e SVG (não o MANIFEST) na mídia de www.ezeneterodrigues.com.br.
Os nomes já estão em minúsculas. O WordPress não muda o nome ao minúsculo.
O `$` do financeiro virou `s` no arquivo (`fr-cena-s1.webp`, `fr-cena-s16.webp`, `fr-cena-s11.webp`, `fr-area-s.webp`). A chave interna continua `$1`, `$16`, `$11` e `area_$`.

Depois do upload, se os nomes saírem iguais:

```
python3 build.py --asset-base https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/
```

Se o WordPress acrescentar sufixo (`fr-cena-c1-1.webp`), grave um JSON e passe `--asset-map`. A chave é o nome do arquivo neste pacote; o valor é a URL absoluta.

```
python3 build.py --asset-base https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/ --asset-map mapa.json
```

```json
{ "fr-cena-c1.webp": "https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/fr-cena-c1-1.webp" }
```

O mapa cobre só os arquivos renomeados. O resto usa a base + o nome em minúsculas. Base vazia e sem mapa não desenha imagem.

Na tela: ilustração da situação, senão a da área, senão nada. `loading="lazy"` e caixa 4:3. O P3 usa `fr-p3-quadrada.webp` (1:1). `fr-p3.webp` é o 4:3, incluído no pacote.

## Arquivos para upload

- `fr-capa-casamento.webp` — 25 KB
- `fr-capa-filhos.webp` — 21 KB
- `fr-capa-oracao.webp` — 23 KB
- `fr-capa-financeiro.webp` — 23 KB
- `fr-ezenete-autora.webp` — 32 KB
- `fr-preview-casamento.webp` — 44 KB — CFG.images.preview_C
- `fr-preview-01-capa.webp` — 17 KB
- `fr-preview-02-sobre-a-autora.webp` — 28 KB
- `fr-preview-03-sumario-1.webp` — 20 KB
- `fr-preview-04-sumario-2.webp` — 16 KB
- `fr-preview-05-teoria.webp` — 46 KB
- `fr-preview-07-situacao-p2.webp` — 34 KB
- `fr-preview-08-situacao-p3.webp` — 38 KB
- `fr-relato-1.webp` — 18 KB — CFG.images.relato1 · @katianascimento9902
- `fr-relato-2.webp` — 21 KB — CFG.images.relato2 · @andrezarosolen
- `fr-relato-3.webp` — 6 KB — CFG.images.relato3 · @maria.rgoncalves
- `fr-preview-filhos.webp` — 52 KB — CFG.images.preview_F
- `fr-preview-oracao.webp` — 43 KB — CFG.images.preview_O
- `fr-preview-financeiro.webp` — 43 KB — CFG.images.preview_D
- `fr-area-c.webp` — 78 KB — CFG.images.area_C
- `fr-area-f.webp` — 77 KB — CFG.images.area_F
- `fr-area-o.webp` — 81 KB — CFG.images.area_O
- `fr-area-s.webp` — 71 KB — CFG.images."area_$"
- `fr-cena-c1.webp` — 81 KB — CFG.images.C1
- `fr-cena-c10.webp` — 93 KB — CFG.images.C10
- `fr-cena-c14.webp` — 89 KB — CFG.images.C14
- `fr-cena-c15.webp` — 81 KB — CFG.images.C15
- `fr-cena-c2.webp` — 81 KB — CFG.images.C2
- `fr-cena-c7.webp` — 86 KB — CFG.images.C7
- `fr-cena-f2.webp` — 69 KB — CFG.images.F2
- `fr-cena-f20.webp` — 76 KB — CFG.images.F20
- `fr-cena-f7.webp` — 85 KB — CFG.images.F7
- `fr-cena-f8.webp` — 76 KB — CFG.images.F8
- `fr-cena-o1.webp` — 85 KB — CFG.images.O1
- `fr-cena-o12.webp` — 112 KB — CFG.images.O12
- `fr-cena-o15.webp` — 66 KB — CFG.images.O15
- `fr-cena-o2.webp` — 74 KB — CFG.images.O2
- `fr-cena-o5.webp` — 74 KB — CFG.images.O5
- `fr-cena-o7.webp` — 79 KB — CFG.images.O7
- `fr-cena-s1.webp` — 96 KB — CFG.images."$1" (D1)
- `fr-cena-s11.webp` — 61 KB — CFG.images."$11" (D11)
- `fr-cena-s16.webp` — 62 KB — CFG.images."$16" (D16)
- `fr-p3-quadrada.webp` — 35 KB — CFG.images.p3 (caixa 1:1)
- `fr-p3.webp` — 39 KB — CFG.images.4:3 do P3, no pacote; a tela usa a quadrada
- `fr-simbolo-casamento.svg` — 1 KB
- `fr-simbolo-filhos.svg` — 1 KB
- `fr-simbolo-oracao.svg` — 1 KB
- `fr-simbolo-financeiro.svg` — 3 KB
- `fr-simbolo-crise.svg` — 1 KB
- `fr-simbolo-dias30.svg` — 1 KB
- `fr-simbolo-versiculos.svg` — 1 KB
