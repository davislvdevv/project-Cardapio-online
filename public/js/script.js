// Intersection Observer para animações de entrada
document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll(".product-container, .bebida-item");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(el => observer.observe(el));

  // Inicializar carregamento de produtos da API
  fetchProducts();
  
  // Inicializar o slider de promoções
  initPromoSlider();
  
  // Inicializar outros componentes da página
  initNavbar();
  setupMenuHamburguer();
  setupModalHandlers();
});

// Função para buscar produtos da API
async function fetchProducts() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    if (!response.ok) {
      throw new Error('Falha ao carregar produtos');
    }
    const products = await response.json();
    renderProducts(products);
  } catch (err) {
    console.error('Erro ao carregar produtos:', err);
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = 'Erro ao carregar produtos. Tente novamente mais tarde.';
      errorElement.style.display = 'block';
    }
  }
}

// Função para renderizar produtos da API
function renderProducts(products) {
  const hamburguerSection = document.getElementById('hamburguer');
  const bebidasGrid = document.querySelector('.bebidas-grid');
  const pizzaGrid = document.querySelector('.pizzas-grid');
  
  // Limpar conteúdo existente para evitar duplicação
  if (hamburguerSection) hamburguerSection.innerHTML = '';
  if (bebidasGrid) bebidasGrid.innerHTML = '';
  if (pizzaGrid) pizzaGrid.innerHTML = '';

  products.forEach(product => {
    // Verificar se o produto está disponível
    if (!product.is_available) return;

    const card = document.createElement('div');
    // Formatar preço corretamente
    const preco = parseFloat(product.price).toFixed(2).replace('.', ',');
    
    // Estrutura base do card
    const baseHTML = `
      <div>
        <img src="${product.image_url}" alt="${product.name}" class="custom-product">
      </div>
      <div class="product-info">
        <p class="font-bold">${product.name}</p>
        <p class="text-sm">${product.description || ''}</p>
        <div class="product">
          <p>R$ ${preco}</p>
          <button class="btn-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
            <i class="fa fa-cart-plus"></i>
          </button>
        </div>
      </div>
    `;

    // Adicionar ao container apropriado com base na categoria
    if (product.category && product.category.toLowerCase().includes('bebida')) {
      card.className = 'bebida-item';
      card.innerHTML = baseHTML;
      if (bebidasGrid) bebidasGrid.appendChild(card);
    } else if (product.category && product.category.toLowerCase().includes('pizza')) {
      card.className = 'bebida-item';
      card.innerHTML = baseHTML;
      if (pizzaGrid) pizzaGrid.appendChild(card);
    } else {
      card.className = 'product-container';
      card.innerHTML = baseHTML;
      if (hamburguerSection) hamburguerSection.appendChild(card);
    }
  });
  
  // Adicionar os event listeners para os botões de carrinho
  addCartButtonListeners();
}

// Função para adicionar event listeners aos botões de carrinho
function addCartButtonListeners() {
  document.querySelectorAll('.btn-cart').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      const productId = this.getAttribute('data-id');
      const productName = this.getAttribute('data-name');
      const productPrice = this.getAttribute('data-price');
      const productContainer = this.closest('.product-container, .bebida-item');
      const productImg = productContainer.querySelector('img.custom-product').src;
      
      // Criar objeto do produto para o carrinho
      const product = {
        id: productId,
        nome: productName,
        img: productImg,
        preco: productPrice,
        quantidade: 1
      };
      
      // Recuperar carrinho do localStorage
      const carrinhoData = localStorage.getItem('carrinho');
      const carrinho = carrinhoData ? JSON.parse(carrinhoData) : [];
      
      // Verificar se o produto já existe no carrinho
      const existente = carrinho.find(item => item.id == product.id);
      if (existente) {
        existente.quantidade++;
      } else {
        carrinho.push(product);
      }
      
      // Salvar carrinho atualizado
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      
      // Mostrar mensagem de produto adicionado
      showCenterMessage("Produto adicionado ao carrinho!");
    });
  });
}

