(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const CART_KEY = 'forno-da-vila-cart-v1';
  let memoryCart = [];
  let textScale = 100;

  const formatPrice = (cents) => currency.format((Number(cents) || 0) / 100);
  const announce = (message, selector = '#global-status') => {
    const output = $(selector);
    if (output) output.textContent = message;
  };

  // Mobile navigation: native links remain usable when scripting is unavailable.
  const menuToggle = $('[data-menu-toggle]');
  const siteNav = $('#site-nav');

  const closeMenu = (returnFocus = false) => {
    if (!menuToggle || !siteNav) return;
    siteNav.dataset.open = 'false';
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    if (returnFocus) menuToggle.focus();
  };

  if (menuToggle && siteNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = siteNav.dataset.open === 'true';
      siteNav.dataset.open = String(!isOpen);
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
    });

    siteNav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && siteNav.dataset.open === 'true') closeMenu(true);
    });

    document.addEventListener('click', (event) => {
      if (siteNav.dataset.open === 'true' && !siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  // Theme and type-size preferences are intentionally temporary, not persisted.
  const themeButtons = [$('#theme-toggle'), $('#theme-toggle-secondary')].filter(Boolean);
  const applyTheme = (dark) => {
    if (dark) document.body.dataset.theme = 'dark';
    else delete document.body.dataset.theme;

    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Ativar tema claro' : 'Ativar tema escuro');
      button.title = dark ? 'Ativar tema claro' : 'Ativar tema escuro';
    });
  };

  themeButtons.forEach((button) => {
    button.addEventListener('click', () => applyTheme(document.body.dataset.theme !== 'dark'));
  });

  const applyTextScale = () => {
    document.documentElement.style.fontSize = `${textScale}%`;
  };
  const smallerText = $('#text-smaller');
  const largerText = $('#text-larger');

  if (smallerText) smallerText.addEventListener('click', () => {
    textScale = Math.max(85, textScale - 5);
    applyTextScale();
  });
  if (largerText) largerText.addEventListener('click', () => {
    textScale = Math.min(125, textScale + 5);
    applyTextScale();
  });

  // Mark image containers with a visual fallback if an external image cannot load.
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      const frame = image.closest('.food-photo');
      if (frame) frame.classList.add('image-fallback');
      image.hidden = true;
    }, { once: true });
  });

  // Session-scoped shopping cart. It is a front-end demonstration, not an order API.
  const readCart = () => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(CART_KEY) || '[]');
      if (!Array.isArray(parsed)) return memoryCart;
      return parsed.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string'
        && Number.isInteger(item.price) && item.price >= 0 && Number.isInteger(item.quantity) && item.quantity > 0);
    } catch (_error) {
      return memoryCart;
    }
  };

  const writeCart = (cart) => {
    memoryCart = cart;
    try { sessionStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_error) { /* In-memory fallback for restricted storage. */ }
    renderCart();
    renderOrderSummary();
  };

  const cartDialog = $('#cart-dialog');
  const cartItemsList = $('[data-cart-items]');
  const cartEmpty = $('[data-cart-empty]');
  const cartFooter = $('[data-cart-footer]');
  const cartTotal = $('[data-cart-total]');

  const totalFor = (cart) => cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalQuantity = (cart) => cart.reduce((total, item) => total + item.quantity, 0);

  const createQuantityButton = (label, amount, productId) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'quantity-button';
    button.dataset.cartChange = String(amount);
    button.dataset.productId = productId;
    button.setAttribute('aria-label', `${amount > 0 ? 'Aumentar' : 'Diminuir'} quantidade de ${label}`);
    button.textContent = amount > 0 ? '+' : '−';
    return button;
  };

  const renderCart = () => {
    const cart = readCart();
    const quantity = totalQuantity(cart);
    $$('[data-cart-count]').forEach((count) => {
      count.textContent = String(quantity);
      count.setAttribute('aria-label', `${quantity} ${quantity === 1 ? 'item' : 'itens'} na sacola`);
    });
    $$('[data-cart-open]').forEach((button) => {
      button.setAttribute('aria-label', `Abrir sacola com ${quantity} ${quantity === 1 ? 'item' : 'itens'}`);
    });

    if (!cartItemsList) return;
    cartItemsList.replaceChildren();
    if (cartEmpty) cartEmpty.hidden = cart.length !== 0;
    if (cartFooter) cartFooter.hidden = cart.length === 0;

    cart.forEach((item) => {
      const line = document.createElement('li');
      line.className = 'cart-line';
      const details = document.createElement('div');
      const name = document.createElement('h3');
      name.textContent = item.name;
      const unitPrice = document.createElement('p');
      unitPrice.textContent = `${formatPrice(item.price)} cada`;
      const controls = document.createElement('div');
      controls.className = 'quantity-controls';
      controls.append(createQuantityButton(item.name, -1, item.id));
      const quantityLabel = document.createElement('span');
      quantityLabel.textContent = String(item.quantity);
      quantityLabel.setAttribute('aria-label', 'Quantidade');
      controls.append(quantityLabel, createQuantityButton(item.name, 1, item.id));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-item';
      remove.dataset.cartRemove = item.id;
      remove.textContent = 'Remover';
      controls.append(remove);
      details.append(name, unitPrice, controls);
      const lineTotal = document.createElement('span');
      lineTotal.className = 'cart-line-total';
      lineTotal.textContent = formatPrice(item.price * item.quantity);
      line.append(details, lineTotal);
      cartItemsList.append(line);
    });

    if (cartTotal) cartTotal.textContent = formatPrice(totalFor(cart));
  };

  const orderSummaryList = $('#order-summary-list');
  const orderSummaryTotal = $('#order-summary-total');
  const orderEmpty = $('#order-empty');

  const renderOrderSummary = () => {
    if (!orderSummaryList) return;
    const cart = readCart();
    orderSummaryList.replaceChildren();
    if (orderEmpty) orderEmpty.hidden = cart.length > 0;

    cart.forEach((item) => {
      const line = document.createElement('li');
      line.className = 'order-summary-line';
      const description = document.createElement('span');
      description.append(document.createTextNode(item.name));
      const qty = document.createElement('small');
      qty.textContent = `Quantidade: ${item.quantity}`;
      description.append(qty);
      const subtotal = document.createElement('span');
      subtotal.textContent = formatPrice(item.price * item.quantity);
      line.append(description, subtotal);
      orderSummaryList.append(line);
    });
    if (orderSummaryTotal) orderSummaryTotal.textContent = formatPrice(totalFor(cart));
  };

  const updateItemQuantity = (productId, change) => {
    const nextCart = readCart().map((item) => item.id === productId ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0);
    writeCart(nextCart);
  };

  $$('[data-cart-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.productId;
      const name = button.dataset.productName;
      const price = Number(button.dataset.productPrice);
      if (!id || !name || !Number.isInteger(price) || price < 0) return;

      const cart = readCart();
      const existing = cart.find((item) => item.id === id);
      if (existing) existing.quantity += 1;
      else cart.push({ id, name, price, quantity: 1 });
      writeCart(cart);
      announce(`${name} adicionado à sacola.`);
      const menuStatus = $('#global-status');
      if (menuStatus) menuStatus.textContent = `${name} adicionado à sacola.`;
      button.setAttribute('aria-label', `${name} adicionado. Adicionar mais uma unidade`);
    });
  });

  if (cartDialog) {
    $$('[data-cart-open]').forEach((button) => button.addEventListener('click', () => {
      renderCart();
      if (typeof cartDialog.showModal === 'function') cartDialog.showModal();
      else cartDialog.setAttribute('open', '');
    }));

    $$('[data-cart-close]', cartDialog).forEach((button) => button.addEventListener('click', () => {
      if (typeof cartDialog.close === 'function') cartDialog.close();
      else cartDialog.removeAttribute('open');
    }));

    cartDialog.addEventListener('click', (event) => {
      if (event.target === cartDialog) {
        if (typeof cartDialog.close === 'function') cartDialog.close();
        else cartDialog.removeAttribute('open');
      }
      const changeButton = event.target.closest('[data-cart-change]');
      if (changeButton) updateItemQuantity(changeButton.dataset.productId, Number(changeButton.dataset.cartChange));
      const removeButton = event.target.closest('[data-cart-remove]');
      if (removeButton) writeCart(readCart().filter((item) => item.id !== removeButton.dataset.cartRemove));
    });

    const clearButton = $('[data-cart-clear]', cartDialog);
    if (clearButton) clearButton.addEventListener('click', () => {
      writeCart([]);
      announce('Sacola esvaziada.');
    });
  }

  // Accessible audio descriptions for every menu item, using the browser speech engine.
  const speech = typeof window !== 'undefined' ? window.speechSynthesis : null;
  let activeSpeechButton = null;
  const resetSpeechButton = () => {
    if (!activeSpeechButton) return;
    activeSpeechButton.textContent = '▶ Ouvir descrição';
    activeSpeechButton.setAttribute('aria-label', activeSpeechButton.dataset.audioLabel || 'Ouvir descrição do produto');
    activeSpeechButton.setAttribute('aria-pressed', 'false');
    activeSpeechButton = null;
  };

  const menuCardsForAudio = $$('[data-menu-card]');
  menuCardsForAudio.forEach((card) => {
    const content = $('.product-content', card);
    const name = $('h3', card)?.textContent?.trim();
    const description = $('.product-description', card)?.textContent?.trim();
    const price = $('.product-price', card)?.textContent?.trim();
    if (!content || !name || !description || !price || $('[data-speak-product]', content)) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'audio-description-button';
    button.dataset.speakProduct = '';
    button.dataset.audioLabel = `Ouvir descrição de ${name}`;
    button.setAttribute('aria-label', button.dataset.audioLabel);
    button.setAttribute('aria-pressed', 'false');
    button.textContent = '▶ Ouvir descrição';
    button.addEventListener('click', () => {
      if (!speech || typeof SpeechSynthesisUtterance === 'undefined') {
        announce('A leitura em voz alta não é compatível com este navegador. Tente uma versão atualizada ou use o leitor de tela do dispositivo.');
        return;
      }
      if (activeSpeechButton === button && speech.speaking) {
        speech.cancel();
        resetSpeechButton();
        announce('Leitura interrompida.');
        return;
      }
      speech.cancel();
      resetSpeechButton();
      const utterance = new SpeechSynthesisUtterance(`${name}. ${description} Preço: ${price}.`);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.92;
      utterance.onend = resetSpeechButton;
      utterance.onerror = resetSpeechButton;
      activeSpeechButton = button;
      button.textContent = '■ Parar áudio';
      button.setAttribute('aria-label', `Parar leitura de ${name}`);
      button.setAttribute('aria-pressed', 'true');
      speech.speak(utterance);
      announce(`Lendo descrição de ${name}.`);
    });

    const productBottom = $('.product-bottom', content);
    if (productBottom) content.insertBefore(button, productBottom);
    else content.append(button);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && speech?.speaking) {
      speech.cancel();
      resetSpeechButton();
    }
  });

  // Search and category filters on the menu page.
  const menuGrid = $('#menu-grid');
  if (menuGrid) {
    const searchInput = $('#menu-search');
    const categorySelect = $('#menu-category');
    const count = $('#menu-count');
    const emptyState = $('#menu-empty');
    const clearFilters = $('#clear-menu-filters');
    const cards = $$('[data-menu-card]', menuGrid);

    const updateMenu = () => {
      const query = (searchInput?.value || '').trim().toLocaleLowerCase('pt-BR');
      const category = categorySelect?.value || 'all';
      let visible = 0;
      cards.forEach((card) => {
        const searchText = `${card.dataset.search || ''} ${card.textContent || ''}`.toLocaleLowerCase('pt-BR');
        const matchesText = !query || searchText.includes(query);
        const matchesCategory = category === 'all' || card.dataset.category === category;
        const showCard = matchesText && matchesCategory;
        card.hidden = !showCard;
        if (showCard) visible += 1;
      });
      if (count) count.textContent = `${visible} ${visible === 1 ? 'item encontrado' : 'itens encontrados'}`;
      if (emptyState) emptyState.hidden = visible !== 0;
      menuGrid.hidden = visible === 0;
    };

    if (searchInput) searchInput.addEventListener('input', updateMenu);
    if (categorySelect) categorySelect.addEventListener('change', updateMenu);
    if (clearFilters) clearFilters.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      updateMenu();
      if (searchInput) searchInput.focus();
    });
    updateMenu();
  }

  // Delivery vs. pickup controls the requirement and visibility of the address field.
  const orderForm = $('#order-form');
  if (orderForm) {
    const addressField = $('#address-field');
    const addressInput = $('#customer-address');
    const orderStatus = $('#order-status');
    const updateFulfillment = () => {
      const selection = $('input[name="fulfillment"]:checked', orderForm)?.value || 'delivery';
      const delivery = selection === 'delivery';
      if (addressField) addressField.hidden = !delivery;
      if (addressInput) {
        addressInput.required = delivery;
        if (!delivery) addressInput.value = '';
      }
    };
    $$('input[name="fulfillment"]', orderForm).forEach((radio) => radio.addEventListener('change', updateFulfillment));
    updateFulfillment();

    orderForm.addEventListener('input', () => {
      if (orderStatus) {
        orderStatus.hidden = true;
        orderStatus.textContent = '';
        orderStatus.removeAttribute('data-state');
      }
    });

    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const cart = readCart();
      if (cart.length === 0) {
        if (orderStatus) {
          orderStatus.hidden = false;
          orderStatus.dataset.state = 'error';
          orderStatus.textContent = 'Sua sacola está vazia. Adicione pelo menos um item ao cardápio antes de continuar.';
        }
        const openCartLink = $('#order-summary-panel a[href="cardapio.html"]');
        if (openCartLink) openCartLink.focus();
        return;
      }
      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
      }
      if (orderStatus) {
        orderStatus.hidden = false;
        orderStatus.dataset.state = 'success';
        orderStatus.textContent = 'Demonstração concluída: nenhum pedido real foi enviado e os dados do formulário não foram armazenados. Para uso real, esta etapa precisa de um backend seguro.';
      }
    });
  }

  // Keep the footer year current.
  $$('[data-current-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });

  renderCart();
  renderOrderSummary();
})();
