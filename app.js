// Sample product data
const products = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        price: 199.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&crop=center",
        description: "High-quality wireless headphones with noise cancellation"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&crop=center",
        description: "Feature-rich smartwatch with health tracking"
    },
    {
        id: 3,
        name: "Bluetooth Speaker",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&h=300&fit=crop&crop=center",
        description: "Portable speaker with amazing sound quality"
    },
    {
        id: 4,
        name: "Laptop Stand",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop&crop=center",
        description: "Adjustable aluminum laptop stand for better ergonomics"
    },
    {
        id: 5,
        name: "Wireless Mouse",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop&crop=center",
        description: "Ergonomic wireless mouse with precision tracking"
    },
    {
        id: 6,
        name: "Phone Case",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=300&h=300&fit=crop&crop=center",
        description: "Protective phone case with premium materials"
    }
];

// Shopping cart
let cart = [];

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const cartToggle = document.getElementById('cartToggle');
const cartSection = document.getElementById('cartSection');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');

// Initialize the app
function init() {
    renderProducts();
    setupEventListeners();
    updateCartUI();
    renderPayPalButtons();
}

// Render products
function renderProducts() {
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to all add-to-cart buttons
    setupAddToCartListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Scroll to cart when cart toggle is clicked
    cartToggle.addEventListener('click', scrollToCart);
    
    // Handle touch move for better touch detection
    document.addEventListener('touchmove', () => {
        touchMoved = true;
    }, { passive: true });
    
    // Prevent zoom on double tap for iOS
    document.addEventListener('touchend', (e) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Variable for double tap prevention
let lastTouchEnd = 0;

// Setup add to cart button listeners
function setupAddToCartListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        // Remove any existing listeners to prevent duplicates
        button.removeEventListener('click', handleAddToCart);
        button.removeEventListener('touchstart', handleTouchStart);
        button.removeEventListener('touchend', handleTouchEnd);
        
        // Add click event for desktop
        button.addEventListener('click', handleAddToCart);
        
        // Add touch events for mobile with better handling
        button.addEventListener('touchstart', handleTouchStart, { passive: true });
        button.addEventListener('touchend', handleTouchEnd, { passive: false });
    });
}

// Variables for touch handling
let touchStartTime = 0;
let touchMoved = false;

// Handle touch start
function handleTouchStart(event) {
    touchStartTime = Date.now();
    touchMoved = false;
    
    const button = event.currentTarget;
    button.classList.add('touch-active');
}

// Handle touch end
function handleTouchEnd(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    button.classList.remove('touch-active');
    
    // Only trigger if it was a quick tap (not a long press or scroll)
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration < 500 && !touchMoved) {
        const productId = parseInt(button.dataset.productId);
        if (productId) {
            addToCart(productId, button);
        }
    }
}