// Função para exibir mensagem centralizada
function showCenterMessage(msg) {
  let messageDiv = document.getElementById('center-message');
  
  // Criar o elemento se não existir
  if (!messageDiv) {
    messageDiv = document.createElement('div');
    messageDiv.id = 'center-message';
    document.body.appendChild(messageDiv);
    
    // Estilizar o elemento
    Object.assign(messageDiv.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#4CAF50',
      color: '#fff',
      padding: '20px',
      borderRadius: '5px',
      zIndex: '10000',
      textAlign: 'center',
      display: 'none'
    });
  }
  
  // Ajustar tamanho com base na largura da tela
  messageDiv.style.fontSize = window.innerWidth >= 1661 ? '24px' : '16px';
  
  // Mostrar a mensagem com animação e esconder após 2 segundos
  messageDiv.textContent = msg;
  messageDiv.style.display = 'block';
  setTimeout(() => {
    messageDiv.style.opacity = '0';
    setTimeout(() => {
      messageDiv.style.display = 'none';
      messageDiv.style.opacity = '1';
    }, 300);
  }, 2000);
}

// Inicialização e controle da barra de navegação fixa
function initNavbar() {
  // Função para controlar a navbar fixa ao rolar
  function handleScroll() {
    const navbar = document.getElementById('fixed-navbar');
    if (!navbar) return;
    
    const scrollTrigger = 120;
    
    if (window.scrollY > scrollTrigger) {
      navbar.classList.add('active');
    } else {
      navbar.classList.remove('active');
    }
  }
  
  // Adicionar listener de scroll para a navbar fixa
  window.addEventListener('scroll', handleScroll);
  
  // Inicializar a posição da navbar
  handleScroll();
  
  // Inicializar os filtros na navbar se existirem
  initFilterContainer();
}

// Função para inicializar o container de filtros
function initFilterContainer() {
  const $filterContainer = document.querySelector('.filter-container');
  const $originalParent = document.getElementById('filter-placeholder');
  
  if (!$filterContainer || !$originalParent) return;
  
  function updateFilterPosition() {
    const $fixedNavbar = document.getElementById('fixed-navbar');
    
    // Se a largura for menor que 551px, restaura tudo e sai
    if (window.innerWidth < 551) {
      if ($fixedNavbar) $fixedNavbar.classList.remove('active');
      if ($filterContainer.parentElement !== $originalParent) {
        $originalParent.appendChild($filterContainer);
      }
      return;
    }
    
    const $header = document.querySelector('header#all');
    if (!$header) return;
    
    const headerHeight = $header.offsetHeight;
    
    // Se o scroll ultrapassar a altura do header, ativa a navbar
    if (window.scrollY > headerHeight) {
      if ($fixedNavbar) $fixedNavbar.classList.add('active');
      // Mover o filter container para dentro da navbar na área central
      const $navbarCenter = $fixedNavbar ? $fixedNavbar.querySelector('.navbar-center') : null;
      if ($navbarCenter && $filterContainer.parentElement !== $navbarCenter) {
        $navbarCenter.appendChild($filterContainer);
      }
    } else {
      if ($fixedNavbar) $fixedNavbar.classList.remove('active');
      // Retornar o filter container para o local original
      if ($filterContainer.parentElement !== $originalParent) {
        $originalParent.appendChild($filterContainer);
      }
    }
  }

  // Atualiza no scroll e resize
  window.addEventListener('scroll', updateFilterPosition);
  window.addEventListener('resize', updateFilterPosition);
  updateFilterPosition();
}

// Inicialização do menu hamburguer
function setupMenuHamburguer() {
  const menuBtn = document.getElementById('menu-hamburguer-btn');
  if (!menuBtn) return;
  
  menuBtn.addEventListener('click', function() {
    const miniNavbar = document.getElementById('mini-navbar');
    if (miniNavbar) {
      miniNavbar.classList.toggle('active');
    }
  });
}

// Função para adicionar produto e ir para a página de detalhes
function addAndGo(button) {
  const productId = button.getAttribute('data-id');
  const productName = button.getAttribute('data-name');
  const productPrice = button.getAttribute('data-price');
  
  // Salvar produto no localStorage para a página de detalhes
  localStorage.setItem('detalhe', productId);
  
  // Redirecionar para a página de detalhes
  window.location.href = `details.html?id=${productId}&name=${encodeURIComponent(productName)}&price=${encodeURIComponent(productPrice)}`;
}

