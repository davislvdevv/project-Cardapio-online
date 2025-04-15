 // Size selection
 const sizeOptions = document.querySelectorAll('.size-option');
 const priceDisplay = document.getElementById('totalPrice');
 let basePrice = 29.90; // Default to Grande size price
 let quantity = 1;
 
 sizeOptions.forEach(option => {
     option.addEventListener('click', () => {
         // Remove active class from all options
         sizeOptions.forEach(opt => opt.classList.remove('active'));
         // Add active to clicked option
         option.classList.add('active');
         
         // Update price based on selected size
         const sizePrice = parseFloat(option.querySelector('.size-price').textContent
             .replace('R$ ', '').replace(',', '.'));
         basePrice = sizePrice;
         updateTotalPrice();
     });
 });
 
 // Quantity controls
 const decreaseBtn = document.getElementById('decreaseBtn');
 const increaseBtn = document.getElementById('increaseBtn');
 const quantityValue = document.getElementById('quantityValue');
 
 decreaseBtn.addEventListener('click', () => {
     if (quantity > 1) {
         quantity--;
         quantityValue.textContent = quantity;
         updateTotalPrice();
     }
 });
 
 increaseBtn.addEventListener('click', () => {
     quantity++;
     quantityValue.textContent = quantity;
     updateTotalPrice();
 });
 
 // Add-ons calculation
 const addonCheckboxes = document.querySelectorAll('.addon-checkbox');
 let addonsTotal = 0;
 
 addonCheckboxes.forEach(checkbox => {
     checkbox.addEventListener('change', () => {
         const addonPrice = parseFloat(checkbox.closest('.addon-item')
             .querySelector('.addon-price').textContent
             .replace('+ R$ ', '').replace(',', '.'));
         
         if (checkbox.checked) {
             addonsTotal += addonPrice;
         } else {
             addonsTotal -= addonPrice;
         }
         
         updateTotalPrice();
     });
 });
 
 // Update total price function
 function updateTotalPrice() {
     const total = (basePrice + addonsTotal) * quantity;
     priceDisplay.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
 }
 
 // Initialize with default size (Grande) active
 document.querySelector('.size-option.active').click();

// details.js - Manipula a exibição de detalhes do produto
document.addEventListener('DOMContentLoaded', function() {
    // Obter informações do produto a partir dos parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const nomeProduto = urlParams.get('name') || 'Produto não encontrado';
    const precoProduto = urlParams.get('price') || '0.00';
    const imagemProduto = urlParams.get('img') || 'imagens/default-product.png';
    const descricaoProduto = urlParams.get('desc') || 'Sem descrição disponível';
    
    // Formatar o preço corretamente (com R$ e vírgula para decimal)
    const precoFormatado = `R$ ${parseFloat(precoProduto).toFixed(2).replace('.', ',')}`;
    
    // Definir os detalhes do produto
    document.querySelector('.product-title').textContent = nomeProduto;
    document.querySelector('.current-price').textContent = precoFormatado;
    document.querySelector('.product-image').src = imagemProduto;
    document.querySelector('.product-description').textContent = descricaoProduto;
    
    // Atualizar título da página
    document.title = `Dev Burguer - ${nomeProduto}`;
    
    // Atualizar preço total inicialmente
    document.getElementById('totalPrice').textContent = precoFormatado;
    
    // Manipular mudanças de quantidade
    let quantidade = 1;
    const valorQuantidade = document.getElementById('quantityValue');
    const precoTotal = document.getElementById('totalPrice');
    const precoBase = parseFloat(precoProduto);
    
    // Manipulação das opções de tamanho
    const opcoesTamanho = document.querySelectorAll('.size-option');
    let tamanhoSelecionado = 'Grande'; // Padrão
    let multiplicadorTamanho = 1.2;    // Padrão é Grande (1.2x do preço base)
    
    opcoesTamanho.forEach(opcao => {
        opcao.addEventListener('click', function() {
            // Remover classe ativa de todas as opções
            opcoesTamanho.forEach(opt => opt.classList.remove('active'));
            
            // Adicionar classe ativa à opção selecionada
            this.classList.add('active');
            
            // Atualizar tamanho selecionado
            tamanhoSelecionado = this.querySelector('.size-name').textContent;
            
            // Definir multiplicador de preço com base no tamanho
            if (tamanhoSelecionado === 'Médio') {
                multiplicadorTamanho = 1.0;
            } else if (tamanhoSelecionado === 'Grande') {
                multiplicadorTamanho = 1.2;
            } else if (tamanhoSelecionado === 'Família') {
                multiplicadorTamanho = 1.6;
            }
            
            // Atualizar preço
            atualizarPrecoTotal();
        });
    });
    
    // Manipulação dos complementos
    const checkboxesComplementos = document.querySelectorAll('.addon-checkbox');
    let complementos = [];
    
    checkboxesComplementos.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const nomeComplemento = this.nextElementSibling.textContent;
            const precoComplemento = parseFloat(this.parentElement.nextElementSibling.textContent
                .replace('+ R$ ', '')
                .replace(',', '.')
            );
            
            if (this.checked) {
                complementos.push({ nome: nomeComplemento, preco: precoComplemento });
            } else {
                complementos = complementos.filter(complemento => complemento.nome !== nomeComplemento);
            }
            
            atualizarPrecoTotal();
        });
    });
    
    // Botões de quantidade
    document.getElementById('decreaseBtn').addEventListener('click', function() {
        if (quantidade > 1) {
            quantidade--;
            valorQuantidade.textContent = quantidade;
            atualizarPrecoTotal();
        }
    });
    
    document.getElementById('increaseBtn').addEventListener('click', function() {
        quantidade++;
        valorQuantidade.textContent = quantidade;
        atualizarPrecoTotal();
    });
    
    // Atualizar preço total com base na quantidade, tamanho e complementos
    function atualizarPrecoTotal() {
        let totalComplementos = 0;
        complementos.forEach(complemento => {
            totalComplementos += complemento.preco;
        });
        
        const precoTamanho = precoBase * multiplicadorTamanho;
        const total = (precoTamanho + totalComplementos) * quantidade;
        
        precoTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
    
    // Manipulador do botão adicionar ao carrinho
    document.querySelector('.add-to-cart-btn').addEventListener('click', function() {
        // Criar objeto de item do carrinho
        const itemCarrinho = {
            nome: nomeProduto,
            preco: precoBase,
            imagem: imagemProduto,
            quantidade: quantidade,
            tamanho: tamanhoSelecionado,
            complementos: complementos,
            precoTotal: parseFloat(precoTotal.textContent.replace('R$ ', '').replace(',', '.'))
        };
        
        // Obter carrinho existente ou criar um novo
        let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        
        // Adicionar item ao carrinho
        carrinho.push(itemCarrinho);
        
        // Salvar carrinho no localStorage
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        
        // Redirecionar para página do carrinho ou mostrar confirmação
        alert('Produto adicionado ao carrinho!');
        window.location.href = 'carrinho.html';
    });
});
 

