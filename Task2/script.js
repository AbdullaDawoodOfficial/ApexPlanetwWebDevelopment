
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let todoFilter = 'all';
let gallery = [];
let currentImageIndex = 0;


const contactForm = document.getElementById('contact-form');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-button');
const addImagesBtn = document.getElementById('add-images');
const imageInput = document.getElementById('image-input');
const galleryGrid = document.getElementById('gallery-grid');
const galleryFilter = document.getElementById('gallery-filter');
const imageModal = document.getElementById('image-modal');
const modalImage = document.getElementById('modal-image');
const closeModal = document.querySelector('.close-modal');
const favoriteBtn = document.getElementById('favorite-button');
const deleteBtn = document.getElementById('delete-button');
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');


document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeContactForm();
    initializeTodoList();
    initializeGallery();
    loadDefaultImages();
});


function initializeNavigation() {
   
    mobileMenu.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

 
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                navMenu.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    });
}

function initializeContactForm() {
   
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearError(input));
    });

    contactForm.addEventListener('submit', handleFormSubmit);
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = document.getElementById(`${fieldName}-error`);
    let isValid = true;
    let errorMessage = '';


    field.classList.remove('error', 'success');

    switch (fieldName) {
        case 'name':
            if (!value) {
                errorMessage = 'Full name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                errorMessage = 'Name can only contain letters and spaces';
                isValid = false;
            }
            break;

        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = 'Email address is required';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;

        case 'phone':
            if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s|-|\(|\)/g, ''))) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
            break;

        case 'subject':
            if (!value) {
                errorMessage = 'Please select a subject';
                isValid = false;
            }
            break;

        case 'message':
            if (!value) {
                errorMessage = 'Message is required';
                isValid = false;
            } else if (value.length < 10) {
                errorMessage = 'Message must be at least 10 characters';
                isValid = false;
            } else if (value.length > 1000) {
                errorMessage = 'Message must be less than 1000 characters';
                isValid = false;
            }
            break;
    }

    if (errorElement) {
        errorElement.textContent = errorMessage;
    }

    field.classList.add(isValid ? 'success' : 'error');
    return isValid;
}

function clearError(field) {
    const errorElement = document.getElementById(`${field.name}-error`);
    if (errorElement && field.classList.contains('error')) {
        field.classList.remove('error');
        errorElement.textContent = '';
    }
}

function validateForm() {
    const requiredFields = ['name', 'email', 'subject', 'message'];
    let isFormValid = true;

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!validateField(field)) {
            isFormValid = false;
        }
    });

    // Validate optional phone field if filled
    const phoneField = document.getElementById('phone');
    if (phoneField.value.trim()) {
        if (!validateField(phoneField)) {
            isFormValid = false;
        }
    }

    return isFormValid;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const submitButton = contactForm.querySelector('.submit-button');
    const submitText = document.getElementById('submit-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const formSuccess = document.getElementById('form-success');

    
    submitButton.disabled = true;
    submitText.style.display = 'none';
    loadingSpinner.style.display = 'block';

  
    setTimeout(() => {
      
        contactForm.style.display = 'none';
        formSuccess.style.display = 'block';
        
        
        setTimeout(() => {
            contactForm.reset();
            contactForm.style.display = 'block';
            formSuccess.style.display = 'none';
            submitButton.disabled = false;
            submitText.style.display = 'block';
            loadingSpinner.style.display = 'none';
          
            const inputs = contactForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('error', 'success');
            });
            
           
            const errorMessages = contactForm.querySelectorAll('.error-message');
            errorMessages.forEach(error => {
                error.textContent = '';
            });
        }, 5000);
    }, 2000);
}


function initializeTodoList() {
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            todoFilter = e.target.dataset.filter;
            updateFilterButtons();
            renderTodos();
        });
    });

    renderTodos();
    updateTaskCount();
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(todo);
    saveTodos();
    todoInput.value = '';
    renderTodos();
    updateTaskCount();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

function toggleTodo(id) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
    updateTaskCount();
}

function editTodo(id, newText) {
    todos = todos.map(todo => 
        todo.id === id ? { ...todo, text: newText } : todo
    );
    saveTodos();
    renderTodos();
}

