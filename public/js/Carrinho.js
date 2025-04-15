$(document).ready(function() {

    // Recupera os dados armazenados (em formato JSON)
    var carrinhoData = localStorage.getItem('carrinho');
    var carrinho = carrinhoData ? JSON.parse(carrinhoData) : [];

    // Função para atualizar o subtotal
    function updateSubtotal() {
        var subtotal = 0;
        var carrinhoData = localStorage.getItem('carrinho');
        var carrinhoAtual = carrinhoData ? JSON.parse(carrinhoData) : [];
        carrinhoAtual.forEach(function(produto) {
            subtotal += parseFloat(produto.preco) * produto.quantidade;
        });
        $('#subtotal').text(subtotal.toFixed(2));
    }

    // Função para exibir notificação (por exemplo, "Item removido")
    function showNotification(msg) {
        var notification = $("#notification");
        if(notification.length === 0) {
            notification = $("<div id='notification'></div>");
            $("body").append(notification);
            notification.css({
                position: "fixed",
                top: "10px",
                right: "10px",
                background: "#4CAF50",
                color: "#fff",
                padding: "10px",
                "border-radius": "5px",
                "z-index": "9999",
                display: "none"
            });
        }
        notification.text(msg).fadeIn(300).delay(2000).fadeOut(300);
    }

    // Função que renderiza os itens (ou o GIF com mensagem, se o carrinho estiver vazio)
    function renderCarrinho() {
        $('.listacarrinho').empty();
        if(carrinho.length > 0) {
            carrinho.forEach(function(produto) {
                var itemHTML = ''
                    + '<div class="item-carrinho" data-id="' + produto.id + '">'
                        + '<div class="area-img">'
                            + '<img src="' + produto.img + '" alt="'+ produto.nome +'">'
                        + '</div>'
                        + '<div class="area-details">'
                            + '<div class="sup">'
                                + '<span class="name-prod">'+ produto.nome +'</span>'
                                + '<a class="delete-item" href="#" data-id="'+ produto.id +'">'
                                    + '<i class="ri-close-line"></i>'
                                + '</a>'
                            + '</div>'
                            + '<div class="middle">'
                                + '<span>' + (produto.descricao || "") + '</span>'
                            + '</div>'
                            + '<div class="preco-quantidade">'
                                + '<span>' + produto.preco + '</span>'
                                + '<div class="quantity-container">'
                                    + '<button class="btn-minus" onclick="decreaseQuantity(this)">-</button>'
                                    + '<input type="number" class="quantity-input" value="' + produto.quantidade + '" min="1" readonly>'
                                    + '<button class="btn-plus" onclick="increaseQuantity(this)">+</button>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                    + '</div>';
                $('.listacarrinho').append(itemHTML);
            });
        } else {
            // Se não houver itens, insere o GIF com a mensagem
            $('.listacarrinho').html(
                '<div class="empty-cart">' +
                  '<img src="/public/imagens/empty.gif" width="300" alt="Carrinho vazio">' +
                  '<br>' +
                  '<span>nada por enquanto</span>' +
                '</div>'
            );
        }
        updateSubtotal(); // Atualiza o subtotal sempre após renderizar
    }

    // Renderiza o carrinho na carga inicial
    renderCarrinho();

    // Função para aumentar a quantidade de um produto
    window.increaseQuantity = function(button) {
        var itemContainer = $(button).closest('.item-carrinho');
        var productId = itemContainer.data('id');
        var carrinhoData = localStorage.getItem('carrinho');
        var carrinhoAtual = carrinhoData ? JSON.parse(carrinhoData) : [];
        
        var produto = carrinhoAtual.find(function(item) {
            return item.id == productId;
        });
        
        if (produto) {
            produto.quantidade++;
            localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
            itemContainer.find('.quantity-input').val(produto.quantidade);
            updateSubtotal();
        }
    };

    // Função para diminuir a quantidade de um produto (garante quantidade mínima de 1)
    window.decreaseQuantity = function(button) {
        var itemContainer = $(button).closest('.item-carrinho');
        var productId = itemContainer.data('id');
        var carrinhoData = localStorage.getItem('carrinho');
        var carrinhoAtual = carrinhoData ? JSON.parse(carrinhoData) : [];
        
        var produto = carrinhoAtual.find(function(item) {
            return item.id == productId;
        });
        
        if (produto && produto.quantidade > 1) {
            produto.quantidade--;
            localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));
            itemContainer.find('.quantity-input').val(produto.quantidade);
            updateSubtotal();
        }
    };

    // Delegação de evento para remoção do item
    function showConfirmModal(message, onConfirm, onCancel) {
        var modal = $('#confirm-modal');
        if (modal.length === 0) {
            modal = $('<div id="confirm-modal"></div>');
            // Estilos para o container do modal
            modal.css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'z-index': 9999,
                display: 'none'
            });
            // Cria o conteúdo do modal
            var content = $('<div class="confirm-content"></div>');
            content.css({
                background: '#fff',
                padding: '20px',
                'border-radius': '5px',
                'text-align': 'center',
                width: '300px'
            });
            modal.append(
                $('<div class="confirm-content"></div>').css({
                    background: '#fff',
                    padding: '20px',
                    'border-radius': '5px',
                    'text-align': 'center',
                    width: '300px'
                })
            );
            $('body').append(modal);
            
            // Para exibir o modal centralizado
            $('#confirm-modal').css('display', 'flex');
        }
        
        // Atualiza o conteúdo do modal
        $('#confirm-modal .confirm-content').html(
            message + '<br><br>' +
            '<button id="confirm-yes">Sim</button> ' +
            '<button id="confirm-no">Não</button>'
        );
        
        // Mostra o modal
        $('#confirm-modal').show();
        
        // Define os eventos para os botões do modal
        $('#confirm-yes').off('click').on('click', function() {
            $('#confirm-modal').hide();
            if (typeof onConfirm === "function") {
                onConfirm();
            }
        });
        $('#confirm-no').off('click').on('click', function() {
            $('#confirm-modal').hide();
            if (typeof onCancel === "function") {
                onCancel();
            }
        });
    }
    // Delegação de evento para remoção do item com modal de confirmação
    $(document).on('click', '.delete-item', function(e) {
        e.preventDefault();
        var productId = $(this).data('id');
        showConfirmModal("Deseja remover o item?", function() {
            // Callback se confirmar
            carrinho = carrinho.filter(function(item) {
                return item.id != productId;
            });
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            renderCarrinho();
            showNotification("Item removido");
        }, function() {
            // Callback se cancelar (não faz nada)
        });
    });

});