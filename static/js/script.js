const sections = document.querySelectorAll('.snap-section');

// Initialize navigation functionality
function initNavigation() {
    console.log('Navigation initialized'); // Basic console log
    
    const getStartedBtn = document.querySelector('button');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            console.log('Get Started button clicked'); // Log when button is clicked
            if (sections.length > 1) {
                console.log('Scrolling to second section');
                sections[1].scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Make all down arrows clickable
    const downArrows = document.querySelectorAll('.down-arrow');
    console.log(`Found ${downArrows.length} down arrows`); // Log with variable interpolation
    
    downArrows.forEach((arrow, index) => {
        arrow.style.cursor = 'pointer'; // Make it look clickable
        arrow.addEventListener('click', () => {
            console.log(`Down arrow ${index + 1} clicked`); // Log with index number
            
            // Find the next section
            if (index < sections.length - 1) {
                console.log(`Scrolling to section ${index + 2}`);
                sections[index + 1].scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Typing animation functionality
function initTypingAnimation() {
    const phrases = [
        "Study Habit Tracker",
        "Learning Progress Manager",
        "Productivity Time Organiser",
        "Academic Success Planner",
        "Daily Achievement Logger"
    ];
    
    const colors = [
        "typing-color-1",
        "typing-color-2",
        "typing-color-3",
        "typing-color-4",
        "typing-color-5"
    ];

    const typingElement = document.getElementById('typing-animation');
    if (!typingElement) return;
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100; // Base typing speed in milliseconds
    
    function typeText() {
        const currentPhrase = phrases[phraseIndex];
        
        // Apply the colour for this phrase
        typingElement.className = "typing-text " + colors[phraseIndex];

        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Faster when deleting
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal speed when typing
        }
        
        // If we finished typing the current phrase
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 1000; // Pause at the end of phrase
        }
        
        // If we finished deleting the current phrase
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length; // Move to next phrase
            typingSpeed = 500; // Pause before starting new phrase
        }
        
        // Schedule the next frame
        setTimeout(typeText, typingSpeed);
    }
    
    // Start the animation
    setTimeout(typeText, 500);
}

// Dashboard Slider functionality
function initDashboardSlider() {
    const slides = document.querySelectorAll('.slider-slide');
    const dots = document.querySelectorAll('.slider-dot');
    let currentSlide = 0;
    const slideInterval = 3000; // 3 seconds
    
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.style.opacity = 0;
        });
        
        // Show the current slide
        slides[index].style.opacity = 1;
        
        // Update dots
        dots.forEach(dot => {
            dot.classList.remove('slider-dot-active');
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white/50');
        });
        
        dots[index].classList.add('slider-dot-active', 'bg-white');
        dots[index].classList.remove('bg-white/50');
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    // Set up click handlers for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Initialize slider
    showSlide(0);
    
    // Start automatic sliding
    setInterval(nextSlide, slideInterval);
}

// Start everything when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded'); // Log when page is ready
    initNavigation();
    initTypingAnimation();
    initDashboardSlider();
});

// Additional log when all resources are loaded
window.addEventListener('load', () => {
    console.log('Page fully loaded with all resources');
});

//(UPLOAD) provides the user with visual feedback when they select a file
function updateFileName() {
    const input = document.getElementById('file');
    const fileNameDisplay = document.getElementById('file-name');
    
    if (input.files.length > 0) {
        fileNameDisplay.textContent = input.files[0].name;
    } else {
        fileNameDisplay.textContent = 'No file selected';
    }
}


//(UPLOAD) displays the current value fo the productivity rating slider
function updateRatingValue(val) {
    document.getElementById('rating-value').textContent = val;
}