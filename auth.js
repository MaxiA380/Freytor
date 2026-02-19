// Form Validation and Submission Handling

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(inputId + '-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.classList.remove('bi-eye');
        toggle.classList.add('bi-eye-slash');
    } else {
        input.type = 'password';
        toggle.classList.remove('bi-eye-slash');
        toggle.classList.add('bi-eye');
    }
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    const bars = document.querySelectorAll('#strength-bar > div');
    
    if (!bars.length) return;
    
    // Reset bars
    bars.forEach(bar => {
        bar.classList.remove('tw-bg-red-500', 'tw-bg-orange-500', 'tw-bg-yellow-500', 'tw-bg-green-500');
        bar.classList.add('tw-bg-gray-200');
    });
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    
    const colors = ['tw-bg-red-500', 'tw-bg-orange-500', 'tw-bg-yellow-500', 'tw-bg-green-500'];
    
    for (let i = 0; i < strength; i++) {
        bars[i].classList.remove('tw-bg-gray-200');
        bars[i].classList.add(colors[strength - 1]);
    }
}

// Show message helper
function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    container.classList.remove('tw-hidden', 'tw-bg-red-100', 'tw-bg-green-100', 'tw-text-red-700', 'tw-text-green-700');
    
    if (type === 'error') {
        container.classList.add('tw-bg-red-100', 'tw-text-red-700', 'tw-border', 'tw-border-red-300');
        container.innerHTML = `<i class="bi bi-exclamation-circle tw-mr-2"></i>${message}`;
    } else {
        container.classList.add('tw-bg-green-100', 'tw-text-green-700', 'tw-border', 'tw-border-green-300');
        container.innerHTML = `<i class="bi bi-check-circle tw-mr-2"></i>${message}`;
    }
}

// Hide message
function hideMessage(containerId) {
    const container = document.getElementById(containerId);
    container.classList.add('tw-hidden');
}

// Show field error
function showFieldError(fieldId, message) {
    const errorSpan = document.getElementById(fieldId + '-error');
    const input = document.getElementById(fieldId);
    
    if (errorSpan) {
        errorSpan.textContent = message;
        errorSpan.classList.remove('tw-hidden');
    }
    
    if (input) {
        input.classList.add('tw-border-red-500');
    }
}

// Hide field error
function hideFieldError(fieldId) {
    const errorSpan = document.getElementById(fieldId + '-error');
    const input = document.getElementById(fieldId);
    
    if (errorSpan) {
        errorSpan.classList.add('tw-hidden');
    }
    
    if (input) {
        input.classList.remove('tw-border-red-500');
    }
}

