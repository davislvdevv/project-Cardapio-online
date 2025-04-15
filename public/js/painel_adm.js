document.addEventListener('DOMContentLoaded', function () {
  setupNavigation();
  setupMobileMenu();
  setupModals();
  initializeDashboard();
});

// ======== Navegação lateral ========
function setupNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const contentAreas = document.querySelectorAll('.content');

  sidebarItems.forEach(item => {
    item.addEventListener('click', function () {
      sidebarItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      contentAreas.forEach(area => area.classList.remove('active'));
      const targetId = this.getAttribute('data-target');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
      if (window.innerWidth <= 768) {
        document.querySelector('.sidebar').classList.remove('open');
      }
    });
  });
}

// ======== Menu Mobile ========
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', function (event) {
    if (
      window.innerWidth <= 768 &&
      !sidebar.contains(event.target) &&
      !menuToggle.contains(event.target) &&
      sidebar.classList.contains('open')
    ) {
      sidebar.classList.remove('open');
    }
  });
}

// ======== Modais (genérico) ========
function setupModals() {
  const modalOpenButtons = document.querySelectorAll('[data-modal-target]');
  const modalCloseButtons = document.querySelectorAll('.modal-close');
  const modals = document.querySelectorAll('.modal');

  modalOpenButtons.forEach(button => {
    button.addEventListener('click', function () {
      const modalId = this.getAttribute('data-modal-target');
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = 'block';
    });
  });

  modalCloseButtons.forEach(button => {
    button.addEventListener('click', function () {
      const modal = this.closest('.modal');
      if (modal) modal.style.display = 'none';
    });
  });

  modals.forEach(modal => {
    modal.addEventListener('click', function (event) {
      if (event.target === this) modal.style.display = 'none';
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      modals.forEach(modal => (modal.style.display = 'none'));
    }
  });
}

// ======== Dashboard (inicialização) ========
function initializeDashboard() {
  initCharts();
  loadProducts();
  loadEstoque();
  setupTables();
  setupForms();
  initializeMesas();
  loadPedidos();
}

// ======== Gráficos (simulados) ========
function initCharts() {
  const salesData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    values: [12500, 14800, 13200, 15600, 16200, 17800]
  };

  const productData = {
    labels: ['X-Burger', 'X-Salada', 'X-Bacon', 'X-Tudo', 'Batata Frita', 'Refrigerante'],
    values: [324, 287, 246, 198, 312, 402]
  };

  console.log('Charts initialized with sample data:', { salesData, productData });
}

// ============= PRODUTOS =============

document.addEventListener('DOMContentLoaded', function () {
  setupModals();
  loadProducts();
});

const apiBase = 'http://localhost:3000/api';
const productsContainer = document.getElementById('products-container');
const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');

// Abrir/fechar modal
function openModal(modal) {
  modal.classList.add('active');
}
function closeModal(modal) {
  modal.classList.remove('active');
}

// ============ CRUD ============
function loadProducts() {
  fetch(`${apiBase}/products`)
    .then(res => res.ok ? res.json() : Promise.reject('Erro na API'))
    .then(renderProducts)
    .catch(err => console.error('Erro ao buscar produtos:', err));
}

function renderProducts(products) {
  productsContainer.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img"><img src="${product.image_url}" alt="${product.name}"></div>
      <div class="product-info">
        <h4 class="product-title">${product.name}</h4>
        <div class="product-category">${product.category}</div>
        <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-actions">
          <label class="switch">
            <input type="checkbox" ${product.is_available ? 'checked' : ''} onchange="toggleProductStatus(${product.id}, this.checked)">
            <span class="slider"></span>
          </label>
          <button class="btn-icon btn-edit" onclick="openEditModal(${product.id})"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    productsContainer.appendChild(card);
  });
}

function saveNewProduct() {
  const data = {
    name: document.getElementById('product-name').value.trim(),
    category: document.getElementById('product-category').value,
    price: parseFloat(document.getElementById('product-price').value.replace(',', '.')),
    description: document.getElementById('product-description').value.trim(),
    image_url: 'https://via.placeholder.com/200x150',
    is_available: true
  };

  fetch(`${apiBase}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(() => {
      alert('Produto adicionado com sucesso!');
      closeModal(addModal);
      loadProducts();
    })
    .catch(err => alert('Erro ao adicionar produto.'));
}

function openEditModal(id) {
  fetch(`${apiBase}/products/${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById('edit-product-id').value = product.id;
      document.getElementById('edit-product-name').value = product.name;
      document.getElementById('edit-product-category').value = product.category;
      document.getElementById('edit-product-price').value = product.price.toFixed(2).replace('.', ',');
      document.getElementById('edit-product-description').value = product.description;
      openModal(editModal);
    });
}

function updateProduct() {
  const id = document.getElementById('edit-product-id').value;
  const data = {
    name: document.getElementById('edit-product-name').value.trim(),
    category: document.getElementById('edit-product-category').value,
    price: parseFloat(document.getElementById('edit-product-price').value.replace(',', '.')),
    description: document.getElementById('edit-product-description').value.trim()
  };

  fetch(`${apiBase}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(() => {
      alert('Produto atualizado!');
      closeModal(editModal);
      loadProducts();
    })
    .catch(() => alert('Erro ao atualizar.'));
}

function deleteProduct(id) {
  if (!confirm('Deseja realmente excluir este produto?')) return;
  fetch(`${apiBase}/products/${id}`, { method: 'DELETE' })
    .then(() => loadProducts())
    .catch(() => alert('Erro ao excluir produto.'));
}

function toggleProductStatus(id, isAvailable) {
  fetch(`${apiBase}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_available: isAvailable })
  });
}

// Modal setup
function setupModals() {
  document.getElementById('add-product-btn').addEventListener('click', () => openModal(addModal));
  document.getElementById('save-product-btn').addEventListener('click', saveNewProduct);
  document.getElementById('update-product-btn').addEventListener('click', updateProduct);

  document.querySelectorAll('.modal-close').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')))
  );
  document.querySelectorAll('.modal-cancel').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')))
  );
}