// Adicione esta função no arquivo da sua página principal
function openProductDetailsInIframe(id, name, price, description, image) {
  // Verifica se já existe um iframe e remove
  const existingFrame = document.getElementById('productDetailsFrame');
  if (existingFrame) {
    existingFrame.remove();
  }
  
  // Salvar dados do produto selecionado no localStorage para uso pelo iframe
  const productData = {
    id: id,
    name: name,
    price: price,
    description: description || 'Descrição do produto não disponível.',
    image: image || '/api/placeholder/400/300'
  };
  localStorage.setItem('selectedProduct', JSON.stringify(productData));
  
  // Criar container para o iframe
  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'productDetailsContainer';
  iframeContainer.style.position = 'fixed';
  iframeContainer.style.top = '10%';
  iframeContainer.style.left = '10%';
  iframeContainer.style.width = '80%';
  iframeContainer.style.height = '80%';
  iframeContainer.style.zIndex = '1000';
  iframeContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
  iframeContainer.style.borderRadius = '10px';
  iframeContainer.style.overflow = 'hidden';
  
  // Criar iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'productDetailsFrame';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.src = `dynamic-product-details.html?id=${id}&name=${encodeURIComponent(name)}&price=${price}`;
  
  // Adicionar iframe ao container
  iframeContainer.appendChild(iframe);
  
  // Adicionar container ao body
  document.body.appendChild(iframeContainer);
  
  // Adicionar listener para mensagens do iframe
  window.addEventListener('message', handleIframeMessages);
}

// Função para lidar com mensagens do iframe
function handleIframeMessages(event) {
  // Se a mensagem for para fechar o iframe
  if (event.data === 'closeDetails') {
    const container = document.getElementById('productDetailsContainer');
    if (container) {
      container.remove();
    }
    // Remover o listener após fechar
    window.removeEventListener('message', handleIframeMessages);
  }
  
  // Se a mensagem for para abrir outro produto
  if (event.data && event.data.type === 'openProduct') {
    openProductDetailsInIframe(
      event.data.id,
      event.data.name,
      event.data.price
    );
  }
}

// Modificar os links de produtos na página principal para usar esta função
// Exemplo:
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', function() {
    const id = this.getAttribute('data-id');
    const name = this.getAttribute('data-name');
    const price = this.getAttribute('data-price');
    const description = this.getAttribute('data-description');
    const image = this.getAttribute('data-image');
    
    openProductDetailsInIframe(id, name, price, description, image);
  });
});