// Setup de botões para a página de detalhes
function setupDetailButtons() {
  document.querySelectorAll('[onclick*="addAndGo"]').forEach(botao => {
    botao.onclick = function(e) {
      e.preventDefault();
      
      const container = this.closest('.product-container, .bebida-item');
      const nome = container.querySelector('.font-bold').textContent;
      const preco = this.getAttribute('data-price');
      const id = this.getAttribute('data-id');
      const img = container.querySelector('img').src;
      
      // Obter descrição se disponível
      let desc = '';
      const elementoDesc = container.querySelector('.text-sm');
      if (elementoDesc) {
        desc = elementoDesc.textContent.trim();
      }
      
      // Salvar ID para uso na página de detalhes
      localStorage.setItem('detalhe', id);
      
      // Construir URL com parâmetros
      const urlDetalhes = `details.html?id=${id}&name=${encodeURIComponent(nome)}&price=${encodeURIComponent(preco)}&img=${encodeURIComponent(img)}&desc=${encodeURIComponent(desc)}`;
      
      // Redirecionar para a página de detalhes
      window.location.href = urlDetalhes;
    };
  });
}

// Inicialização e controle do slider de promoções
function initPromoSlider() {
  const promoSlider = document.getElementById('promoSlider');
  const promoDots = document.querySelectorAll('.promo-dot');
  
  if (!promoSlider || promoDots.length === 0) {
    console.log('Elementos do slider não encontrados');
    return;
  }
  
  let currentSlide = 0;
  let autoSlideInterval;
  
  function goToSlide(index) {
    if (index >= promoDots.length) index = 0;
    if (index < 0) index = promoDots.length - 1;
    
    currentSlide = index;
    promoSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Atualizar o dot ativo
    promoDots.forEach(dot => dot.classList.remove('active'));
    promoDots[currentSlide].classList.add('active');
    
    // Adicionar classe active ao slide atual
    const promoItems = document.querySelectorAll('.promo-item');
    promoItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === currentSlide);
    });
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 3000); // Troca de slide a cada 3 segundos
  }

  function resetAutoSlideTimer() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  // Configurar eventos de clique nos dots
  promoDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetAutoSlideTimer();
    });
  });
  
  // Tornar os slides clicáveis para redirecionar para produtos
  const promoItems = document.querySelectorAll('.promo-item');
  promoItems.forEach(item => {
    item.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      if (productId) {
        const targetProduct = document.getElementById(productId);
        if (targetProduct) {
          targetProduct.scrollIntoView({behavior: 'smooth'});
        } else {
          console.log(`Produto ${productId} clicado`);
        }
      }
    });
  });

  // Iniciar o slide no primeiro item
  goToSlide(0);
  
  // Iniciar o slider automático
  startAutoSlide();
  
  // Pausar o slider automático quando o mouse estiver sobre ele
  promoSlider.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
  });
  
  // Reiniciar o slider automático quando o mouse sair
  promoSlider.addEventListener('mouseleave', () => {
    startAutoSlide();
  });
}

// Setup de handlers para o modal de informações
function setupModalHandlers() {
  // Abrir modal
  const openModalBtn = document.querySelector('[onclick="openModal()"]');
  if (openModalBtn) {
    openModalBtn.onclick = function(e) {
      e.preventDefault();
      const modal = document.getElementById('infoModal');
      if (modal) modal.style.display = 'block';
    };
  }
  
  // Fechar modal
  const closeModalBtn = document.querySelector('[onclick="closeModal()"]');
  if (closeModalBtn) {
    closeModalBtn.onclick = function(e) {
      e.preventDefault();
      const modal = document.getElementById('infoModal');
      if (modal) modal.style.display = 'none';
    };
  }
  
  // Fechar modal ao clicar fora
  window.onclick = function(event) {
    const modal = document.getElementById('infoModal');
    if (modal && event.target === modal) {
      modal.style.display = 'none';
    }
  };
  
  // Funções para as abas do modal
  document.querySelectorAll('[onclick*="openTab"]').forEach(tabBtn => {
    tabBtn.onclick = function(e) {
      e.preventDefault();
      const tabName = this.getAttribute('data-tab');
      if (!tabName) return;
      
      // Esconde todos os conteúdos das abas
      const tabContents = document.getElementsByClassName('tab-content');
      for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
      }
      
      // Remove a classe ativa de todos os botões
      const tabButtons = document.getElementsByClassName('tab-button');
      for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
      }
      
      // Ativa a aba selecionada e seu botão
      const selectedTab = document.getElementById(tabName);
      if (selectedTab) selectedTab.classList.add('active');
      this.classList.add('active');
    };
  });
}

