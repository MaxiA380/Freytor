// initialization

const RESPONSIVE_WIDTH = 1024

let headerWhiteBg = false
window.isHeaderCollapsed = window.innerWidth < RESPONSIVE_WIDTH
window.collapseBtn = document.getElementById("collapse-btn")
window.collapseHeaderItems = document.getElementById("collapsed-header-items")

function onHeaderClickOutside(e) {
    if (!window.collapseHeaderItems.contains(e.target) && !window.collapseBtn.contains(e.target)) {
        toggleHeader()
    }
}

window.toggleHeader = function() {
    if (window.isHeaderCollapsed) {
        // Open menu with smooth CSS transform animation (better performance)
        window.collapseHeaderItems.classList.add("opacity-100")
        window.collapseHeaderItems.style.transform = "translateX(0)"
        window.collapseHeaderItems.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out"
        window.collapseBtn.classList.remove("bi-list")
        window.collapseBtn.classList.add("bi-x", "max-lg:tw-fixed")
        window.isHeaderCollapsed = false

        // Prevent body scroll when menu is open
        document.body.style.overflow = "hidden"

        setTimeout(() => window.addEventListener("click", onHeaderClickOutside), 10)
    } else {
        // Close menu with smooth animation
        window.collapseHeaderItems.classList.remove("opacity-100")
        window.collapseHeaderItems.style.transform = "translateX(100%)"
        window.collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")
        window.collapseBtn.classList.add("bi-list")
        window.isHeaderCollapsed = true
        
        // Restore body scroll
        document.body.style.overflow = ""
        
        window.removeEventListener("click", onHeaderClickOutside)
    }
}

function responsive() {
    if (window.innerWidth > RESPONSIVE_WIDTH) {
        window.collapseHeaderItems.style.transform = ""
        window.collapseHeaderItems.style.transition = ""
        window.collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")
        window.collapseBtn.classList.add("bi-list")
        window.isHeaderCollapsed = false
        document.body.style.overflow = ""
        window.removeEventListener("click", onHeaderClickOutside)
    } else {
        if (!window.isHeaderCollapsed) {
            window.collapseHeaderItems.style.transform = "translateX(100%)"
            window.collapseBtn.classList.remove("bi-x", "max-lg:tw-fixed")
            window.collapseBtn.classList.add("bi-list")
            window.isHeaderCollapsed = true
        }
    }
}

window.addEventListener("resize", responsive)

// Scroll effect for header
let lastScroll = 0
const header = document.querySelector('header')

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset
    
    // Add shadow and effects when scrolled
    if (currentScroll > 20) {
        header?.classList.add('scrolled')
    } else {
        header?.classList.remove('scrolled')
    }
    
    lastScroll = currentScroll
}, { passive: true })

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href')
        if (href !== '#' && href !== '#!') {
            e.preventDefault()
            const target = document.querySelector(href)
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        }
    })
})

// ==================== ANALYTICS & EVENT TRACKING ====================

/**
 * Universal event tracking function
 * Works with Plausible Analytics and can be extended for other analytics tools
 */
window.trackEvent = function(action, category, label, value) {
    // Plausible Analytics
    if (typeof plausible !== 'undefined') {
        plausible(action, {
            props: {
                category: category || 'unknown',
                label: label || 'unknown',
                value: value || 0
            }
        });
    }
    
    // Google Analytics (if implemented later)
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
    
    // Console log for debugging (remove in production)
    // console.log('📊 Event tracked:', { action, category, label, value });
}

// Track all CTA button clicks (signup, pricing, demo, contact)
document.addEventListener('DOMContentLoaded', function() {
    // Track signup/CTA buttons
    document.querySelectorAll('a[href="signup.html"], button[onclick*="signup"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.textContent.trim();
            const section = this.closest('section')?.id || this.closest('div[class*="tw-"]')?.className.match(/\b\w+-section\b/)?.[0] || 'unknown';
            trackEvent('cta_click', 'conversion', `signup_${section}_${text.substring(0, 30)}`);
        });
    });
    
    // Track pricing page clicks
    document.querySelectorAll('a[href="pricing.html"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.closest('section')?.id || 'unknown';
            trackEvent('cta_click', 'conversion', `pricing_${section}`);
        });
    });
    
    // Track contact clicks
    document.querySelectorAll('a[href="contact.html"]').forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('cta_click', 'engagement', 'contact_page');
        });
    });
    
    // Track demo/video clicks
    document.querySelectorAll('a[href*="demo"], button[class*="demo"]').forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('demo_click', 'engagement', 'demo_request');
        });
    });
});

// Track scroll depth for engagement metrics
let scrollDepths = [25, 50, 75, 100];
let scrollTracked = false;

window.addEventListener('scroll', () => {
    if (scrollDepths.length === 0) return;
    
    const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
    
    scrollDepths = scrollDepths.filter(depth => {
        if (scrollPercent >= depth) {
            trackEvent('scroll_depth', 'engagement', `${depth}%`, depth);
            return false; // Remove this depth from the array
        }
        return true;
    });
}, { passive: true });

// Track time on page
let pageStartTime = Date.now();
let timeTracked = false;

window.addEventListener('beforeunload', function() {
    if (!timeTracked) {
        const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
        trackEvent('time_on_page', 'engagement', `${timeOnPage}s`, timeOnPage);
        timeTracked = true;
    }
});

// Track outbound links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a');
    if (link && link.hostname && link.hostname !== window.location.hostname) {
        trackEvent('outbound_click', 'engagement', link.href);
    }
}, true);

