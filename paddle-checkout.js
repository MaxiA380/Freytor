/**
 * Paddle Payment Integration
 * Handles subscription checkout for Freytor pricing plans
 */

// Initialize Paddle
const PADDLE_VENDOR_ID = '283532'; // Freytor Seller ID

// Paddle Product/Plan IDs
const PADDLE_PRODUCTS = {
    starter: {
        monthly: 'pro_01kgxxg758rese1997628sf7rf',  // Basic Monthly
        annual: 'pro_01kgxxgyqbfpjwgtr4630w3675'   // Basic Annual
    },
    growth: {
        monthly: 'pro_01kgxxhmjhrzhxc9ja2pk5zy7j',  // Growth Monthly
        annual: 'pro_01kgxxs8jm5yh8w66ghp6wxv6a'   // Growth Annual
    },
    enterprise: {
        monthly: 'pro_01kgxxtrgzegb35wz2n1tkey9p',  // Enterprise Monthly
        annual: 'pro_01kgxxtzc84z64spxyh8dfvefj'   // Enterprise Annual
    }
};

// Initialize Paddle on page load
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Paddle !== 'undefined') {
        // Production environment - live payments
        Paddle.Environment.set('production');
        
        // Initialize with Vendor ID
        Paddle.Setup({ 
            vendor: parseInt(PADDLE_VENDOR_ID)
        });
        
        console.log('Paddle initialized successfully');
    } else {
        console.error('Paddle.js failed to load');
    }
});

/**
 * Open Paddle checkout for selected plan
 * @param {string} plan - Plan name: 'starter', 'growth', or 'enterprise'
 * @param {boolean} isPopular - Whether this is the popular/highlighted plan
 */
function openPaddleCheckout(plan, isPopular = false) {
    // Check if Paddle is loaded
    if (typeof Paddle === 'undefined') {
        alert('Payment system is loading. Please try again in a moment.');
        return;
    }
    
    // Check if vendor ID is configured
    if (PADDLE_VENDOR_ID === 'YOUR_PADDLE_VENDOR_ID') {
        console.error('Paddle Vendor ID not configured!');
        showPaddleSetupMessage();
        return;
    }
    
    // Determine billing cycle (annual vs monthly)
    const billingCycle = getCurrentBillingCycle();
    
    // Get the correct product ID
    const productId = PADDLE_PRODUCTS[plan]?.[billingCycle];
    
    if (!productId || productId.startsWith('YOUR_')) {
        console.error(`Product ID not configured for ${plan} - ${billingCycle}`);
        showPaddleSetupMessage();
        return;
    }
    
    // Prepare checkout options
    const checkoutOptions = {
        product: productId,
        title: `Freytor ${capitalize(plan)} Plan`,
        message: `Subscribe to the ${capitalize(plan)} plan - 30-day free pilot`,
        coupon: '', // Add coupon code if applicable
        email: '', // Pre-fill email if user is logged in
        country: '', // Pre-fill country
        postcode: '', // Pre-fill postcode
        passthrough: JSON.stringify({
            plan: plan,
            billing_cycle: billingCycle,
            trial_days: 14
        }),
        success: handlePaddleSuccess,
        successCallback: handlePaddleSuccess,
        closeCallback: handlePaddleClose
    };
    
    // Open Paddle checkout overlay
    Paddle.Checkout.open(checkoutOptions);
    
    // Track checkout opened (for analytics)
    const planPrice = getPlanPrice(plan, billingCycle);
    
    // Plausible tracking
    if (typeof trackEvent === 'function') {
        trackEvent('begin_checkout', 'conversion', `${plan}_${billingCycle}`, planPrice);
    }
    
    // Google Analytics (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'begin_checkout', {
            currency: 'USD',
            value: planPrice,
            items: [{
                item_id: plan,
                item_name: `Freytor ${capitalize(plan)} Plan`,
                item_category: 'Subscription',
                price: planPrice
            }]
        });
    }
}

/**
 * Handle successful Paddle checkout
 */