// Função para navegar para trás com suporte a iframe
function goBack() {
  if (window.parent !== window) {
    // Se estiver em um iframe, envia mensagem para o pai fechar o iframe
    window.parent.postMessage('closeDetails', '*');
  } else {
    // Caso contrário, volta na navegação
    history.back();
  }
}

// Função para abrir detalhes do produto
function openProductDetails(id, name, price) {
  // Se estiver em iframe, enviar mensagem para o pai
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'openProduct',
      id: id,
      name: name,
      price: price
    }, '*');
  } else {
    // Redirecionar na mesma página
    window.location.href = `details.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}`;
  }
}

// Configuração para a página de detalhes do produto
function loadProductDetails() {
  // Obter ID do produto do localStorage ou URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || localStorage.getItem('detalhe');
  
  if (!productId) {
    console.error('ID do produto não encontrado');
    return;
  }
  
  // Buscar detalhes do produto da API
  fetch(`http://localhost:3000/api/products/${productId}`)
    .then(response => {
      if (!response.ok) throw new Error('Produto não encontrado');
      return response.json();
    })
    .then(product => {
      displayProductDetails(product);
    })
    .catch(error => {
      console.error('Erro ao carregar detalhes do produto:', error);
      // Tentar carregar do localStorage como fallback
      loadProductFromLocalStorage(productId);
    });
    
  // Receber mensagens do iframe pai se necessário
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'productData') {
      const data = event.data;
      const product = {
        id: data.id,
        name: data.name,
        price: parseFloat(data.price),
        description: data.description,
        image_url: data.image,
        ingredients: data.ingredients
      };
      displayProductDetails(product);
    }
  });
}

// Função para carregar detalhes do produto do localStorage (fallback)
function loadProductFromLocalStorage(productId) {
  // Tentar usar dados salvos no localStorage como fallback
  const products = JSON.parse(localStorage.getItem('product')) || [];
  const product = products.find(p => p.id == productId);
  
  if (product) {
    displayProductDetails({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image_url: null // URL da imagem pode não estar disponível
    });
  } else {
    // Fallback para usar parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name');
    const price = urlParams.get('price');
    const img = urlParams.get('img');
    const desc = urlParams.get('desc');
    
    if (name && price) {
      displayProductDetails({
        id: productId,
        name: name,
        price: price,
        description: desc || '',
        image_url: img || null
      });
    } else {
      document.getElementById('detalhe-content').innerHTML = "<p>Detalhes não encontrados.</p>";
    }
  }
}

// Exibir detalhes do produto na interface
function displayProductDetails(product) {
  const detailContainer = document.getElementById('detalhe-content');
  if (!detailContainer) return;
  
  const preco = parseFloat(product.price).toFixed(2).replace('.', ',');
  
  let html = `
    <h2>${product.name}</h2>
    <p>Preço: R$ ${preco}</p>
    <p>${product.description || ''}</p>
  `;
  
  // Adicionar imagem se disponível
  if (product.image_url) {
    html = `
      <div class="product-image">
        <img src="${product.image_url}" alt="${product.name}">
      </div>
      ${html}
    `;
  }
  
  // Adicionar botão de adicionar ao carrinho
  html += `
    <div class="product-actions">
      <button class="btn-cart" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
        Adicionar ao Carrinho
      </button>
    </div>
  `;
  
  detailContainer.innerHTML = html;
  
  // Adicionar event listener para o botão de adicionar ao carrinho
  const addButton = detailContainer.querySelector('.btn-cart');
  if (addButton) {
    addButton.addEventListener('click', function() {
      const productObj = {
        id: this.getAttribute('data-id'),
        nome: this.getAttribute('data-name'),
        preco: this.getAttribute('data-price'),
        img: product.image_url || '',
        quantidade: 1
      };
      
      // Adicionar ao carrinho
      const carrinhoData = localStorage.getItem('carrinho');
      const carrinho = carrinhoData ? JSON.parse(carrinhoData) : [];
      
      const existente = carrinho.find(item => item.id == productObj.id);
      if (existente) {
        existente.quantidade++;
      } else {
        carrinho.push(productObj);
      }
      
      localStorage.setItem('carrinho', JSON.stringify(carrinho));
      showCenterMessage("Produto adicionado ao carrinho!");
    });
  }
}

