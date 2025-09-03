// Advanced Form Handling System
class FormSystem {
    constructor() {
        this.forms = new Map();
        this.validators = new Map();
        this.submitCallbacks = new Map();
        
        this.init();
    }

    init() {
        this.setupValidation();
        this.setupSubmission();
        this.setupAccessibility();
        this.setupAutoSave();
    }

    setupValidation() {
        // Email validation
        this.validators.set('email', {
            test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Please enter a valid email address'
        });

        // Phone validation
        this.validators.set('phone', {
            test: (value) => /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
            message: 'Please enter a valid phone number'
        });

        // Name validation
        this.validators.set('name', {
            test: (value) => value.length >= 2 && /^[a-zA-Z\s]+$/.test(value),
            message: 'Name must be at least 2 characters and contain only letters'
        });

        // URL validation
        this.validators.set('url', {
            test: (value) => {
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Please enter a valid URL'
        });

        // Password strength validation
        this.validators.set('password', {
            test: (value) => {
                const hasLength = value.length >= 8;
                const hasUpper = /[A-Z]/.test(value);
                const hasLower = /[a-z]/.test(value);
                const hasNumber = /\d/.test(value);
                const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
                
                return hasLength && hasUpper && hasLower && hasNumber && hasSpecial;
            },
            message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
        });

        // Credit card validation (basic Luhn algorithm)
        this.validators.set('creditcard', {
            test: (value) => this.validateCreditCard(value),
            message: 'Please enter a valid credit card number'
        });

        // Setup real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Validate on input (with debounce)
            input.addEventListener('input', this.debounce((e) => {
                this.validateField(e.target);
            }, 300));

            // Validate on blur
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });

