// FAQ Accordion Functionality

function toggleFAQ(button) {
    const faqItem = button.closest('.faq-item');
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('.bi-chevron-down');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    // Close all other open FAQs
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            const otherAnswer = item.querySelector('.faq-answer');
            const otherButton = item.querySelector('.faq-question');
            const otherIcon = otherButton.querySelector('.bi-chevron-down');
            
            otherAnswer.style.maxHeight = '0';
            otherAnswer.style.opacity = '0';
            otherIcon.style.transform = 'rotate(0deg)';
            otherButton.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Toggle current FAQ
    if (isExpanded) {
        answer.style.maxHeight = '0';
        answer.style.opacity = '0';
        icon.style.transform = 'rotate(0deg)';
        button.setAttribute('aria-expanded', 'false');
    } else {
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.opacity = '1';
        icon.style.transform = 'rotate(180deg)';
        button.setAttribute('aria-expanded', 'true');
    }
}

function filterFAQ(category) {
    const faqItems = document.querySelectorAll('.faq-item');
    const filterButtons = document.querySelectorAll('.faq-filter-btn');
    
    // Update active button
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide FAQ items with animation
    faqItems.forEach((item, index) => {
        const itemCategory = item.getAttribute('data-category');
        
        if (category === 'all' || itemCategory === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// Initialize FAQ items with animation
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
});
