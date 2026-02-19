/**
 * i18n - Internationalization System
 * Handles language switching and translation for the entire website
 */

class I18n {
    constructor() {
        this.supportedLanguages = ['en', 'de', 'es'];
        this.languageNames = {
            'en': 'English',
            'de': 'Deutsch',
            'es': 'Español'
        };
        this.languageFlags = {
            'en': '🇬🇧',
            'de': '🇩🇪',
            'es': '🇪🇸'
        };
        this.currentLanguage = this.getStoredLanguage() || this.detectBrowserLanguage() || 'en';
    }

    /**
     * Initialize the i18n system
     */
    init() {
        this.setLanguage(this.currentLanguage);
        this.setupLanguageObserver();
    }

    /**
     * Detect browser language
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        if (!browserLang) return 'en';
        const langCode = browserLang.split('-')[0];
        return this.supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    /**
     * Get stored language from localStorage
     */
    getStoredLanguage() {
        return localStorage.getItem('preferred-language');
    }

    /**
     * Store language preference
     */
    storeLanguage(lang) {
        localStorage.setItem('preferred-language', lang);
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Set the current language and update all translations
     */
    setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language '${lang}' not supported. Falling back to English.`);
            lang = 'en';
        }

        this.currentLanguage = lang;
        this.storeLanguage(lang);
        document.documentElement.setAttribute('lang', lang);
        
        this.translatePage();
        this.updateLanguageSwitcher();
        this.dispatchLanguageChangeEvent();
    }

    /**
     * Translate all elements on the page
     */
    translatePage() {
        // Get all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.translate(key);
            
            if (translation) {
                // Handle different types of elements
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // For input elements, update placeholder
                    if (element.hasAttribute('placeholder')) {
                        element.setAttribute('placeholder', translation);
                    } else {
                        element.value = translation;
                    }
                } else if (element.tagName === 'IMG') {
                    // For images, update alt text
                    element.setAttribute('alt', translation);
                } else {
                    // For regular elements, update text content
                    element.textContent = translation;
                }
            }
        });

        // Translate elements with data-i18n-html (for HTML content)
        const htmlElements = document.querySelectorAll('[data-i18n-html]');
        htmlElements.forEach(element => {
            const key = element.getAttribute('data-i18n-html');
            const translation = this.translate(key);
            if (translation) {
                element.innerHTML = translation;
            }
        });

        // Translate placeholders separately
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.translate(key);
            if (translation) {
                element.setAttribute('placeholder', translation);
            }
        });

        // Translate aria-labels
        const ariaElements = document.querySelectorAll('[data-i18n-aria]');
        ariaElements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.translate(key);
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Translate title attributes
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.translate(key);
            if (translation) {
                element.setAttribute('title', translation);
            }
        });
    }

    /**
     * Get translation for a specific key
     */
    translate(key) {
        if (!window.translations || !window.translations[this.currentLanguage]) {
            console.error('Translations not loaded');
            return key;
        }

        const translation = window.translations[this.currentLanguage][key];
        
        if (!translation) {
            console.warn(`Translation not found for key: ${key} in language: ${this.currentLanguage}`);
            // Fallback to English
            return window.translations['en'][key] || key;
        }

        return translation;
    }

    /**
     * Update the language switcher UI
     */
    updateLanguageSwitcher() {
        const currentLangSpan = document.getElementById('current-language');
        if (currentLangSpan) {
            currentLangSpan.textContent = `${this.languageFlags[this.currentLanguage]} ${this.languageNames[this.currentLanguage]}`;
        }

        // Update active state on language options
        const langOptions = document.querySelectorAll('[data-lang]');
        langOptions.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active-language');
            } else {
                option.classList.remove('active-language');
            }
        });
    }

    /**
     * Setup mutation observer to translate dynamically added content
     */
    setupLanguageObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Translate the new node
                        if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                            const key = node.getAttribute('data-i18n');
                            const translation = this.translate(key);
                            if (translation) {
                                node.textContent = translation;
                            }
                        }
                        
                        // Translate children of the new node
                        const children = node.querySelectorAll ? node.querySelectorAll('[data-i18n]') : [];
                        children.forEach(child => {
                            const key = child.getAttribute('data-i18n');
                            const translation = this.translate(key);
                            if (translation) {
                                child.textContent = translation;
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Dispatch custom event when language changes
     */
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languagechange', {
            detail: { language: this.currentLanguage }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages.map(lang => ({
            code: lang,
            name: this.languageNames[lang],
            flag: this.languageFlags[lang]
        }));
    }
}

// Initialize i18n when DOM is ready
let i18nInstance = null;

function initI18n() {
    if (!i18nInstance) {
        i18nInstance = new I18n();
        i18nInstance.init();
        // Also expose directly on window
        if (typeof window !== 'undefined') {
            window.i18nInstance = i18nInstance;
        }
    }
    return i18nInstance;
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// Make i18n available globally
if (typeof window !== 'undefined') {
    window.I18n = I18n;
    window.i18n = () => i18nInstance || initI18n();
}