function getFilteredTodos() {
    switch (todoFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function renderTodos() {
    const filteredTodos = getFilteredTodos();
    
    todoList.innerHTML = filteredTodos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="toggleTodo(${todo.id})"></div>
            <span class="todo-text" ondblclick="startEdit(this, ${todo.id})">${escapeHtml(todo.text)}</span>
            <div class="todo-actions">
                <button class="todo-button edit-button" onclick="startEdit(this.previousElementSibling, ${todo.id})">Edit</button>
                <button class="todo-button delete-button" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        </li>
    `).join('');
}

function startEdit(textElement, id) {
    const currentText = textElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'todo-text';
    input.style.background = 'rgba(255, 255, 255, 0.1)';
    input.style.border = '2px solid #6366f1';
    input.style.borderRadius = '5px';
    input.style.padding = '5px';
    input.style.color = 'white';

    const finishEdit = () => {
        const newText = input.value.trim();
        if (newText && newText !== currentText) {
            editTodo(id, newText);
        } else {
            textElement.textContent = currentText;
            textElement.style.display = 'block';
        }
        input.remove();
    };

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') finishEdit();
    });
    
    input.addEventListener('blur', finishEdit);

    textElement.style.display = 'none';
    textElement.parentNode.insertBefore(input, textElement.nextSibling);
    input.focus();
    input.select();
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
    updateTaskCount();
}

function updateFilterButtons() {
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === todoFilter);
    });
}

function updateTaskCount() {
    const activeTodos = todos.filter(todo => !todo.completed).length;
    taskCount.textContent = `${activeTodos} task${activeTodos !== 1 ? 's' : ''} remaining`;
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}


function initializeGallery() {
    addImagesBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleImageUpload);
    galleryFilter.addEventListener('change', filterGallery);
    closeModal.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeImageModal();
    });
    favoriteBtn.addEventListener('click', toggleFavorite);
    deleteBtn.addEventListener('click', deleteImage);
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    favorite: false,
                    uploadDate: new Date().toISOString()
                };
                gallery.push(imageData);
                saveGallery();
                renderGallery();
            };
            reader.readAsDataURL(file);
        }
    });
    
    e.target.value = '';
}

function loadDefaultImages() {
    const defaultImages = [
        {
            id: 1,
            src: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=500',
            name: 'Mountain Landscape',
            favorite: false,
            uploadDate: new Date().toISOString()
        },
        {
            id: 2,
            src: 'https://images.pexels.com/photos/1563256/pexels-photo-1563256.jpeg?auto=compress&cs=tinysrgb&w=500',
            name: 'Ocean Sunset',
            favorite: true,
            uploadDate: new Date().toISOString()
        },
        {
            id: 3,
            src: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=500',
            name: 'Forest Path',
            favorite: false,
            uploadDate: new Date().toISOString()
        },
        {
            id: 4,
            src: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=500',
            name: 'City Architecture',
            favorite: false,
            uploadDate: new Date().toISOString()
        },
        {
            id: 5,
            src: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=500',
            name: 'Flower Field',
            favorite: true,
            uploadDate: new Date().toISOString()
        },
        {
            id: 6,
            src: 'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=500',
            name: 'Abstract Art',
            favorite: false,
            uploadDate: new Date().toISOString()
        }
    ];

    if (gallery.length === 0) {
        gallery = defaultImages;
        saveGallery();
    }
    renderGallery();
}

function renderGallery() {
    const filteredGallery = getFilteredGallery();
    
    galleryGrid.innerHTML = filteredGallery.map(image => `
        <div class="gallery-item" onclick="openImageModal(${image.id})">
            <img src="${image.src}" alt="${escapeHtml(image.name)}" loading="lazy">
            <div class="gallery-overlay">
                <div class="gallery-info">
                    <div>${escapeHtml(image.name)}</div>
                    ${image.favorite ? '<div>❤️ Favorite</div>' : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function getFilteredGallery() {
    const filter = galleryFilter.value;
    switch (filter) {
        case 'recent':
            return [...gallery].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        case 'favorites':
            return gallery.filter(img => img.favorite);
        default:
            return gallery;
    }
}

function filterGallery() {
    renderGallery();
}

function openImageModal(imageId) {
    const image = gallery.find(img => img.id === imageId);
    if (!image) return;

    currentImageIndex = gallery.findIndex(img => img.id === imageId);
    modalImage.src = image.src;
    modalImage.alt = image.name;
    
    favoriteBtn.classList.toggle('active', image.favorite);
    favoriteBtn.style.background = image.favorite ? '#ef4444' : '#6b7280';
    
    imageModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    imageModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function toggleFavorite() {
    if (currentImageIndex >= 0 && currentImageIndex < gallery.length) {
        gallery[currentImageIndex].favorite = !gallery[currentImageIndex].favorite;
        const isFavorite = gallery[currentImageIndex].favorite;
        
        favoriteBtn.classList.toggle('active', isFavorite);
        favoriteBtn.style.background = isFavorite ? '#ef4444' : '#6b7280';
        
        saveGallery();
        renderGallery();
    }
}

function deleteImage() {
    if (currentImageIndex >= 0 && currentImageIndex < gallery.length) {
        const confirmDelete = confirm('Are you sure you want to delete this image?');
        if (confirmDelete) {
            gallery.splice(currentImageIndex, 1);
            saveGallery();
            renderGallery();
            closeImageModal();
        }
    }
}

function saveGallery() {
    localStorage.setItem('gallery', JSON.stringify(gallery));
}

function loadGallery() {
    const savedGallery = localStorage.getItem('gallery');
    if (savedGallery) {
        gallery = JSON.parse(savedGallery);
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

document.addEventListener('keydown', (e) => {
  
    if (e.key === 'Escape' && imageModal.style.display === 'block') {
        closeImageModal();
    }

    if (imageModal.style.display === 'block') {
        if (e.key === 'ArrowLeft' && currentImageIndex > 0) {
            currentImageIndex--;
            const prevImage = gallery[currentImageIndex];
            modalImage.src = prevImage.src;
            modalImage.alt = prevImage.name;
            favoriteBtn.classList.toggle('active', prevImage.favorite);
            favoriteBtn.style.background = prevImage.favorite ? '#ef4444' : '#6b7280';
        } else if (e.key === 'ArrowRight' && currentImageIndex < gallery.length - 1) {
            currentImageIndex++;
            const nextImage = gallery[currentImageIndex];
            modalImage.src = nextImage.src;
            modalImage.alt = nextImage.name;
            favoriteBtn.classList.toggle('active', nextImage.favorite);
            favoriteBtn.style.background = nextImage.favorite ? '#ef4444' : '#6b7280';
        }
    }
});

loadGallery();

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});


window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
    }
});

function debounce(func, wait) {
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

const debouncedScrollHandler = debounce(() => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0, 0, 0, 0.8)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.1)';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

console.log('🚀 Web Development Skills Portfolio loaded successfully!');
console.log('📝 Contact form with validation');
console.log('✅ Dynamic to-do list with localStorage');
console.log('🖼️ Interactive image gallery with modal');
console.log('📱 Fully responsive design with Flexbox and Grid');