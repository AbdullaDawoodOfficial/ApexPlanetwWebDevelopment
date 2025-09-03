
const quizQuestions = [
  {
    question: "Which CSS property is used to create responsive layouts?",
    options: ["display: flex", "position: absolute", "float: left", "margin: auto"],
    correct: 0,
    explanation: "Flexbox (display: flex) is one of the most powerful tools for creating responsive layouts."
  },
  {
    question: "What does 'API' stand for?",
    options: ["Application Programming Interface", "Automated Program Integration", "Advanced Programming Instructions", "Application Process Integration"],
    correct: 0,
    explanation: "API stands for Application Programming Interface, allowing different software applications to communicate."
  },
  {
    question: "Which JavaScript method is used to fetch data from an API?",
    options: ["getData()", "fetch()", "request()", "loadData()"],
    correct: 1,
    explanation: "The fetch() method is the modern way to make HTTP requests in JavaScript."
  },
  {
    question: "What is the purpose of media queries in CSS?",
    options: ["To play media files", "To create responsive designs", "To query databases", "To optimize images"],
    correct: 1,
    explanation: "Media queries allow you to apply different styles based on device characteristics like screen size."
  },
  {
    question: "Which HTML5 semantic element is best for main navigation?",
    options: ["<div>", "<header>", "<nav>", "<menu>"],
    correct: 2,
    explanation: "The <nav> element is specifically designed for navigation links and improves accessibility."
  }
];


const galleryImages = [
  {
    url: "https://imgs.search.brave.com/yp3iUBT9RJF1_j7daNog27l84q4L_OrrebAWRwjMfz0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/ZnJlZS1waG90by9w/YWludGluZy1tb3Vu/dGFpbi1sYWtlLXdp/dGgtbW91bnRhaW4t/YmFja2dyb3VuZF8x/ODg1NDQtOTEyNi5q/cGc",
    title: "Mountain Lake",
    description: "A serene mountain lake reflecting the sky and surrounding peaks."
  },
  {
    url: "https://images.pexels.com/photos/1438832/pexels-photo-1438832.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Forest Path",
    description: "A winding path through a dense, green forest."
  },
  {
    url: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Ocean Sunset",
    description: "Golden sunset over the ocean with gentle waves."
  },
  {
    url: "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Desert Dunes",
    description: "Rolling sand dunes under a clear blue sky."
  },
  {
    url: "https://images.pexels.com/photos/1612461/pexels-photo-1612461.jpeg?auto=compress&cs=tinysrgb&w=1200",
    title: "Snowy Mountains",
    description: "Snow-capped mountain peaks against a winter sky."
  }
];


let currentQuestionIndex = 0;
let selectedAnswer = null;
let quizScore = 0;
let currentImageIndex = 0;

// DOM Elements
const questionTitle = document.getElementById('question-title');
const questionText = document.getElementById('question-text');
const quizOptions = document.getElementById('quiz-options');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const quizResult = document.getElementById('quiz-result');
const finalScore = document.getElementById('final-score');
const progressFill = document.getElementById('progress-fill');

// Carousel Elements
const carouselTrack = document.getElementById('carousel-track');
const carouselIndicators = document.getElementById('carousel-indicators');
const prevBtn = document.getElementById('prev-btn');
const nextBtnCarousel = document.getElementById('next-btn-carousel');
const imageTitle = document.getElementById('image-title');
const imageDescription = document.getElementById('image-description');

// Navigation
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  initializeQuiz();
  initializeCarousel();
  initializeNavigation();
  fetchInitialData();
  
  // Add smooth scrolling to navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').substring(1);
      scrollToSection(targetId);
    });
  });
});

// Quiz Functions
function initializeQuiz() {
  displayQuestion();
  
  nextBtn.addEventListener('click', handleNextQuestion);
  restartBtn.addEventListener('click', restartQuiz);
}

function displayQuestion() {
  if (currentQuestionIndex >= quizQuestions.length) {
    showQuizResult();
    return;
  }
  
  const question = quizQuestions[currentQuestionIndex];
  
  questionTitle.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  questionText.textContent = question.question;
  
  // Update progress bar
  const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;
  progressFill.style.width = `${progress}%`;
  
  // Clear previous options
  quizOptions.innerHTML = '';
  
  // Create option buttons
  question.options.forEach((option, index) => {
    const optionButton = document.createElement('button');
    optionButton.className = 'quiz-option';
    optionButton.textContent = option;
    optionButton.addEventListener('click', () => selectAnswer(index, optionButton));
    quizOptions.appendChild(optionButton);
  });
  
  selectedAnswer = null;
  nextBtn.disabled = true;
}

function selectAnswer(answerIndex, buttonElement) {
  // Remove previous selections
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Mark current selection
  buttonElement.classList.add('selected');
  selectedAnswer = answerIndex;
  nextBtn.disabled = false;
}

function handleNextQuestion() {
  if (selectedAnswer === null) return;
  
  const question = quizQuestions[currentQuestionIndex];
  const isCorrect = selectedAnswer === question.correct;
  
  if (isCorrect) {
    quizScore++;
  }
  
  // Show correct/incorrect styling
  document.querySelectorAll('.quiz-option').forEach((option, index) => {
    if (index === question.correct) {
      option.classList.add('correct');
    } else if (index === selectedAnswer && !isCorrect) {
      option.classList.add('incorrect');
    }
  });
  
  // Disable all options
  document.querySelectorAll('.quiz-option').forEach(option => {
    option.disabled = true;
  });
  
  setTimeout(() => {
    currentQuestionIndex++;
    displayQuestion();
  }, 1500);
}