// Social login handler
function socialLogin(provider) {
    console.log(`Initiating ${provider} login...`);
    
    // For demo purposes, show a message and redirect to signup
    const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    
    // Show loading state on the button that was clicked
    const buttons = document.querySelectorAll(`button[onclick*="${provider}"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = `<i class="bi bi-arrow-repeat tw-animate-spin tw-mr-2"></i>Connecting to ${providerName}...`;
    });
    
    // In production, this would redirect to:
    // Google: https://accounts.google.com/o/oauth2/v2/auth
    // Microsoft: https://login.microsoftonline.com/common/oauth2/v2.0/authorize
    
    setTimeout(() => {
        // For now, redirect to signup page with a parameter
        window.location.href = `signup.html?provider=${provider}`;
    }, 1000);
}

// Login Form Handler
const loginForm = document.getElementById('login-form');
if (loginForm) {
    let loginAttemptCount = 0;
    const maxLoginAttempts = 5;
    let loginLockedUntil = null;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check rate limiting
        if (loginLockedUntil && Date.now() < loginLockedUntil) {
            const remainingSeconds = Math.ceil((loginLockedUntil - Date.now()) / 1000);
            showMessage('login-message', `Too many attempts. Please wait ${remainingSeconds} seconds before trying again.`, 'error');
            return;
        }
        
        // Honeypot check - if filled, it's a bot
        const honeypot = document.getElementById('company_website');
        if (honeypot && honeypot.value) {
            console.log('Bot detected via honeypot');
            return;
        }
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('login-btn-text');
        const btnSpinner = document.getElementById('login-btn-spinner');
        
        // Validate
        let isValid = true;
        hideMessage('login-message');
        hideFieldError('email');
        hideFieldError('password');
        
        if (!validateEmail(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (password.length < 8) {
            showFieldError('password', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        if (!isValid) {
            loginAttemptCount++;
            if (loginAttemptCount >= maxLoginAttempts) {
                loginLockedUntil = Date.now() + 30000; // Lock for 30 seconds
                showMessage('login-message', 'Too many failed attempts. Please wait 30 seconds.', 'error');
            }
            return;
        }
        
        // Reset attempt count on valid submission
        loginAttemptCount = 0;
        
        // Show loading state
        btn.disabled = true;
        btnText.classList.add('tw-hidden');
        btnSpinner.classList.remove('tw-hidden');
        
        // Simulate API call
        setTimeout(() => {
            // Reset button
            btn.disabled = false;
            btnText.classList.remove('tw-hidden');
            btnSpinner.classList.add('tw-hidden');
            
            // Show success (in real app, redirect to dashboard)
            showMessage('login-message', 'Login successful! Redirecting to dashboard...', 'success');
            
            // Simulate redirect
            setTimeout(() => {
                console.log('Would redirect to dashboard');
                // window.location.href = 'dashboard.html';
            }, 1500);
        }, 2000);
    });
}

// Signup Form Handler
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    const passwordInput = document.getElementById('signup-password');
    let attemptCount = 0;
    const maxAttempts = 5;
    let lockedUntil = null;
    
    // Password strength checker
    if (passwordInput) {
        passwordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check rate limiting
        if (lockedUntil && Date.now() < lockedUntil) {
            const remainingSeconds = Math.ceil((lockedUntil - Date.now()) / 1000);
            showMessage('signup-message', `Too many attempts. Please wait ${remainingSeconds} seconds before trying again.`, 'error');
            return;
        }
        
        // Honeypot check - if filled, it's a bot
        const honeypot = document.getElementById('website');
        if (honeypot && honeypot.value) {
            console.log('Bot detected via honeypot');
            // Silently fail for bots
            return;
        }
        
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('signup-email').value;
        const company = document.getElementById('company').value;
        const password = document.getElementById('signup-password').value;
        const terms = document.getElementById('terms').checked;
        const btn = document.getElementById('signup-btn');
        const btnText = document.getElementById('signup-btn-text');
        const btnSpinner = document.getElementById('signup-btn-spinner');
        
        // Validate
        let isValid = true;
        hideMessage('signup-message');
        hideFieldError('first-name');
        hideFieldError('last-name');
        hideFieldError('signup-email');
        hideFieldError('company');
        hideFieldError('signup-password');
        
        if (firstName.trim().length < 2) {
            showFieldError('first-name', 'First name must be at least 2 characters');
            isValid = false;
        }
        
        if (lastName.trim().length < 2) {
            showFieldError('last-name', 'Last name must be at least 2 characters');
            isValid = false;
        }
        
        if (!validateEmail(email)) {
            showFieldError('signup-email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (company.trim().length < 2) {
            showFieldError('company', 'Company name is required');
            isValid = false;
        }
        
        if (password.length < 8 || !password.match(/[a-z]/) || !password.match(/[A-Z]/) || !password.match(/[0-9]/)) {
            showFieldError('signup-password', 'Password must be at least 8 characters with uppercase, lowercase, and number');
            isValid = false;
        }
        
        if (!terms) {
            showMessage('signup-message', 'You must agree to the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }
        
        if (!isValid) {
            attemptCount++;
            if (attemptCount >= maxAttempts) {
                lockedUntil = Date.now() + 30000; // Lock for 30 seconds
                showMessage('signup-message', 'Too many failed attempts. Please wait 30 seconds.', 'error');
            }
            return;
        }
        
        // Reset attempt count on valid submission
        attemptCount = 0;
        
        // Show loading state
        btn.disabled = true;
        btnText.classList.add('tw-hidden');
        btnSpinner.classList.remove('tw-hidden');
        
        // Simulate API call
        setTimeout(() => {
            // Reset button
            btn.disabled = false;
            btnText.classList.remove('tw-hidden');
            btnSpinner.classList.add('tw-hidden');
            
            // Redirect to thank-you page
            window.location.href = 'thank-you.html';
        }, 2000);
    });
}

// Contact Form Handler - Now using FormSubmit
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    // Clear error styling when user types
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('tw-border-red-500');
            const messageDiv = document.getElementById('contact-message');
            if (messageDiv) {
                messageDiv.classList.add('tw-hidden');
            }
        });
    });
    
    contactForm.addEventListener('submit', (e) => {
        // Validate form fields before submission
        const name = contactForm.querySelector('input[name="name"]');
        const email = contactForm.querySelector('input[name="email"]');
        const subject = contactForm.querySelector('select[name="subject"]');
        const message = contactForm.querySelector('textarea[name="message"]');
        
        let isValid = true;
        
        if (!name || name.value.trim().length < 2) {
            isValid = false;
            if (name) name.classList.add('tw-border-red-500');
        }
        
        if (!email || !validateEmail(email.value)) {
            isValid = false;
            if (email) email.classList.add('tw-border-red-500');
        }
        
        if (!subject || !subject.value) {
            isValid = false;
            if (subject) subject.classList.add('tw-border-red-500');
        }
        
        if (!message || message.value.trim().length < 10) {
            isValid = false;
            if (message) message.classList.add('tw-border-red-500');
        }
        
        if (!isValid) {
            e.preventDefault();
            const messageDiv = document.getElementById('contact-message');
            if (messageDiv) {
                messageDiv.classList.remove('tw-hidden');
                messageDiv.classList.add('tw-bg-red-100', 'tw-text-red-700', 'tw-border', 'tw-border-red-300');
                messageDiv.innerHTML = '<i class="bi bi-exclamation-circle tw-mr-2"></i>Please fill in all required fields correctly.';
            }
            // Scroll to the first error
            const firstError = contactForm.querySelector('.tw-border-red-500');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }
        
        // Show loading state
        const submitBtn = document.getElementById('contact-submit-btn');
        const btnText = document.getElementById('contact-btn-text');
        const btnSpinner = document.getElementById('contact-btn-spinner');
        
        if (submitBtn && btnText && btnSpinner) {
            submitBtn.disabled = true;
            btnText.classList.add('tw-hidden');
            btnSpinner.classList.remove('tw-hidden');
        }
        
        // Form will submit naturally to FormSubmit
        // User will be redirected to thank-you.html
    });
}

// ==================== FORM ANALYTICS & TRACKING ====================

/**
 * Track form field interactions and abandonment
 */
let formStarted = false;
let formSubmitted = false;
let fieldsInteracted = new Set();

// Track form field focus and completion
function initFormTracking(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input:not([type="hidden"]):not([type="submit"]), select, textarea');
    
    inputs.forEach(field => {
        // Track field focus (user started interacting)
        field.addEventListener('focus', function() {
            if (!formStarted) {
                formStarted = true;
                if (typeof trackEvent === 'function') {
                    trackEvent('form_started', 'signup', formId);
                }
            }
            
            if (!fieldsInteracted.has(field.name) && typeof trackEvent === 'function') {
                trackEvent('form_field_focus', 'signup', field.name);
            }
        });
        
        // Track field completion (user filled in a value)
        field.addEventListener('blur', function() {
            if (field.value && !fieldsInteracted.has(field.name)) {
                fieldsInteracted.add(field.name);
                if (typeof trackEvent === 'function') {
                    trackEvent('form_field_complete', 'signup', field.name);
                }
            }
        });
        
        // Track field changes
        field.addEventListener('change', function() {
            if (typeof trackEvent === 'function') {
                trackEvent('form_field_changed', 'signup', field.name);
            }
        });
    });
    
    // Track form submission
    form.addEventListener('submit', function() {
        formSubmitted = true;
        if (typeof trackEvent === 'function') {
            trackEvent('form_submitted', 'signup', formId);
        }
    });
}

// Track form abandonment
window.addEventListener('beforeunload', function() {
    if (formStarted && !formSubmitted) {
        if (typeof trackEvent === 'function') {
            const completionRate = Math.round((fieldsInteracted.size / document.querySelectorAll('input:not([type="hidden"]), select, textarea').length) * 100);
            trackEvent('form_abandoned', 'signup', `${completionRate}% complete`);
        }
    }
});

// Track validation errors
function trackValidationError(fieldName, errorMessage) {
    if (typeof trackEvent === 'function') {
        trackEvent('form_validation_error', 'signup', `${fieldName}: ${errorMessage}`);
    }
}

// Initialize tracking for all forms
document.addEventListener('DOMContentLoaded', function() {
    // Track signup form
    if (document.getElementById('signup-form')) {
        initFormTracking('signup-form');
    }
    
    // Track login form
    if (document.getElementById('login-form')) {
        initFormTracking('login-form');
    }
    
    // Track contact form
    if (document.getElementById('contact-form')) {
        initFormTracking('contact-form');
    }
    
    // Track forgot password form
    if (document.getElementById('forgot-password-form')) {
        initFormTracking('forgot-password-form');
    }
});

// Track password strength changes
const passwordInput = document.getElementById('password');
if (passwordInput) {
    let lastStrength = 0;
    passwordInput.addEventListener('input', function() {
        const strength = calculatePasswordStrength(this.value);
        if (strength !== lastStrength && typeof trackEvent === 'function') {
            trackEvent('password_strength_changed', 'signup', `strength_${strength}`);
            lastStrength = strength;
        }
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    return strength;
}
