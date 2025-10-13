// Espera a que todo el contenido del DOM se cargue antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {
    // Intenta cargar el carrito desde sessionStorage. Si no existe, inicializa un array vacío.
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

    // Selecciona todos los botones de "Añadir al carrito".
    const addToCartButtons = document.querySelectorAll('.btn-agregar');
    
    // Selecciona los elementos del DOM donde se mostrará el carrito y el total.
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalContainer = document.getElementById('cart-total');
    const cartCounter = document.getElementById('cart-counter');
    const clearCartButton = document.getElementById('clear-cart-button');

    // Agrega un evento de clic a cada botón "Añadir al carrito".
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // Encuentra la tarjeta del producto más cercana al botón que se hizo clic.
            const productCard = event.target.closest('.card');
            
            // Extrae la información del producto de la tarjeta.
            const productId = productCard.querySelector('h3').textContent; // Usamos el nombre como ID único
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.precio').textContent.replace('$', '').replace(' MXN', ''));
            const productImage = productCard.querySelector('img').src;
            
            // Llama a la función para añadir el producto al carrito.
            addToCart(productId, productName, productPrice, productImage);
        });
    });

    /**
     * Añade un producto al carrito o incrementa su cantidad si ya existe.
     * @param {string} productId - El ID único del producto.
     * @param {string} productName - El nombre del producto.
     * @param {number} productPrice - El precio del producto.
     * @param {string} productImage - La URL de la imagen del producto.
     */
    function addToCart(productId, productName, productPrice, productImage) {
        // Busca si el producto ya está en el carrito.
        const existingProduct = cart.find(item => item.id === productId);

        if (existingProduct) {
            // Si existe, incrementa la cantidad.
            existingProduct.quantity++;
        } else {
            // Si no existe, lo añade al carrito con cantidad 1.
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        // Muestra una notificación.
        showToast(`${productName} se ha añadido al carrito.`);
        
        // Guarda el carrito actualizado y renderiza los cambios.
        saveAndRenderCart();
    }

    /**
     * Renderiza los elementos del carrito en el offcanvas (sidebar).
     */
    function renderCart() {
        // Limpia el contenedor de los items del carrito.
        cartItemsContainer.innerHTML = '';
        
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                // Crea el HTML para cada item en el carrito.
                const cartItemHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain;">
                        <div class="flex-grow-1 mx-2">
                            <small>${item.name}</small><br>
                            <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-secondary me-2 btn-decrease" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="btn btn-sm btn-secondary ms-2 btn-increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                `;
                cartItemsContainer.innerHTML += cartItemHTML;
                total += item.price * item.quantity;
            });
        }
        
        // Actualiza el total y el contador del carrito.
        cartTotalContainer.textContent = total.toFixed(2);
        updateCartCounter();
    }

    /**
     * Actualiza el contador de items en el ícono del carrito en la barra de navegación.
     */
    function updateCartCounter() {
        // Suma la cantidad total de todos los productos en el carrito.
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCounter.textContent = totalItems;
        // Muestra u oculta el contador si hay items o no.
        cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    
    /**
     * Guarda el estado actual del carrito en sessionStorage y actualiza la vista.
     */
    function saveAndRenderCart() {
        sessionStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    /**
     * Muestra una notificación flotante (Toast) de Bootstrap.
     * @param {string} message - El mensaje a mostrar.
     */
    function showToast(message) {
        const toastContainer = document.getElementById('toast-container');
        const toastHTML = `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="2000">
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        toastContainer.innerHTML = toastHTML;
        const toastElement = toastContainer.querySelector('.toast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    // --- EVENTOS DENTRO DEL CARRITO ---
    
    // Agrega un listener de eventos al contenedor de items para manejar los botones de +/-.
    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.id;
        const product = cart.find(item => item.id === productId);

        if (!product) return;

        if (target.classList.contains('btn-increase')) {
            // Incrementa la cantidad del producto.
            product.quantity++;
        } else if (target.classList.contains('btn-decrease')) {
            // Decrementa la cantidad y elimina el producto si llega a cero.
            product.quantity--;
            if (product.quantity === 0) {
                cart = cart.filter(item => item.id !== productId);
            }
        }
        
        saveAndRenderCart();
    });

    // Evento para el botón de vaciar carrito.
    clearCartButton.addEventListener('click', () => {
        cart = []; // Vacía el array
        saveAndRenderCart(); // Guarda y actualiza la vista
    });
    
    // Llama a renderCart al cargar la página para mostrar los items guardados.
    renderCart();
});