function handlePaddleSuccess(data) {
    console.log('Paddle checkout success:', data);
    
    // Track conversion with both analytics systems
    const checkoutValue = data.checkout.prices.customer.total;
    const productName = data.product.name || 'Freytor Subscription';
    
    // Plausible tracking
    if (typeof trackEvent === 'function') {
        trackEvent('purchase', 'conversion', productName, checkoutValue);
    }
    
    // Google Analytics (if available)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: data.checkout.id,
            value: checkoutValue,
            currency: data.checkout.prices.customer.currency,
            items: [{
                item_id: data.product.id,
                item_name: productName,
                price: checkoutValue
            }]
        });
    }
    
    // Facebook Pixel (if available)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            value: checkoutValue,
            currency: data.checkout.prices.customer.currency,
            content_name: productName
        });
    }
    
    // Redirect to thank you page or dashboard
    // You can customize this URL based on your needs
    const passthrough = JSON.parse(data.passthrough || '{}');
    const plan = passthrough.plan || 'starter';
    
    // Store subscription info in localStorage
    localStorage.setItem('freytor_subscription', JSON.stringify({
        checkout_id: data.checkout.id,
        plan: plan,
        status: 'active',
        started_at: new Date().toISOString()
    }));
    
    // Redirect to thank you page with plan info
    window.location.href = `thank-you.html?plan=${plan}&checkout_id=${data.checkout.id}`;
}

/**
 * Handle Paddle checkout close (user cancelled)
 */
function handlePaddleClose() {
    console.log('Paddle checkout closed by user');
    
    // Track abandonment with both analytics systems
    
    // Plausible tracking
    if (typeof trackEvent === 'function') {
        trackEvent('checkout_abandoned', 'conversion', 'paddle_closed');
    }
    
    // Google Analytics (if available) 
    if (typeof gtag !== 'undefined') {
        gtag('event', 'checkout_abandoned', {
            event_category: 'Ecommerce',
            event_label: 'Paddle Checkout Closed'
        });
    }
}

/**
 * Get current billing cycle from the toggle
 */
function getCurrentBillingCycle() {
    const annualBtn = document.getElementById('annual-btn');
    const monthlyBtn = document.getElementById('monthly-btn');
    
    // Check which button is active
    if (annualBtn && annualBtn.classList.contains('tw-bg-brand-blue')) {
        return 'annual';
    }
    if (monthlyBtn && monthlyBtn.classList.contains('tw-bg-brand-blue')) {
        return 'monthly';
    }
    
    // Default to annual
    return 'annual';
}

/**
 * Get plan price based on billing cycle
 */
function getPlanPrice(plan, billingCycle) {
    const prices = {
        starter: { monthly: 21, annual: 228 },
        growth: { monthly: 49, annual: 468 },
        enterprise: { monthly: 89, annual: 948 }
    };
    
    return prices[plan]?.[billingCycle] || 0;
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Show setup message when Paddle is not configured
 */
function showPaddleSetupMessage() {
    const message = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            max-width: 500px;
            z-index: 999999;
            text-align: center;
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">⚙️</div>
            <h2 style="color: #1A5BAB; margin-bottom: 16px; font-size: 24px;">Paddle Setup Required</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                Payment processing is not yet configured. Please set up your Paddle account and update the configuration in <strong>paddle-checkout.js</strong>.
            </p>
            <ol style="text-align: left; color: #666; line-height: 1.8; margin-bottom: 24px;">
                <li>Sign up at <a href="https://paddle.com" target="_blank" style="color: #1A5BAB;">paddle.com</a></li>
                <li>Get your Vendor ID from the Paddle dashboard</li>
                <li>Create products for each plan (Starter, Growth, Enterprise)</li>
                <li>Update PADDLE_VENDOR_ID and PADDLE_PRODUCTS in paddle-checkout.js</li>
            </ol>
            <button onclick="this.parentElement.remove()" style="
                background: linear-gradient(135deg, #1A5BAB 0%, #3EA344 100%);
                color: white;
                border: none;
                padding: 12px 32px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">Got it</button>
        </div>
        <div onclick="this.remove(); this.previousElementSibling.remove()" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999998;
        "></div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', message);
}

// Make function globally available
window.openPaddleCheckout = openPaddleCheckout;
