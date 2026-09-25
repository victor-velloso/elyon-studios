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

Assets (mídia de www.ezeneterodrigues.com.br, pasta `wp-content/uploads/2026/09/`):
- A lista para subir está em `dist/assets/MANIFEST.md`. Nomes em minúsculas. O financeiro usa `s` no arquivo (`fr-cena-s1.webp`), a chave interna continua `$1`.
- `python3 build.py --asset-base https://www.ezeneterodrigues.com.br/wp-content/uploads/2026/09/`
- Se o WordPress gravar sufixo (`-1`), use `--asset-map mapa.json` (nome do arquivo neste pacote → URL absoluta). O mapa só precisa dos arquivos que mudaram de nome.
