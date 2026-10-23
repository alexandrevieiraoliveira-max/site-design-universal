# Forno da Vila — site responsivo de pizzaria

Site estático demonstrativo para uma pizzaria genérica, construído com HTML semântico, CSS responsivo e JavaScript sem frameworks ou dependências npm obrigatórias.

## Executar localmente

Entre na pasta do projeto e inicie um servidor estático:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000` no navegador. Para testar a versão responsiva, use as ferramentas de dispositivo do navegador ou redimensione a janela.

## Páginas

- `index.html` — apresentação, diferenciais e pizzas em destaque.
- `cardapio.html` — catálogo com busca, filtros por categoria e sacola interativa.
- `historia.html` — proposta e valores da pizzaria fictícia.
- `pedido.html` — resumo da sacola e formulário demonstrativo de pedido.
- `acessibilidade.html` — recursos de acessibilidade e limitações conhecidas.

## Recursos implementados

- Layout fluido para celular, tablet, notebook e desktop, com breakpoints para telas de até 380 px, 640 px, 880 px e 1040 px.
- Navegação móvel com `aria-expanded`, fechamento pelo teclado e link para pular ao conteúdo principal.
- Tema claro/escuro e ajuste do tamanho do texto. Essas preferências são temporárias e não são gravadas.
- Cards de cardápio, busca textual, filtros por categoria e mensagem de resultados vazios.
- Sacola de demonstração com inclusão, remoção, alteração de quantidade e cálculo de subtotal. A sacola usa `sessionStorage` na sessão do navegador e tem fallback em memória caso o armazenamento esteja bloqueado.
- Resumo da sacola no fluxo de pedido, alternância entrega/retirada e validação de campos no cliente.
- Anúncios de estado com `aria-live`, rótulos dos campos, foco visível e suporte a `prefers-reduced-motion`.
- Ocultação segura do conteúdo do formulário: ele não é transmitido nem gravado; o envio apenas mostra uma mensagem demonstrativa.
- Fallback visual se uma fotografia remota não carregar.

## Arquitetura

O projeto é multipágina e estático. O HTML define estrutura e conteúdo; `assets/css/styles.css` centraliza tokens visuais, componentes e breakpoints; `assets/js/main.js` concentra os comportamentos que são compartilhados entre páginas e verifica a existência dos elementos antes de inicializar cada recurso. Não existe build obrigatório.

## Limitações e publicação

- **Não há backend, processamento de pedidos, pagamento, conta de usuário, envio de e-mail, nem integração com delivery.** O formulário não envia dados e não representa uma venda real.
- Os itens e preços são ilustrativos. Revise ingredientes, alérgenos, tamanhos, taxas, área de entrega, horários e disponibilidade antes de publicar.
- Os dados comerciais de endereço e telefone não foram inventados. Configure canais de atendimento, política de privacidade e termos reais antes de usar em produção.
- As fotografias são carregadas de `images.unsplash.com`, então precisam de conexão com a internet. O layout mantém fundos de fallback se as imagens remotas falharem. Confirme a licença e a atribuição necessária para cada imagem escolhida antes de publicar.
- O design contempla práticas de acessibilidade, mas ainda não houve auditoria formal nem avaliação de conformidade WCAG 2.2. Faça testes de teclado, leitor de tela, contraste, zoom/refluxo, mensagens de validação e fluxos em dispositivos reais antes do uso público.
- Tema e escala de fonte se aplicam apenas à página aberta e voltam ao padrão ao navegar/carregar outra página. A sacola é mantida na sessão do navegador, não em uma conta de usuário.

## Referências técnicas

- W3C — Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
- MDN — elementos HTML e APIs do navegador: https://developer.mozilla.org/
- Imagens de referência: páginas de fotos no Unsplash. O uso final deve respeitar a licença vigente de cada imagem.

## Antes de usar como site real

Configure um backend/API para receber pedidos, valide os dados também no servidor, implemente controles de abuso e proteção de dados, conecte uma solução de pagamento quando necessário e inclua os dados reais da operação. Faça uma revisão de conteúdo e uma auditoria de acessibilidade antes da publicação.
