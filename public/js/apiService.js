// apiService.js
const API = {
    products: {
      // Buscar todos os produtos
      getAll: async function() {
        // Simulação - Substitua por chamada real à sua API
        // Ou mantenha assim se seus produtos forem estáticos
        return [
          { id: 1, name: 'X-Burger', price: 15.90, image_url: 'img/xburger.jpg' },
          { id: 2, name: 'X-Salada', price: 17.90, image_url: 'img/xsalada.jpg' },
          // Adicione mais produtos conforme necessário
        ];
      },
      
      // Buscar produto por ID
      getById: async function(id) {
        try {
          // Primeiro tenta buscar todos os produtos
          const allProducts = await this.getAll();
          // Depois filtra pelo ID
          const product = allProducts.find(p => p.id == id);
          
          if (!product) {
            throw new Error('Produto não encontrado');
          }
          
          return product;
        } catch (error) {
          console.error('Erro ao buscar produto:', error);
          throw error;
        }
      }
    },
    
    cart: {
      // Adicionar ao carrinho (usando localStorage)
      addToCart: function(product) {
        try {
          // Buscar carrinho atual
          const cart = this.getCart();
          
          // Verificar se o produto já está no carrinho
          const existingProduct = cart.find(item => item.id == product.id);
          
          if (existingProduct) {
            // Aumentar quantidade
            existingProduct.quantidade += product.quantidade || 1;
          } else {
            // Adicionar novo produto
            cart.push(product);
          }
          
          // Salvar carrinho
          localStorage.setItem('cart', JSON.stringify(cart));
          
          return { 
            success: true, 
            message: 'Produto adicionado ao carrinho!' 
          };
        } catch (error) {
          console.error('Erro ao adicionar ao carrinho:', error);
          return { 
            success: false, 
            message: 'Erro ao adicionar ao carrinho' 
          };
        }
      },
      
      // Obter itens do carrinho
      getCart: function() {
        const cart = localStorage.getItem('cart');
        return cart ? JSON.parse(cart) : [];
      },
      
      // Remover item do carrinho
      removeFromCart: function(productId) {
        try {
          let cart = this.getCart();
          cart = cart.filter(item => item.id != productId);
          localStorage.setItem('cart', JSON.stringify(cart));
          
          return { 
            success: true, 
            message: 'Item removido do carrinho!' 
          };
        } catch (error) {
          console.error('Erro ao remover item:', error);
          return { 
            success: false, 
            message: 'Erro ao remover item do carrinho' 
          };
        }
      },
      
      // Atualizar quantidade
      updateQuantity: function(productId, quantity) {
        try {
          const cart = this.getCart();
          const product = cart.find(item => item.id == productId);
          
          if (product) {
            product.quantidade = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            return { 
              success: true, 
              message: 'Quantidade atualizada!' 
            };
          }
          
          return { 
            success: false, 
            message: 'Produto não encontrado no carrinho' 
          };
        } catch (error) {
          console.error('Erro ao atualizar quantidade:', error);
          return { 
            success: false, 
            message: 'Erro ao atualizar quantidade' 
          };
        }
      },
      
      // Finalizar pedido e salvar histórico
      finalizarPedido: async function(dadosCliente) {
        try {
          const cart = this.getCart();
          
          if (cart.length === 0) {
            return {
              success: false,
              message: 'Carrinho vazio!'
            };
          }
          
          // Criar objeto de pedido com dados do cliente e itens
          const pedido = {
            id: Date.now(), // ID único baseado no timestamp
            data: new Date().toISOString(),
            cliente: dadosCliente,
            itens: cart,
            total: cart.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
          };
          
          // Salvar no histórico (localStorage)
          const historico = this.getHistorico();
          historico.push(pedido);
          localStorage.setItem('historico_pedidos', JSON.stringify(historico));
          
          // Limpar carrinho após finalizar
          localStorage.removeItem('cart');
          
          // Aqui você poderia enviar para sua API real
           await fetch('/api/pedidos', {
             method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pedido)
          });
          
          return {
            success: true,
            message: 'Pedido finalizado com sucesso!',
            pedidoId: pedido.id
          };
        } catch (error) {
          console.error('Erro ao finalizar pedido:', error);
          return {
            success: false,
            message: 'Erro ao finalizar pedido'
          };
        }
      },
      
      // Obter histórico de pedidos
      getHistorico: function() {
        const historico = localStorage.getItem('historico_pedidos');
        return historico ? JSON.parse(historico) : [];
      }
    }
  };
  
  // Exportar para uso em outros arquivos
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
  } else {
    window.API = API;
  }