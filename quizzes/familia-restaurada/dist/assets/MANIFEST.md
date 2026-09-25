# Assets do quiz Família Restaurada

Suba esta pasta na mídia do WordPress e rode o build com a URL pública da pasta:

```
python3 build.py --asset-base https://escoladeintercessao.com.br/wp-content/uploads/familia-restaurada/
```

O argumento preenche `CFG.assetBase`. Cada chave de `CFG.images` vira essa URL + o nome do arquivo. Base vazia (`python3 build.py --asset-base ""`) deixa as URLs vazias e o quiz não desenha imagem (sem ícone quebrado).

Regra na tela: imagem da situação, senão a da área, senão nada. `loading="lazy"` e caixa 4:3.

## Já otimizados (neste pacote)

- `fr-capa-casamento.webp` — 25 KB
- `fr-capa-filhos.webp` — 21 KB
- `fr-capa-oracao.webp` — 23 KB
- `fr-capa-financeiro.webp` — 23 KB
- `fr-ezenete-autora.webp` — 32 KB
- `fr-preview-casamento.webp` — 44 KB
- `fr-preview-01-capa.webp` — 17 KB
- `fr-preview-02-sobre-a-autora.webp` — 28 KB
- `fr-preview-03-sumario-1.webp` — 20 KB
- `fr-preview-04-sumario-2.webp` — 16 KB
- `fr-preview-05-teoria.webp` — 46 KB
- `fr-preview-07-situacao-p2.webp` — 34 KB
- `fr-preview-08-situacao-p3.webp` — 38 KB
- `fr-simbolo-casamento.svg` — 1 KB
- `fr-simbolo-filhos.svg` — 1 KB
- `fr-simbolo-oracao.svg` — 1 KB
- `fr-simbolo-financeiro.svg` — 3 KB
- `fr-simbolo-crise.svg` — 1 KB
- `fr-simbolo-dias30.svg` — 1 KB
- `fr-simbolo-versiculos.svg` — 1 KB

## A gerar (ainda não estão neste pacote)

- `fr-cena-C1.webp` — ilustração da situação. Chave `CFG.images.C1`.
- `fr-cena-C2.webp` — ilustração da situação. Chave `CFG.images.C2`.
- `fr-cena-C15.webp` — ilustração da situação. Chave `CFG.images.C15`.
- `fr-cena-C7.webp` — ilustração da situação. Chave `CFG.images.C7`.
- `fr-cena-C10.webp` — ilustração da situação. Chave `CFG.images.C10`.
- `fr-cena-C14.webp` — ilustração da situação. Chave `CFG.images.C14`.
- `fr-cena-F2.webp` — ilustração da situação. Chave `CFG.images.F2`.
- `fr-cena-F7.webp` — ilustração da situação. Chave `CFG.images.F7`.
- `fr-cena-F8.webp` — ilustração da situação. Chave `CFG.images.F8`.
- `fr-cena-F20.webp` — ilustração da situação. Chave `CFG.images.F20`.
- `fr-cena-O7.webp` — ilustração da situação. Chave `CFG.images.O7`.
- `fr-cena-O2.webp` — ilustração da situação. Chave `CFG.images.O2`.
- `fr-cena-O5.webp` — ilustração da situação. Chave `CFG.images.O5`.
- `fr-cena-O12.webp` — ilustração da situação. Chave `CFG.images.O12`.
- `fr-cena-O1.webp` — ilustração da situação. Chave `CFG.images.O1`.
- `fr-cena-O15.webp` — ilustração da situação. Chave `CFG.images.O15`.
- `fr-cena-$1.webp` — ilustração da situação. Chave `CFG.images."$1"`.
- `fr-cena-$16.webp` — ilustração da situação. Chave `CFG.images."$16"`.
- `fr-cena-$11.webp` — ilustração da situação. Chave `CFG.images."$11"`.
- `fr-area-C.webp` — fallback da área. Chave `CFG.images.area_C`.
- `fr-area-F.webp` — fallback da área. Chave `CFG.images.area_F`.
- `fr-area-O.webp` — fallback da área. Chave `CFG.images.area_O`.
- `fr-area-$.webp` — fallback da área. Chave `CFG.images."area_$"`.
- `fr-p3.webp` — ilustração do bloco P3. Chave `CFG.images.p3`.
- `fr-relato-1.webp` — print @katianascimento9902. Chave `CFG.images.relato1`.
- `fr-relato-2.webp` — print @andrezarosolen. Chave `CFG.images.relato2`.
- `fr-relato-3.webp` — print @maria.rgoncalves. Chave `CFG.images.relato3`.

Enquanto esses arquivos não existirem na pasta pública, o quiz esconde a caixa (a capa, a foto da autora, o preview do casamento e os símbolos já estão ligados).

Códigos financeiros no mapa usam `$` (`$1`, `$16`, `$11`), o mesmo id interno do quiz é D1, D16 e D11.
