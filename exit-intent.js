/**
 * Exit-Intent Popup & Social Proof System
 * Increases conversion by capturing abandoning visitors
 */

// ==================== EXIT INTENT POPUP ====================

let exitIntentShown = false;
const EXIT_POPUP_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if exit popup should be shown
 */
function shouldShowExitPopup() {
    const lastShown = localStorage.getItem('exit_popup_shown');
    if (!lastShown) return true;
    
    const timeSinceShown = Date.now() - parseInt(lastShown);
    return timeSinceShown > EXIT_POPUP_COOLDOWN;
}

/**
 * Show exit-intent popup
 */
function showExitPopup() {
    if (exitIntentShown || !shouldShowExitPopup()) return;
    
    exitIntentShown = true;
    localStorage.setItem('exit_popup_shown', Date.now().toString());
    
    const popup = `
        <div id="exit-popup" class="tw-fixed tw-inset-0 tw-z-50 tw-flex tw-items-center tw-justify-center tw-bg-black/60 tw-backdrop-blur-sm tw-p-4" style="animation: fadeIn 0.3s ease-in-out;">
            <div class="tw-bg-white tw-rounded-2xl tw-p-8 tw-max-w-md tw-shadow-2xl tw-m-4 tw-relative" style="animation: slideUp 0.3s ease-out;">
                <button onclick="closeExitPopup()" class="tw-absolute tw-top-4 tw-right-4 tw-text-gray-400 hover:tw-text-gray-600 tw-text-2xl tw-font-bold" aria-label="Close popup">&times;</button>
                
                <div class="tw-text-center">
                    <div class="tw-text-6xl tw-mb-4">⏱️</div>
                    <h3 class="tw-text-2xl tw-font-bold tw-mb-3 tw-text-gray-900">Wait! Before you go...</h3>
                    <p class="tw-text-gray-700 tw-mb-6 tw-leading-relaxed">
                        Start your <strong class="tw-text-brand-green">30-day free pilot</strong> today.<br>
                        We'll import your first 20 shipments and show you the savings!
                    </p>
                    
                    <div class="tw-bg-blue-50 tw-rounded-lg tw-p-4 tw-mb-6">
                        <div class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-sm tw-text-gray-700">
                            <i class="bi bi-check-circle-fill tw-text-green-600"></i>
                            <span>No credit card required</span>
                        </div>
                        <div class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-sm tw-text-gray-700">
                            <i class="bi bi-check-circle-fill tw-text-green-600"></i>
                            <span>Guided onboarding call included</span>
                        </div>
                        <div class="tw-flex tw-items-center tw-justify-center tw-gap-2 tw-text-sm tw-text-gray-700">
                            <i class="bi bi-check-circle-fill tw-text-green-600"></i>
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                    
                    <div class="tw-flex tw-flex-col tw-gap-3">
                        <a href="signup.html" class="btn tw-text-center tw-text-lg tw-py-4" onclick="trackEvent('exit_popup_signup', 'conversion', 'clicked_signup')">
                            Start Free Pilot Now →
                        </a>
                        <button onclick="closeExitPopup()" class="tw-px-4 tw-py-2 tw-text-gray-600 hover:tw-text-gray-800 tw-text-sm">
                            No thanks, I'll figure it out myself
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', popup);
    
    // Track popup shown
    if (typeof trackEvent === 'function') {
        trackEvent('exit_popup_shown', 'conversion', 'triggered');
    }
}

/**
 * Close exit popup
 */
window.closeExitPopup = function() {
    const popup = document.getElementById('exit-popup');
    if (popup) {
        popup.style.animation = 'fadeOut 0.2s ease-out';
        setTimeout(() => popup.remove(), 200);
        
        if (typeof trackEvent === 'function') {
            trackEvent('exit_popup_closed', 'conversion', 'dismissed');
        }
    }
}

// Track exit intent via mouse movement
document.addEventListener('mouseleave', (e) => {
    // Only trigger if mouse leaves from the top of the page
    if (e.clientY < 10 && !exitIntentShown && shouldShowExitPopup()) {
        showExitPopup();
    }
});

// Alternative: Track exit intent on mobile via scroll pattern
let scrollDirection = 0;
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY < lastScrollY && currentScrollY < 100) {
        // User is scrolling up near the top (possible exit behavior on mobile)
        scrollDirection++;
        if (scrollDirection > 3 && !exitIntentShown && shouldShowExitPopup() && window.innerWidth < 768) {
            setTimeout(() => showExitPopup(), 500);
        }
    } else {
        scrollDirection = 0;
    }
    
    lastScrollY = currentScrollY;
}, { passive: true });


// ==================== SOCIAL PROOF WIDGET ====================

const SOCIAL_PROOF_LOCATIONS = [
    'Lagos, Nigeria',
    'Nairobi, Kenya',
    'Accra, Ghana',
    'Cairo, Egypt',
    'Johannesburg, South Africa',
    'Dar es Salaam, Tanzania',
    'Kampala, Uganda',
    'Addis Ababa, Ethiopia',
    'Kigali, Rwanda',
    'Casablanca, Morocco'
];

const SOCIAL_PROOF_MESSAGES = [
    'Started a free pilot',
    'Signed up for Freytor',
    'Joined the pilot program',
    'Upgraded to Growth plan',
    'Started tracking shipments'
];

let proofIndex = 0;
let socialProofInterval;

/**
 * Create social proof widget
 */
function createSocialProofWidget() {
    const widget = `
        <div id="social-proof" class="tw-fixed tw-bottom-4 tw-left-4 tw-z-40 tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-4 tw-border-2 tw-border-green-200 tw-max-w-sm tw-hidden" style="animation: slideInLeft 0.5s ease-out;">
            <div class="tw-flex tw-items-center tw-gap-3">
                <div class="tw-w-10 tw-h-10 tw-rounded-full tw-bg-green-100 tw-flex tw-items-center tw-justify-center tw-flex-shrink-0">
                    <i class="bi bi-person-check-fill tw-text-green-600 tw-text-xl"></i>
                </div>
                <div class="tw-flex-1">
                    <p class="tw-font-semibold tw-text-sm tw-text-gray-900">
                        Someone from <span id="proof-location" class="tw-text-brand-blue">Lagos</span>
                    </p>
                    <p class="tw-text-xs tw-text-gray-600">
                        <span id="proof-message">Started a free pilot</span> <span id="proof-time" class="tw-font-medium">2 minutes ago</span>
                    </p>
                </div>
                <button onclick="hideSocialProof()" class="tw-text-gray-400 hover:tw-text-gray-600" aria-label="Dismiss">
                    <i class="bi bi-x tw-text-lg"></i>
                </button>
            </div>
        </div>
        
        <style>
            @keyframes slideInLeft {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutLeft {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widget);
}

/**
 * Update social proof content
 */
function updateSocialProof() {
    const proof = document.getElementById('social-proof');
    if (!proof) return;
    
    // Update content
    const location = SOCIAL_PROOF_LOCATIONS[proofIndex % SOCIAL_PROOF_LOCATIONS.length];
    const message = SOCIAL_PROOF_MESSAGES[Math.floor(Math.random() * SOCIAL_PROOF_MESSAGES.length)];
    const timeAgo = Math.floor(Math.random() * 30) + 1;
    
    document.getElementById('proof-location').textContent = location;
    document.getElementById('proof-message').textContent = message;
    document.getElementById('proof-time').textContent = `${timeAgo} minutes ago`;
    
    // Show with animation
    proof.classList.remove('tw-hidden');
    proof.style.animation = 'slideInLeft 0.5s ease-out';
    
    // Track event
    if (typeof trackEvent === 'function') {
        trackEvent('social_proof_shown', 'engagement', location);
    }
    
    // Hide after 6 seconds
    setTimeout(() => {
        proof.style.animation = 'slideOutLeft 0.5s ease-out';
        setTimeout(() => {
            proof.classList.add('tw-hidden');
        }, 500);
    }, 6000);
    
    proofIndex++;
}

/**
 * Hide social proof widget
 */
window.hideSocialProof = function() {
    const proof = document.getElementById('social-proof');
    if (proof) {
        proof.style.animation = 'slideOutLeft 0.5s ease-out';
        setTimeout(() => proof.classList.add('tw-hidden'), 500);
        
        // Stop showing for this session
        if (socialProofInterval) {
            clearInterval(socialProofInterval);
        }
    }
}

/**
 * Start social proof system
 */
function startSocialProof() {
    // Don't show on mobile to avoid clutter
    if (window.innerWidth < 768) return;
    
    createSocialProofWidget();
    
    // Show first notification after 5 seconds
    setTimeout(() => {
        updateSocialProof();
    }, 5000);
    
    // Then show every 20 seconds
    socialProofInterval = setInterval(() => {
        updateSocialProof();
    }, 20000);
}

// Initialize social proof when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startSocialProof);
} else {
    startSocialProof();
}