// Configurações para a página do carrinho
function initCartPage() {
  displayCartItems();
  setupCartEventListeners();
}

// Exibir itens do carrinho
function displayCartItems() {
  const cartContainer = document.getElementById('cart-items');
  if (!cartContainer) return;
  
  const carrinhoData = localStorage.getItem('carrinho');
  const carrinho = carrinhoData ? JSON.parse(carrinhoData) : [];
  
  if (carrinho.length === 0) {
    cartContainer.innerHTML = '<p>Seu carrinho está vazio</p>';
    updateCartTotal(0);
    return;
  }
  
  let html = '';
  carrinho.forEach(item => {
    const itemTotal = parseFloat(item.preco) * item.quantidade;
    html += `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-image">
          <img src="${item.img}" alt="${item.nome}">
        </div>
        <div class="cart-item-details">
          <h3>${item.nome}</h3>
          <p>R$ ${parseFloat(item.preco).toFixed(2).replace('.', ',')}</p>
          <div class="quantity-control">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span class="quantity">${item.quantidade}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
          </div>
        </div>
        <div class="cart-item-total">
          <p>R$ ${itemTotal.toFixed(2).replace('.', ',')}</p>
          <button class="remove-btn" data-id="${item.id}">Remover</button>
        </div>
      </div>
    `;
  });
  
  cartContainer.innerHTML = html;
  
  // Calcular e exibir o total
  const total = carrinho.reduce((sum, item) => sum + (parseFloat(item.preco) * item.quantidade), 0);
  updateCartTotal(total);
}

// Atualizar o total do carrinho
function updateCartTotal(total) {
  const totalElement = document.getElementById('cart-total');
  if (totalElement) {
    totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
}

// Configurar event listeners para o carrinho
function setupCartEventListeners() {
  // Handler para o botão de aumentar quantidade
  document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      updateItemQuantity(id, 1);
    });
  });
  
  // Handler para o botão de diminuir quantidade
  document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      updateItemQuantity(id, -1);
    });
  });
  
  // Handler para o botão de remover item
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      removeCartItem(id);
    });
  });
  
  // Handler para o botão de finalizar compra
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      // Redirecionar para a página de checkout ou abrir modal de checkout
      // window.location.href = 'checkout.html';
      alert('Funcionalidade de checkout em desenvolvimento');
    });
  }
}

// Atualizar quantidade de um item no carrinho
function updateItemQuantity(id, change) {
  const carrinhoData = localStorage.getItem('carrinho');
  if (!carrinhoData) return;
  
  const carrinho = JSON.parse(carrinhoData);
  const index = carrinho.findIndex(item => item.id == id);
  
  if (index === -1) return;
  
  carrinho[index].quantidade += change;
  
  // Se a quantidade for menor ou igual a zero, remover o item
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  displayCartItems(); // Atualizar a interface
  showCenterMessage("Carrinho atualizado!");
}

// Remover item do carrinho
function removeCartItem(id) {
  const carrinhoData = localStorage.getItem('carrinho');
  if (!carrinhoData) return;
  
  const carrinho = JSON.parse(carrinhoData);
  const newCarrinho = carrinho.filter(item => item.id != id);
  
  localStorage.setItem('carrinho', JSON.stringify(newCarrinho));
  displayCartItems(); // Atualizar a interface
  showCenterMessage("Item removido do carrinho!");
}

// Iniciar as páginas específicas com base na URL atual
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname;
  
  // Inicializar funções gerais para todas as páginas
  initNavbar();
  setupMenuHamburguer();
  setupModalHandlers();
  
  // Inicializar funções específicas para cada página
  if (currentPage.includes('details.html')) {
    loadProductDetails();
  } else if (currentPage.includes('carrinho.html') || currentPage.includes('cart.html')) {
    initCartPage();
  } else {
    // Página principal
    fetchProducts();
    initPromoSlider();
    setupDetailButtons();
  }
});