# Publicar o Quiz Família Restaurada no WordPress (igual ao Raízes)

Como o Raízes está publicado (escoladeintercessao.com.br/quiz-raizes/, página ID 5339), conferido no HTML ao vivo em 25/09/2026:
- WordPress + tema Astra (astra-child) + Elementor/Elementor Pro.
- Página comum (template padrão do Astra), título escondido e sem cabeçalho/rodapé do site (sem markup de header/footer do Astra).
- UMA seção Elementor largura total (fundo #FFFFFF, espaçamento "sem", margem/padding 0) > 1 coluna > 1 widget **HTML** com o código colado.
- O Pixel da Meta NÃO está no código do quiz: vem do plugin PixelYourSite, no site todo (pixel 1525257898274703). O quiz só dispara fbq("trackCustom", ...) se o fbq existir. Qualquer página nova no domínio já carrega o pixel.

Passo a passo:
1. wp-admin > Páginas > Adicionar nova. Título "Quiz Família Restaurada", slug `quiz-familia-restaurada`.
2. Editar com Elementor. Opção A: pasta de templates > Importar `elementor-quiz-familia-restaurada.json` e inserir. Opção B: seção largura total, sem gap, fundo branco, padding 0 > widget HTML > colar TODO o `quiz-codigo-para-colar.txt`.
3. Configurações da página: esconder título; nas opções do Astra, desativar cabeçalho e rodapé (igual ao Raízes).
4. Publicar. Abrir https://escoladeintercessao.com.br/quiz-familia-restaurada/ e conferir tema claro + pixel (Meta Pixel Helper, ou `fbq` no console).

Assets (capas, foto, preview, símbolos e, quando existirem, as ilustrações):
- A lista de arquivos e o que ainda falta gerar está em `dist/assets/MANIFEST.md`.
- Depois do upload na mídia, rode `python3 build.py --asset-base URL-DA-PASTA/` e cole de novo o `quiz-codigo-para-colar.txt`. A URL entra em `CFG.assetBase` e monta `CFG.images`.
- Sem o arquivo na pasta, a imagem some (não fica ícone quebrado). A ilustração da situação cai na da área; se a da área também não existir, o bloco não desenha imagem.
