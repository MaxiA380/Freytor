/**
 * Component Loader
 * Dynamically loads header and footer components to avoid code duplication
 */

class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
        const element = document.getElementById(elementId);
        if (!element) return;

        try {
            const response = await fetch(componentPath);
            if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
            const html = await response.text();
            element.innerHTML = html;
        } catch (error) {
            console.error(`Error loading component: ${error.message}`);
        }
    }

    static async init() {
        // Load header and footer components
        await Promise.all([
            this.loadComponent('header-component', './components/header.html'),
            this.loadComponent('footer-component', './components/footer.html')
        ]);

        // Re-initialize header toggle functionality after components are loaded
        this.initHeaderToggle();
        
        // Initialize language switcher after components are loaded
        this.initLanguageSwitcher();
        
        // Highlight active nav link
        this.highlightActiveLink();
        
        // Initialize i18n after components are loaded
        // Wait a bit to ensure i18n is fully loaded
        setTimeout(() => {
            if (typeof window.i18n === 'function') {
                const i18nInstance = window.i18n();
                if (i18nInstance && typeof i18nInstance.translatePage === 'function') {
                    i18nInstance.translatePage();
                }
            } else if (window.i18nInstance) {
                window.i18nInstance.translatePage();
            }
        }, 100);
    }

    static initHeaderToggle() {
        // Re-bind the collapse button and header items after dynamic load
        window.collapseBtn = document.getElementById("collapse-btn");
        window.collapseHeaderItems = document.getElementById("collapsed-header-items");
        window.isHeaderCollapsed = window.innerWidth < 1024;
    }

    static initLanguageSwitcher() {
        // Setup language switcher after header is loaded
        const languageButton = document.getElementById('language-button');
        const languageMenu = document.getElementById('language-menu');
        
        if (!languageButton || !languageMenu) {
            console.warn('Language switcher elements not found');
            return;
        }

        // Close language menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!languageButton.contains(event.target) && 
                !languageMenu.contains(event.target)) {
                languageMenu.classList.add('tw-hidden');
            }
        });

        // Add event listeners to language options as a fallback
        const languageOptions = languageMenu.querySelectorAll('[data-lang]');
        languageOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = option.getAttribute('data-lang');
                console.log('Language option clicked:', lang);
                changeLanguage(lang);
            });
        });
    }

    static highlightActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const headerLinks = document.querySelectorAll('.header-links');
        
        headerLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('tw-text-brand-blue', 'tw-font-semibold');
            }
        });
    }
}

// Initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ComponentLoader.init();
});

/**
 * Language Switcher Functions
 */

// Toggle language dropdown menu
function toggleLanguageMenu(event) {
    if (event) {
        event.stopPropagation();
    }
    
    const menu = document.getElementById('language-menu');
    if (menu) {
        const isHidden = menu.classList.contains('tw-hidden');
        menu.classList.toggle('tw-hidden');
        console.log('Language menu toggled:', isHidden ? 'opening' : 'closing');
    } else {
        console.error('Language menu element not found');
    }
}

// Change language
function changeLanguage(lang) {
    console.log('Changing language to:', lang);
    
    try {
        if (typeof window.i18n === 'function') {
            const i18nInstance = window.i18n();
            if (i18nInstance && typeof i18nInstance.setLanguage === 'function') {
                i18nInstance.setLanguage(lang);
                console.log('Language changed successfully to:', lang);
            } else {
                console.error('i18n instance or setLanguage method not available');
            }
        } else if (window.i18nInstance) {
            // Fallback to global instance
            window.i18nInstance.setLanguage(lang);
            console.log('Language changed successfully to:', lang);
        } else {
            console.error('i18n not available');
            // Try to reload the page with language parameter as fallback
            localStorage.setItem('preferred-language', lang);
            location.reload();
            return;
        }
    } catch (error) {
        console.error('Error changing language:', error);
    }
    
    // Close the menu
    const menu = document.getElementById('language-menu');
    if (menu) {
        menu.classList.add('tw-hidden');
    }
}

// Make functions globally available
window.toggleLanguageMenu = toggleLanguageMenu;
window.changeLanguage = changeLanguage;

// Initialize components immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ComponentLoader.init();
    });
} else {
    // DOM is already loaded, initialize immediately
    ComponentLoader.init();
}