            // Clear validation on focus
            input.addEventListener('focus', (e) => {
                this.clearFieldValidation(e.target);
            });
        });
    }

    validateField(field, showErrors = true) {
        const value = field.value.trim();
        const fieldType = field.type || field.tagName.toLowerCase();
        const isRequired = field.hasAttribute('required');
        const customValidator = field.getAttribute('data-validator');
        const minLength = field.getAttribute('minlength');
        const maxLength = field.getAttribute('maxlength');
        const pattern = field.getAttribute('pattern');
        
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (isRequired && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required`;
        }
        
        // Skip other validations if empty and not required
        if (!value && !isRequired) {
            this.updateFieldValidation(field, true, '');
            return true;
        }

        // Length validation
        if (minLength && value.length < parseInt(minLength)) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} must be at least ${minLength} characters`;
        }
        
        if (maxLength && value.length > parseInt(maxLength)) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} must be no more than ${maxLength} characters`;
        }

        // Pattern validation
        if (pattern && !new RegExp(pattern).test(value)) {
            isValid = false;
            errorMessage = field.getAttribute('data-pattern-message') || 
                          `${this.getFieldLabel(field)} format is invalid`;
        }

        // Type-based validation
        if (this.validators.has(fieldType) && value) {
            const validator = this.validators.get(fieldType);
            if (!validator.test(value)) {
                isValid = false;
                errorMessage = validator.message;
            }
        }

        // Custom validator
        if (customValidator && this.validators.has(customValidator) && value) {
            const validator = this.validators.get(customValidator);
            if (!validator.test(value)) {
                isValid = false;
                errorMessage = validator.message;
            }
        }

        // Confirmation field validation
        if (field.getAttribute('data-confirm')) {
            const confirmField = document.querySelector(`[name="${field.getAttribute('data-confirm')}"]`);
            if (confirmField && value !== confirmField.value) {
                isValid = false;
                errorMessage = 'Fields do not match';
            }
        }

        if (showErrors) {
            this.updateFieldValidation(field, isValid, errorMessage);
        }

        return isValid;
    }

    getFieldLabel(field) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (label) {
            return label.textContent.trim();
        }
        
        const placeholder = field.getAttribute('placeholder');
        if (placeholder) {
            return placeholder;
        }
        
        return field.name || 'Field';
    }

    updateFieldValidation(field, isValid, message) {
        const errorElement = this.getErrorElement(field);
        const fieldContainer = field.closest('.form-group');
        
        if (isValid) {
            field.classList.remove('error', 'invalid');
            field.classList.add('valid');
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-describedby');
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            
            if (fieldContainer) {
                fieldContainer.classList.remove('error');
                fieldContainer.classList.add('valid');
            }
        } else {
            field.classList.remove('valid');
            field.classList.add('error', 'invalid');
            field.setAttribute('aria-invalid', 'true');
            
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
                field.setAttribute('aria-describedby', errorElement.id);
            }
            
            if (fieldContainer) {
                fieldContainer.classList.remove('valid');
                fieldContainer.classList.add('error');
            }
        }
    }

    clearFieldValidation(field) {
        field.classList.remove('error', 'invalid', 'valid');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        
        const errorElement = this.getErrorElement(field);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        const fieldContainer = field.closest('.form-group');
        if (fieldContainer) {
            fieldContainer.classList.remove('error', 'valid');
        }
    }

    getErrorElement(field) {
        const errorId = field.name + 'Error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'form-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            
            const fieldContainer = field.closest('.form-group');
            if (fieldContainer) {
                fieldContainer.appendChild(errorElement);
            } else {
                field.parentNode.insertBefore(errorElement, field.nextSibling);
            }
        }
        
        return errorElement;
    }

    setupSubmission() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            this.forms.set(form.id || form.className, form);
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSubmission(form);
            });
        });
    }

    async handleSubmission(form) {
        const formId = form.id || form.className;
        const submitButton = form.querySelector('[type="submit"]');
        
        // Validate entire form
        if (!this.validateForm(form)) {
            this.focusFirstError(form);
            return;
        }

        // Show loading state
        this.setSubmissionState(submitButton, 'loading');
        
        try {
            // Get form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Custom submission handler
            const customHandler = this.submitCallbacks.get(formId);
            if (customHandler) {
                await customHandler(data, form);
            } else {
                await this.defaultSubmissionHandler(data, form);
            }
            
            // Success state
            this.setSubmissionState(submitButton, 'success');
            this.showFormFeedback(form, 'success', 'Form submitted successfully!');
            
            // Reset form after delay
            setTimeout(() => {
                this.resetForm(form);
                this.setSubmissionState(submitButton, 'default');
            }, 2000);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.setSubmissionState(submitButton, 'error');
            this.showFormFeedback(form, 'error', 'Submission failed. Please try again.');
            
            setTimeout(() => {
                this.setSubmissionState(submitButton, 'default');
            }, 3000);
        }
    }

    validateForm(form) {
        const fields = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    focusFirstError(form) {
        const firstErrorField = form.querySelector('.error, .invalid');
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    setSubmissionState(button, state) {
        if (!button) return;
        
        const textElement = button.querySelector('.submit-text') || button;
        const loadingElement = button.querySelector('.submit-loading');
        
        button.classList.remove('loading', 'success', 'error');
        button.disabled = state !== 'default';
        
        switch (state) {
            case 'loading':
                button.classList.add('loading');
                if (textElement && loadingElement) {
                    textElement.style.display = 'none';
                    loadingElement.style.display = 'inline';
                } else {
                    button.textContent = 'Sending...';
                }
                break;
                
            case 'success':
                button.classList.add('success');
                if (textElement && loadingElement) {
                    textElement.style.display = 'inline';
                    loadingElement.style.display = 'none';
                    textElement.textContent = 'Sent!';
                } else {
                    button.textContent = 'Sent!';
                }
                break;
                
            case 'error':
                button.classList.add('error');
                if (textElement && loadingElement) {
                    textElement.style.display = 'inline';
                    loadingElement.style.display = 'none';
                    textElement.textContent = 'Error';
                } else {
                    button.textContent = 'Error';
                }
                break;
                
            default:
                if (textElement && loadingElement) {
                    textElement.style.display = 'inline';
                    loadingElement.style.display = 'none';
                    textElement.textContent = 'Send Message';
                } else {
                    button.textContent = 'Send Message';
                }
        }
    }

    showFormFeedback(form, type, message) {
        let feedbackElement = form.querySelector('.form-feedback');
        
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'form-feedback';
            feedbackElement.setAttribute('role', 'alert');
            feedbackElement.setAttribute('aria-live', 'polite');
            form.appendChild(feedbackElement);
        }
        
        feedbackElement.className = `form-feedback ${type}`;
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block';
        
        // Add styles if not exists
        this.addFeedbackStyles();
        
        // Hide after delay
        setTimeout(() => {
            feedbackElement.style.display = 'none';
        }, 5000);
    }

    addFeedbackStyles() {
        if (document.querySelector('#formFeedbackStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'formFeedbackStyles';
        style.textContent = `
            .form-feedback {
                padding: var(--spacing-3) var(--spacing-4);
                border-radius: var(--radius-lg);
                margin-top: var(--spacing-4);
                font-weight: 500;
                display: none;
            }
            
            .form-feedback.success {
                background: #D1FAE5;
                color: #065F46;
                border: 1px solid #10B981;
            }
            
            .form-feedback.error {
                background: #FEE2E2;
                color: #991B1B;
                border: 1px solid #EF4444;
            }
            
            .dark .form-feedback.success {
                background: #064E3B;
                color: #6EE7B7;
            }
            
            .dark .form-feedback.error {
                background: #7F1D1D;
                color: #FCA5A5;
            }
        `;
        document.head.appendChild(style);
    }

    resetForm(form) {
        form.reset();
        
        // Clear validation states
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            this.clearFieldValidation(field);
        });
        
        // Clear feedback
        const feedback = form.querySelector('.form-feedback');
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    async defaultSubmissionHandler(data, form) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Form submitted:', data);
        
        // Here you would typically send data to your server
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Submission failed');
        // }
    }

    setupAccessibility() {
        // Add ARIA labels and descriptions
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const fields = form.querySelectorAll('input, textarea, select');
            
            fields.forEach(field => {
                // Ensure labels are properly associated
                if (field.id) {
                    const label = document.querySelector(`label[for="${field.id}"]`);
                    if (!label) {
                        // Create label if missing
                        const newLabel = document.createElement('label');
                        newLabel.setAttribute('for', field.id);
                        newLabel.textContent = field.getAttribute('placeholder') || field.name;
                        field.parentNode.insertBefore(newLabel, field);
                    }
                }
                
                // Add required indicators
                if (field.hasAttribute('required')) {
                    field.setAttribute('aria-required', 'true');
                }
            });
        });
    }

    setupAutoSave() {
        const autoSaveForms = document.querySelectorAll('[data-autosave]');
        
        autoSaveForms.forEach(form => {
            const formId = form.getAttribute('data-autosave');
            const interval = parseInt(form.getAttribute('data-autosave-interval')) || 30000; // 30 seconds
            
            // Load saved data
            this.loadAutoSaveData(form, formId);
            
            // Setup auto-save
            const fields = form.querySelectorAll('input, textarea, select');
            fields.forEach(field => {
                field.addEventListener('input', this.debounce(() => {
                    this.autoSave(form, formId);
                }, 1000));
            });
            
            // Periodic save
            setInterval(() => {
                this.autoSave(form, formId);
            }, interval);
            
            // Clear on successful submission
            form.addEventListener('submit', () => {
                setTimeout(() => {
                    this.clearAutoSave(formId);
                }, 2000);
            });
        });
    }

    autoSave(form, formId) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Only save if form has content
        const hasContent = Object.values(data).some(value => value.toString().trim());
        if (hasContent) {
            localStorage.setItem(`autosave_${formId}`, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        }
    }

    loadAutoSaveData(form, formId) {
        const saved = localStorage.getItem(`autosave_${formId}`);
        if (!saved) return;
        
        try {
            const { data, timestamp } = JSON.parse(saved);
            const hourOld = Date.now() - timestamp > 3600000; // 1 hour
            
            if (hourOld) {
                this.clearAutoSave(formId);
                return;
            }
            
            // Restore form data
            Object.entries(data).forEach(([name, value]) => {
                const field = form.querySelector(`[name="${name}"]`);
                if (field) {
                    field.value = value;
                }
            });
            
            // Show restore notification
            this.showRestoreNotification(form, () => {
                this.clearAutoSave(formId);
                this.resetForm(form);
            });
            
        } catch (error) {
            console.error('Error loading auto-save data:', error);
            this.clearAutoSave(formId);
        }
    }

    showRestoreNotification(form, clearCallback) {
        const notification = document.createElement('div');
        notification.className = 'autosave-notification';
        notification.innerHTML = `
            <div class="autosave-content">
                <p>Previous form data was restored</p>
                <button type="button" class="autosave-clear">Clear</button>
                <button type="button" class="autosave-dismiss">×</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            background: var(--primary);
            color: white;
            padding: var(--spacing-3) var(--spacing-4);
            border-radius: var(--radius-lg);
            margin-bottom: var(--spacing-4);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: var(--font-size-sm);
        `;
        
        form.insertBefore(notification, form.firstChild);
        
        // Event listeners
        notification.querySelector('.autosave-clear').addEventListener('click', () => {
            clearCallback();
            notification.remove();
        });
        
        notification.querySelector('.autosave-dismiss').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-dismiss
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    clearAutoSave(formId) {
        localStorage.removeItem(`autosave_${formId}`);
    }

    validateCreditCard(number) {
        // Basic Luhn algorithm implementation
        const digits = number.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;
        
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    // Custom validator registration
    addValidator(name, testFunction, message) {
        this.validators.set(name, {
            test: testFunction,
            message: message
        });
    }

    // Custom submission handler registration
    addSubmissionHandler(formId, handler) {
        this.submitCallbacks.set(formId, handler);
    }

    // Utility function
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

// Initialize form system
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FormSystem = new FormSystem();
    });
} else {
    window.FormSystem = new FormSystem();
}