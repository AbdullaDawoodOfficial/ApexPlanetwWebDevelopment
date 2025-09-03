// Advanced Animation System
class AnimationSystem {
    constructor() {
        this.observers = new Map();
        this.animations = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }

    init() {
        this.setupIntersectionObservers();
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupClickAnimations();
        this.setupPageTransitions();
    }

    setupIntersectionObservers() {
        // Main animation observer
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerAnimation(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        });

        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('[data-animate]');
        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.set('animation', animationObserver);

        // Parallax observer for performance
        if (!this.isReducedMotion) {
            this.setupParallaxObserver();
        }
    }

    setupParallaxObserver() {
        const parallaxObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startParallax(entry.target);
                } else {
                    this.stopParallax(entry.target);
                }
            });
        }, {
            rootMargin: '200px 0px 200px 0px'
        });

        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(el => {
            parallaxObserver.observe(el);
        });
    }

    triggerAnimation(element) {
        const animationType = element.getAttribute('data-animate') || 'fadeInUp';
        const delay = element.getAttribute('data-animate-delay') || 0;
        const duration = element.getAttribute('data-animate-duration') || 600;

        if (this.isReducedMotion) {
            element.style.opacity = '1';
            element.style.transform = 'none';
            return;
        }

        setTimeout(() => {
            this.applyAnimation(element, animationType, duration);
        }, parseInt(delay));
    }

    applyAnimation(element, type, duration) {
        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        switch (type) {
            case 'fadeInUp':
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                break;
            case 'fadeInLeft':
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                break;
            case 'fadeInRight':
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
                break;
            case 'scaleIn':
                element.style.opacity = '1';
                element.style.transform = 'scale(1)';
                break;
            case 'rotateIn':
                element.style.opacity = '1';
                element.style.transform = 'rotate(0deg) scale(1)';
                break;
            case 'slideInUp':
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
                break;
            default:
                element.style.opacity = '1';
        }

        // Add animated class
        element.classList.add('animated');
    }

    setupScrollAnimations() {
        if (this.isReducedMotion) return;

        let ticking = false;

        const updateScrollAnimations = () => {
            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;

            // Parallax elements
            this.animations.forEach((animation, element) => {
                if (animation.type === 'parallax') {
                    const rect = element.getBoundingClientRect();
                    const speed = parseFloat(element.getAttribute('data-parallax-speed')) || 0.5;
                    const yPos = -(scrollTop * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                }
            });

            // Progress bars
            const progressBars = document.querySelectorAll('.progress-bar');
            progressBars.forEach(bar => {
                const rect = bar.getBoundingClientRect();
                if (rect.top < windowHeight && rect.bottom > 0) {
                    const progress = Math.min(100, Math.max(0, (windowHeight - rect.top) / windowHeight * 100));
                    bar.style.width = `${progress}%`;
                }
            });

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    }

    setupHoverAnimations() {
        if (this.isReducedMotion) return;

        // Card hover effects
        const cards = document.querySelectorAll('.service-card, .portfolio-item, .blog-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateCardHover(card, true);
            });

            card.addEventListener('mouseleave', () => {
                this.animateCardHover(card, false);
            });
        });

        // Button hover effects
        const buttons = document.querySelectorAll('.btn, .service-btn, .portfolio-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.animateButtonHover(button, true);
            });

            button.addEventListener('mouseleave', () => {
                this.animateButtonHover(button, false);
            });
        });

        // Image hover effects
        const images = document.querySelectorAll('.portfolio-image img, .blog-image img');
        images.forEach(img => {
            img.addEventListener('mouseenter', () => {
                this.animateImageHover(img, true);
            });

            img.addEventListener('mouseleave', () => {
                this.animateImageHover(img, false);
            });
        });
    }

    animateCardHover(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = 'var(--shadow-xl)';
            
            // Animate child elements
            const title = card.querySelector('h3');
            if (title) {
                title.style.color = 'var(--primary)';
            }
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow-md)';
            
            const title = card.querySelector('h3');
            if (title) {
                title.style.color = '';
            }
        }
    }

    animateButtonHover(button, isHovering) {
        if (isHovering) {
            button.style.transform = 'translateY(-2px)';
            
            // Add ripple effect
            this.createRipple(button);
        } else {
            button.style.transform = 'translateY(0)';
        }
    }

    animateImageHover(img, isHovering) {
        if (isHovering) {
            img.style.transform = 'scale(1.1)';
        } else {
            img.style.transform = 'scale(1)';
        }
    }

    createRipple(button) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s linear;
            top: 50%;
            left: 50%;
            margin-left: -${size / 2}px;
            margin-top: -${size / 2}px;
            pointer-events: none;
        `;

        // Add ripple animation CSS if not exists
        if (!document.querySelector('#rippleStyles')) {
            const style = document.createElement('style');
            style.id = 'rippleStyles';
            style.textContent = `
                @keyframes rippleEffect {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    setupClickAnimations() {
        if (this.isReducedMotion) return;

        // Click feedback for interactive elements
        const clickElements = document.querySelectorAll('button, .nav-link, .filter-btn, .category-btn');
        
        clickElements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.animateClick(e.target);
            });
        });
    }

    animateClick(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
        }, 100);
    }

    setupPageTransitions() {
        if (this.isReducedMotion) return;

        // Smooth page load animation
        this.animatePageLoad();
        
        // Setup link transitions
        this.setupLinkTransitions();
    }

    animatePageLoad() {
        const elements = document.querySelectorAll('section, .navbar, .footer');
        
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupLinkTransitions() {
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.isReducedMotion) {
                    this.animatePageTransition(e.target.getAttribute('href'));
                }
            });
        });
    }

    animatePageTransition(targetHref) {
        const currentSection = document.querySelector('.section.active');
        const targetSection = document.querySelector(targetHref);
        
        if (currentSection && targetSection) {
            // Fade out current section
            currentSection.style.transition = 'opacity 0.3s ease';
            currentSection.style.opacity = '0.5';
            
            // Fade in target section after scroll
            setTimeout(() => {
                if (currentSection) {
                    currentSection.style.opacity = '1';
                }
            }, 800);
        }
    }

    startParallax(element) {
        this.animations.set(element, { type: 'parallax', active: true });
    }

    stopParallax(element) {
        this.animations.delete(element);
    }

    // Staggered animations for lists
    staggerAnimation(elements, animationType = 'fadeInUp', delay = 100) {
        if (this.isReducedMotion) {
            elements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = this.getInitialTransform(animationType);
            
            setTimeout(() => {
                this.applyAnimation(element, animationType, 600);
            }, index * delay);
        });
    }

    getInitialTransform(animationType) {
        switch (animationType) {
            case 'fadeInUp':
                return 'translateY(30px)';
            case 'fadeInLeft':
                return 'translateX(-30px)';
            case 'fadeInRight':
                return 'translateX(30px)';
            case 'scaleIn':
                return 'scale(0.8)';
            case 'rotateIn':
                return 'rotate(-10deg) scale(0.8)';
            default:
                return 'translateY(30px)';
        }
    }

    // Morphing animations
    morphElement(element, fromState, toState, duration = 300) {
        if (this.isReducedMotion) return;

        element.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        
        Object.assign(element.style, toState);
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    }

    // Loading animations
    showLoading(element, type = 'spinner') {
        const loadingEl = document.createElement('div');
        loadingEl.className = `loading loading-${type}`;
        
        switch (type) {
            case 'spinner':
                loadingEl.innerHTML = '<div class="spinner"></div>';
                break;
            case 'dots':
                loadingEl.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
                break;
            case 'pulse':
                loadingEl.innerHTML = '<div class="loading-pulse"></div>';
                break;
        }

        // Add loading styles if not exists
        this.addLoadingStyles();
        
        element.appendChild(loadingEl);
        return loadingEl;
    }

    hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.style.opacity = '0';
            setTimeout(() => {
                if (loadingElement.parentNode) {
                    loadingElement.parentNode.removeChild(loadingElement);
                }
            }, 300);
        }
    }

    addLoadingStyles() {
        if (document.querySelector('#loadingStyles')) return;

        const style = document.createElement('style');
        style.id = 'loadingStyles';
        style.textContent = `
            .loading {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: var(--spacing-4);
                opacity: 1;
                transition: opacity 0.3s ease;
            }
            
            .loading-dots {
                display: flex;
                gap: 4px;
            }
            
            .loading-dots span {
                width: 8px;
                height: 8px;
                background: var(--primary);
                border-radius: 50%;
                animation: loadingDots 1.4s ease-in-out infinite both;
            }
            
            .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
            .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes loadingDots {
                0%, 80%, 100% {
                    transform: scale(0.8);
                    opacity: 0.5;
                }
                40% {
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            .loading-pulse {
                width: 20px;
                height: 20px;
                background: var(--primary);
                border-radius: 50%;
                animation: loadingPulse 1s ease-in-out infinite;
            }
            
            @keyframes loadingPulse {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Cleanup
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animations.clear();
    }
}

// Initialize animation system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.AnimationSystem = new AnimationSystem();
    });
} else {
    window.AnimationSystem = new AnimationSystem();
}