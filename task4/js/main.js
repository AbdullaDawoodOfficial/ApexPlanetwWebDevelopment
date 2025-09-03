// Main JavaScript File
class PixelCraftApp {
    constructor() {
        this.isLoading = true;
        this.currentSection = 'home';
        this.scrollDirection = 'down';
        this.lastScrollTop = 0;
        
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.setupEventListeners();
        this.initializeComponents();
        this.setupIntersectionObservers();
        this.setupPerformanceOptimizations();
        this.hideLoadingScreen();
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Scroll events
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16));
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Mobile navigation
        const navToggle = document.getElementById('navToggle');
        if (navToggle) {
            navToggle.addEventListener('click', this.toggleMobileNav.bind(this));
        }

        // Portfolio filters
        this.setupPortfolioFilters();

        // Blog functionality
        this.setupBlogFunctionality();

        // Service modals
        this.setupServiceModals();

        // Scroll to top button
        this.setupScrollToTop();

        // Lightbox
        this.setupLightbox();

        // Contact form
        this.setupContactForm();

        // Newsletter form
        this.setupNewsletterForm();

        // Keyboard navigation
        this.setupKeyboardNavigation();

        // Window resize
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                this.updateActiveNavLink(targetId);
                
                // Close mobile nav if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu && navMenu.classList.contains('active')) {
                    this.toggleMobileNav();
                }
            });
        });
    }

    setupIntersectionObservers() {
        // Section observer for navigation
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.currentSection = entry.target.id;
                    this.updateActiveNavLink(entry.target.id);
                }
            });
        }, {
            rootMargin: '-50px 0px -50px 0px',
            threshold: [0, 0.5, 1]
        });

        // Observe all sections
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => sectionObserver.observe(section));

        // Animation observer
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        });

        // Observe elements with animation class
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        animateElements.forEach(el => animationObserver.observe(el));

        // Lazy loading observer
        this.setupLazyLoading();
    }

    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => img.classList.add('loaded'));
        }
    }

    initializeComponents() {
        // Initialize typing animation
        this.initTypingAnimation();
        
        // Initialize stats counter
        this.initStatsCounter();
        
        // Initialize particle background
        if (window.ParticleSystem) {
            this.particles = new ParticleSystem();
        }
        
        // Add scroll-based animations
        this.addScrollAnimations();
        
        // Initialize tooltips
        this.initTooltips();
    }

    initTypingAnimation() {
        const typingText = document.getElementById('typingText');
        if (!typingText) return;

        const texts = [
            'Amazing Experiences',
            'Beautiful Websites',
            'Digital Solutions',
            'Modern Applications',
            'Creative Designs'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        const typeWriter = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typingText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                setTimeout(() => isDeleting = true, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }

            setTimeout(typeWriter, typeSpeed);
        };

        typeWriter();
    }

    initStatsCounter() {
        const stats = document.querySelectorAll('.stat-number');
        const hasAnimated = new Set();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasAnimated.has(entry.target)) {
                    hasAnimated.add(entry.target);
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    addScrollAnimations() {
        const elements = document.querySelectorAll('.service-card, .portfolio-item, .blog-card, .contact-item');
        elements.forEach(el => {
            el.classList.add('animate-on-scroll');
        });
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Update scroll direction
        if (scrollTop > this.lastScrollTop) {
            this.scrollDirection = 'down';
        } else {
            this.scrollDirection = 'up';
        }
        this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        // Handle navbar visibility
        this.handleNavbarVisibility(scrollTop);

        // Handle scroll to top button
        this.handleScrollToTopButton(scrollTop);

        // Update active section
        this.updateActiveSectionOnScroll();
    }

    handleNavbarVisibility(scrollTop) {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        if (scrollTop > 100 && this.scrollDirection === 'down') {
            navbar.classList.add('hidden');
        } else if (this.scrollDirection === 'up' || scrollTop <= 100) {
            navbar.classList.remove('hidden');
        }
    }

    handleScrollToTopButton(scrollTop) {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (!scrollToTopBtn) return;

        if (scrollTop > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    updateActiveSectionOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;

            if (scrollPos >= top && scrollPos <= bottom) {
                const sectionId = section.getAttribute('id');
                if (sectionId !== this.currentSection) {
                    this.currentSection = sectionId;
                    this.updateActiveNavLink(sectionId);
                }
            }
        });
    }

    updateActiveNavLink(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
                link.classList.add('active');
            }
        });
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        const themeIcon = document.querySelector('.theme-icon');
        
        if (isDark) {
            document.documentElement.classList.remove('dark');
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    }

    toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        if (navMenu && navToggle) {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        }
    }

    setupPortfolioFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        const portfolioItems = document.querySelectorAll('.portfolio-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter items
                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        item.classList.remove('hidden');
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.classList.add('hidden');
                        }, 300);
                    }
                });
            });
        });
    }

    setupBlogFunctionality() {
        const searchInput = document.getElementById('blogSearch');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const blogCards = document.querySelectorAll('.blog-card');

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.filterBlogs(e.target.value.toLowerCase());
            }, 300));
        }

        // Category filtering
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.filterBlogsByCategory(category);
            });
        });

        // Read more buttons
        const readMoreBtns = document.querySelectorAll('.blog-read-more');
        readMoreBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const blogCard = btn.closest('.blog-card');
                const title = blogCard.querySelector('.blog-title').textContent;
                this.openBlogModal(title);
            });
        });

        // Pagination
        this.setupPagination();
    }

    filterBlogs(searchTerm) {
        const blogCards = document.querySelectorAll('.blog-card');
        
        blogCards.forEach(card => {
            const title = card.querySelector('.blog-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    filterBlogsByCategory(category) {
        const blogCards = document.querySelectorAll('.blog-card');
        
        blogCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }

    setupPagination() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                // Implement pagination logic
                console.log('Previous page');
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                // Implement pagination logic
                console.log('Next page');
            });
        }
    }

    setupServiceModals() {
        const serviceCards = document.querySelectorAll('.service-card');
        const modal = document.getElementById('serviceModal');
        const modalBody = document.getElementById('modalBody');
        const modalClose = document.getElementById('modalClose');

        const serviceDetails = {
            'web-development': {
                title: 'Web Development',
                description: 'We create custom websites and web applications using the latest technologies and best practices.',
                features: [
                    'Responsive Design',
                    'Modern JavaScript Frameworks',
                    'API Integration',
                    'Performance Optimization',
                    'SEO Optimization',
                    'Cross-browser Compatibility'
                ],
                technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Vue.js', 'Node.js'],
                pricing: 'Starting from $2,500'
            },
            'ui-design': {
                title: 'UI/UX Design',
                description: 'Beautiful, intuitive designs that provide exceptional user experiences across all devices.',
                features: [
                    'User Research',
                    'Wireframing',
                    'Prototyping',
                    'Visual Design',
                    'Usability Testing',
                    'Design Systems'
                ],
                technologies: ['Figma', 'Sketch', 'Adobe XD', 'Principle', 'InVision'],
                pricing: 'Starting from $1,500'
            }
            // Add more service details as needed
        };

        serviceCards.forEach(card => {
            const serviceBtn = card.querySelector('.service-btn');
            if (serviceBtn) {
                serviceBtn.addEventListener('click', () => {
                    const serviceId = card.getAttribute('data-service');
                    const service = serviceDetails[serviceId];
                    
                    if (service) {
                        this.openServiceModal(service);
                    }
                });
            }
        });

        if (modalClose && modal) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    openServiceModal(service) {
        const modal = document.getElementById('serviceModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <h2 style="color: var(--primary); font-size: var(--font-size-2xl); margin-bottom: var(--spacing-4);">${service.title}</h2>
            <p style="margin-bottom: var(--spacing-6); line-height: 1.6;">${service.description}</p>
            
            <h3 style="color: var(--gray-900); margin-bottom: var(--spacing-4);">Features</h3>
            <ul style="margin-bottom: var(--spacing-6); padding-left: var(--spacing-6);">
                ${service.features.map(feature => `<li style="margin-bottom: var(--spacing-2);">${feature}</li>`).join('')}
            </ul>
            
            <h3 style="color: var(--gray-900); margin-bottom: var(--spacing-4);">Technologies</h3>
            <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-2); margin-bottom: var(--spacing-6);">
                ${service.technologies.map(tech => `<span style="background: var(--primary); color: white; padding: var(--spacing-1) var(--spacing-3); border-radius: var(--radius-full); font-size: var(--font-size-sm);">${tech}</span>`).join('')}
            </div>
            
            <div style="background: var(--gray-50); padding: var(--spacing-4); border-radius: var(--radius-lg); text-align: center;">
                <strong style="color: var(--primary); font-size: var(--font-size-lg);">${service.pricing}</strong>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = 'auto';
    }

    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxCaption = document.getElementById('lightboxCaption');
        const lightboxClose = document.getElementById('lightboxClose');

        // Global function for opening lightbox
        window.openLightbox = (src, caption) => {
            if (lightbox && lightboxImage && lightboxCaption) {
                lightboxImage.src = src;
                lightboxCaption.textContent = caption || '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        if (lightboxClose && lightbox) {
            lightboxClose.addEventListener('click', () => {
                this.closeLightbox();
            });

            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Keyboard navigation for lightbox
        document.addEventListener('keydown', (e) => {
            if (lightbox && lightbox.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeLightbox();
                }
            }
        });
    }

    closeLightbox() {
        const lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const formInputs = contactForm.querySelectorAll('input, textarea');
        const submitBtn = contactForm.querySelector('.form-submit');

        // Real-time validation
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Form submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate all fields
            let isValid = true;
            formInputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) return;

            // Show loading state
            const submitText = submitBtn.querySelector('.submit-text');
            const submitLoading = submitBtn.querySelector('.submit-loading');
            
            submitText.style.display = 'none';
            submitLoading.style.display = 'inline';
            submitBtn.disabled = true;

            try {
                // Simulate form submission
                await this.simulateFormSubmission(new FormData(contactForm));
                
                this.showToast('Message sent successfully!', 'success');
                contactForm.reset();
                
                // Clear any error states
                formInputs.forEach(input => {
                    const errorEl = document.getElementById(input.name + 'Error');
                    if (errorEl) errorEl.textContent = '';
                });
                
            } catch (error) {
                this.showToast('Failed to send message. Please try again.', 'error');
            } finally {
                // Reset button state
                submitText.style.display = 'inline';
                submitLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorEl = document.getElementById(fieldName + 'Error');
        
        let errorMessage = '';
        let isValid = true;

        // Required field validation
        if (!value) {
            errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            isValid = false;
        } else {
            // Field-specific validation
            switch (fieldName) {
                case 'email':
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    }
                    break;
                case 'name':
                    if (value.length < 2) {
                        errorMessage = 'Name must be at least 2 characters';
                        isValid = false;
                    }
                    break;
                case 'message':
                    if (value.length < 10) {
                        errorMessage = 'Message must be at least 10 characters';
                        isValid = false;
                    }
                    break;
            }
        }

        // Update error display
        if (errorEl) {
            errorEl.textContent = errorMessage;
        }

        // Update field styling
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('valid');
        } else {
            field.classList.remove('valid');
            field.classList.add('error');
        }

        return isValid;
    }

    async simulateFormSubmission(formData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form data:', Object.fromEntries(formData));
                resolve();
            }, 2000);
        });
    }

    setupNewsletterForm() {
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        
        newsletterForms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = form.querySelector('.newsletter-input');
                const email = input.value.trim();
                
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    this.showToast('Please enter a valid email address', 'error');
                    return;
                }
                
                try {
                    // Simulate newsletter subscription
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    this.showToast('Successfully subscribed to newsletter!', 'success');
                    input.value = '';
                } catch (error) {
                    this.showToast('Subscription failed. Please try again.', 'error');
                }
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Handle keyboard shortcuts
            switch (e.key) {
                case 'Escape':
                    // Close any open modals
                    this.closeModal();
                    this.closeLightbox();
                    break;
                case 'Tab':
                    // Enhanced tab navigation
                    this.handleTabNavigation(e);
                    break;
                case '/':
                    // Focus search (if available)
                    if (!e.ctrlKey && !e.altKey) {
                        e.preventDefault();
                        const searchInput = document.getElementById('blogSearch');
                        if (searchInput) {
                            searchInput.focus();
                        }
                    }
                    break;
            }
        });
    }

    handleTabNavigation(e) {
        // Enhanced accessibility for tab navigation
        const focusableElements = document.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

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

    setupPerformanceOptimizations() {
        // Preload critical resources
        this.preloadCriticalResources();
        
        // Setup service worker if available
        this.setupServiceWorker();
        
        // Monitor performance
        this.monitorPerformance();
        
        // Setup prefetch for likely navigation
        this.setupPrefetch();
    }

    preloadCriticalResources() {
        const criticalImages = [
            'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }

    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                });
            });
            
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            observer.observe({ type: 'first-input', buffered: true });
        }
    }

    setupPrefetch() {
        // Prefetch likely next pages on hover
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    // Prefetch section content if needed
                    this.prefetchSection(href.substring(1));
                }
            });
        });
    }

    prefetchSection(sectionId) {
        // Implementation for prefetching section-specific resources
        console.log(`Prefetching resources for section: ${sectionId}`);
    }

    handleResize() {
        // Handle responsive behavior
        this.updateResponsiveElements();
        
        // Recalculate particle system if exists
        if (this.particles) {
            this.particles.handleResize();
        }
    }

    updateResponsiveElements() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        // Update navigation for mobile
        const navMenu = document.getElementById('navMenu');
        if (navMenu && !isMobile) {
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Update grid layouts
        this.updateGridLayouts(isMobile, isTablet);
    }

    updateGridLayouts(isMobile, isTablet) {
        // Dynamic grid updates based on viewport
        const grids = document.querySelectorAll('.services-grid, .portfolio-grid, .blog-grid');
        
        grids.forEach(grid => {
            if (isMobile) {
                grid.style.gridTemplateColumns = '1fr';
            } else if (isTablet) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(320px, 1fr))';
            }
        });
    }

    initTooltips() {
        // Simple tooltip implementation
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('data-tooltip'));
            });
            
            el.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-popup';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: var(--gray-900);
            color: white;
            padding: var(--spacing-2) var(--spacing-3);
            border-radius: var(--radius);
            font-size: var(--font-size-sm);
            z-index: 10000;
            pointer-events: none;
            opacity: 0;
            transition: opacity var(--transition);
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.opacity = '0';
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 300);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    openBlogModal(title) {
        // Simple blog modal implementation
        this.showToast(`Opening blog post: ${title}`, 'info');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    this.isLoading = false;
                }, 500);
            }, 1000);
        } else {
            this.isLoading = false;
        }
    }

    // Utility functions
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
}

// Global scroll function
window.scrollToSection = function(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
};

// Initialize app when DOM is ready
const app = new PixelCraftApp();