// Handle add to cart button clicks
function handleAddToCart(event) {
    // Prevent double handling on touch devices
    if (event.type === 'click' && 'ontouchstart' in window) {
        return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const productId = parseInt(button.dataset.productId);
    
    if (!productId) return;
    
    addToCart(productId, button);
}

// Scroll to cart section
function scrollToCart() {
    cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Add item to cart
function addToCart(productId, buttonElement = null) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    
    // Show success feedback if button element is provided
    if (buttonElement) {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Added!';
        buttonElement.style.backgroundColor = '#28a745';
        buttonElement.disabled = true;
        
        setTimeout(() => {
            buttonElement.textContent = originalText;
            buttonElement.style.backgroundColor = '';
            buttonElement.disabled = false;
        }, 1000);
    }
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    
    // Render cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn" data-action="decrease" data-product-id="${item.id}" aria-label="Decrease quantity">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" data-action="increase" data-product-id="${item.id}" aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <button class="remove-item" data-product-id="${item.id}" aria-label="Remove item">&times;</button>
            </div>
        `).join('');
        
        // Add event listeners to quantity and remove buttons
        setupCartItemListeners();
    }
    
    // Always render PayPal buttons since cart is always visible
    renderPayPalButtons();
}

// Setup event listeners for cart items
function setupCartItemListeners() {
    // Quantity buttons
    const quantityButtons = document.querySelectorAll('.quantity-btn');
    quantityButtons.forEach(button => {
        button.addEventListener('click', handleQuantityChange);
        button.addEventListener('touchend', handleQuantityTouch);
    });
    
    // Remove buttons
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', handleRemoveItem);
        button.addEventListener('touchend', handleRemoveTouch);
    });
}

// Handle quantity change
function handleQuantityChange(event) {
    if (event.type === 'click' && 'ontouchstart' in window) {
        return;
    }
    event.preventDefault();
    const button = event.currentTarget;
    const productId = parseInt(button.dataset.productId);
    const action = button.dataset.action;
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        updateQuantity(productId, newQuantity);
    }
}

// Handle quantity touch
function handleQuantityTouch(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const productId = parseInt(button.dataset.productId);
    const action = button.dataset.action;
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
        updateQuantity(productId, newQuantity);
    }
}

// Handle remove item
function handleRemoveItem(event) {
    if (event.type === 'click' && 'ontouchstart' in window) {
        return;
    }
    event.preventDefault();
    const productId = parseInt(event.currentTarget.dataset.productId);
    removeFromCart(productId);
}

// Handle remove touch
function handleRemoveTouch(event) {
    event.preventDefault();
    const productId = parseInt(event.currentTarget.dataset.productId);
    removeFromCart(productId);
}

// Render PayPal buttons
function renderPayPalButtons() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="checkout-message">Add items to cart to checkout</p>';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Add checkout header with click event to open login
    container.innerHTML = '<div class="checkout-header" id="checkoutWithPayPal" style="cursor:pointer;">Checkout with PayPal</div>';
    // Add click event to open login
    setTimeout(() => {
        const checkoutHeader = document.getElementById('checkoutWithPayPal');
        if (checkoutHeader) {
            checkoutHeader.onclick = () => {
                window.open('https://www.stage2d0068.stage.paypal.com/webapps/hermes?token=14B60635D11202338', '_blank');
            };
        }
    }, 0);
    
    // Create PayPal button container
    const paypalContainer = document.createElement('div');
    paypalContainer.id = 'paypal-buttons';
    container.appendChild(paypalContainer);
    
    try {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: total.toFixed(2),
                            currency_code: 'USD'
                        },
                        description: `Merchant Store Order - ${cart.length} items`
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Show success message
                    container.innerHTML = `
                        <div class="payment-success">
                            <h3>✅ Payment Successful!</h3>
                            <p>Thank you, ${details.payer.name.given_name}!</p>
                            <p>Order ID: ${details.id}</p>
                        </div>
                    `;
                    
                    // Clear cart after successful payment
                    setTimeout(() => {
                        cart = [];
                        updateCartUI();
                    }, 3000);
                    
                    console.log('Transaction details:', details);
                });
            },
            onError: function(err) {
                console.error('PayPal error:', err);
                container.innerHTML = `
                    <div class="payment-error">
                        <p>❌ Payment failed. Please try again.</p>
                        <button onclick="renderPayPalButtons()" class="retry-btn">Retry Payment</button>
                    </div>
                `;
            },
            onCancel: function(data) {
                console.log('Payment cancelled:', data);
                container.innerHTML = `
                    <div class="payment-cancelled">
                        <p>Payment was cancelled.</p>
                        <button onclick="renderPayPalButtons()" class="retry-btn">Try Again</button>
                    </div>
                `;
            },
            style: {
                color: 'blue',
                shape: 'rect',
                label: 'checkout',
                layout: 'vertical',
                height: 45,
                tagline: false
            }
        }).render('#paypal-buttons');
    } catch (error) {
        console.error('PayPal rendering error:', error);
        // Fallback button
        container.innerHTML = `
            <div class="paypal-fallback">
                <p>PayPal checkout temporarily unavailable</p>
                <button class="fallback-checkout-btn" onclick="simulateCheckout()">
                    Complete Order ($${total.toFixed(2)})
                </button>
            </div>
        `;
    }
}

// Fallback checkout simulation
function simulateCheckout() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Order total: $${total.toFixed(2)}\n\nThis is a demo checkout. In production, this would redirect to PayPal.`);
    
    // Clear cart
    cart = [];
    updateCartUI();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);