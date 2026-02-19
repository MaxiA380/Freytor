// Scroll Animations and Accessibility Features

// Intersection Observer for fade-in animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach((section, index) => {
        // Add fade-in class to sections
        if (!section.classList.contains('skip-animation')) {
            section.classList.add('fade-in-section');
            section.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(section);
        }
    });

    // Observe cards and other elements
    document.querySelectorAll('.review-card, .tw-grid > div, .faq-item').forEach((el, index) => {
        if (!el.closest('.skip-animation')) {
            el.classList.add('fade-in-section');
            el.style.transitionDelay = `${index * 0.05}s`;
            observer.observe(el);
        }
    });
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}

// Smooth scroll with offset for fixed header
document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#' && href !== '#!') {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Add keyboard navigation improvements
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape') {
        const collapseBtn = document.getElementById('collapse-btn');
        const isHeaderCollapsed = collapseBtn?.classList.contains('bi-x');
        
        if (isHeaderCollapsed && typeof toggleHeader === 'function') {
            toggleHeader();
        }
    }
});

// Enhanced focus management for modals/popups
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Add loading skeleton for dynamic content
function showLoadingSkeleton(container) {
    const skeleton = document.createElement('div');
    skeleton.className = 'loading-skeleton';
    skeleton.setAttribute('aria-live', 'polite');
    skeleton.setAttribute('aria-busy', 'true');
    skeleton.innerHTML = `
        <div class="tw-animate-pulse tw-space-y-4">
            <div class="tw-h-4 tw-bg-gray-200 tw-rounded tw-w-3/4"></div>
            <div class="tw-h-4 tw-bg-gray-200 tw-rounded tw-w-full"></div>
            <div class="tw-h-4 tw-bg-gray-200 tw-rounded tw-w-5/6"></div>
        </div>
    `;
    container.appendChild(skeleton);
    return skeleton;
}

function hideLoadingSkeleton(skeleton) {
    if (skeleton && skeleton.parentNode) {
        skeleton.remove();
    }
}

// Announce dynamic content changes for screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'tw-sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// Add reduced motion support
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    
    // Disable scroll animations for users who prefer reduced motion
    document.querySelectorAll('.fade-in-section').forEach(el => {
        el.classList.add('is-visible');
    });
}

// Export functions for use in other scripts
window.scrollAnimations = {
    init: initScrollAnimations,
    trapFocus,
    showLoadingSkeleton,
    hideLoadingSkeleton,
    announceToScreenReader
};