function showQuizResult() {
  const percentage = Math.round((quizScore / quizQuestions.length) * 100);
  
  questionTitle.style.display = 'none';
  progressFill.style.width = '100%';
  quizOptions.style.display = 'none';
  nextBtn.style.display = 'none';
  restartBtn.style.display = 'inline-flex';
  quizResult.style.display = 'block';
  
  finalScore.textContent = `You scored ${quizScore} out of ${quizQuestions.length} (${percentage}%)`;
  
  // Add performance message
  let message = '';
  if (percentage >= 80) {
    message = 'Excellent work! You have a great understanding of web development concepts.';
  } else if (percentage >= 60) {
    message = 'Good job! You have a solid foundation, keep learning!';
  } else {
    message = 'Keep studying! Practice makes perfect in web development.';
  }
  
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  finalScore.appendChild(messageElement);
}

function restartQuiz() {
  currentQuestionIndex = 0;
  selectedAnswer = null;
  quizScore = 0;
  
  questionTitle.style.display = 'block';
  quizOptions.style.display = 'grid';
  nextBtn.style.display = 'inline-flex';
  restartBtn.style.display = 'none';
  quizResult.style.display = 'none';
  
  displayQuestion();
}

// Carousel Functions
function initializeCarousel() {
  createCarouselSlides();
  createCarouselIndicators();
  updateCarouselInfo();
  
  prevBtn.addEventListener('click', () => navigateCarousel('prev'));
  nextBtnCarousel.addEventListener('click', () => navigateCarousel('next'));
  
  // Auto-play carousel
  setInterval(() => {
    navigateCarousel('next');
  }, 5000);
}

function createCarouselSlides() {
  galleryImages.forEach((image, index) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    
    const img = document.createElement('img');
    img.src = image.url;
    img.alt = image.title;
    img.loading = 'lazy';
    
    slide.appendChild(img);
    carouselTrack.appendChild(slide);
  });
}

function createCarouselIndicators() {
  galleryImages.forEach((_, index) => {
    const indicator = document.createElement('button');
    indicator.className = 'carousel-indicator';
    if (index === 0) indicator.classList.add('active');
    
    indicator.addEventListener('click', () => {
      currentImageIndex = index;
      updateCarousel();
    });
    
    carouselIndicators.appendChild(indicator);
  });
}

function navigateCarousel(direction) {
  if (direction === 'next') {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
  } else {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
  }
  updateCarousel();
}

function updateCarousel() {
  const translateX = -currentImageIndex * 20; // 20% per slide (5 slides = 100% / 5)
  carouselTrack.style.transform = `translateX(${translateX}%)`;
  
  // Update indicators
  document.querySelectorAll('.carousel-indicator').forEach((indicator, index) => {
    indicator.classList.toggle('active', index === currentImageIndex);
  });
  
  updateCarouselInfo();
}

function updateCarouselInfo() {
  const currentImage = galleryImages[currentImageIndex];
  imageTitle.textContent = currentImage.title;
  imageDescription.textContent = currentImage.description;
}

// Navigation Functions
function initializeNavigation() {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = section.offsetTop - headerHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
    
    // Close mobile menu
    navToggle.classList.remove('active');
    navMenu.classList.remove('active');
  }
}

// API Functions
async function fetchQuote() {
  try {
    const response = await fetch('https://api.quotable.io/random');
    const data = await response.json();
    
    document.getElementById('quote-text').textContent = `"${data.content}"`;
    document.getElementById('quote-author').textContent = `— ${data.author}`;
  } catch (error) {
    document.getElementById('quote-text').textContent = 'Failed to load quote. Please try again.';
    document.getElementById('quote-author').textContent = '';
    console.error('Error fetching quote:', error);
  }
}

async function fetchFact() {
  try {
    const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
    const data = await response.json();
    
    document.getElementById('fact-text').textContent = data.text;
  } catch (error) {
    document.getElementById('fact-text').textContent = 'Failed to load fact. Please try again.';
    console.error('Error fetching fact:', error);
  }
}

async function fetchUser() {
  try {
    const response = await fetch('https://randomuser.me/api/');
    const data = await response.json();
    const user = data.results[0];
    
    document.getElementById('user-name').textContent = `${user.name.first} ${user.name.last}`;
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-location').textContent = `${user.location.city}, ${user.location.country}`;
    
    const avatar = document.getElementById('user-avatar');
    avatar.src = user.picture.medium;
    avatar.style.display = 'block';
  } catch (error) {
    document.getElementById('user-name').textContent = 'Failed to load user data';
    document.getElementById('user-email').textContent = '';
    document.getElementById('user-location').textContent = '';
    console.error('Error fetching user:', error);
  }
}

async function fetchInitialData() {
  // Load initial data for all API sections
  await fetchQuote();
  await fetchFact();
  await fetchUser();
}

// Scroll Effects
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.98)';
  } else {
    header.style.background = 'rgba(255, 255, 255, 0.95)';
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
    }
  });
}, observerOptions);

// Observe sections for animations
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    observer.observe(section);
  });
});

// Global functions for button clicks
window.scrollToSection = scrollToSection;
window.fetchQuote = fetchQuote;
window.fetchFact = fetchFact;
window.fetchUser = fetchUser;

// Error handling for API calls
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Optionally show user-friendly error message
});

// Service Worker registration (for future PWA capabilities)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Service worker would be registered here in a production app
    console.log('Service Worker support detected');
  });
}