// Fetch data from Google Sheets
const apiKey = 'AIzaSyCivBCcZjlTguFQoznSyIF0lsnuuFLd0Nk';
const spreadsheetId = '135F7ofjwaD2pUEYxdj9WfGyhWYWJiALZTZ0ftKob34k';
const range = 'Sheet1!A2:H';

async function fetchData() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

// Preloader functionality
function setupPreloader() {
  const preloader = document.querySelector('.preloader');
  
  // Hide preloader when everything is loaded or after max 5 seconds
  const hidePreloader = () => {
    preloader.classList.add('loaded');
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 500); // Match this with the CSS transition time
  };

  // Hide when page is fully loaded
  window.addEventListener('load', hidePreloader);

  // Maximum 5 seconds fallback
  setTimeout(hidePreloader, 5000);
}

// Populate Slideshow
async function populateSlideshow() {
  const data = await fetchData();
  const slideshow = document.querySelector('.slideshow .slides');
  if (slideshow && data.length) {
    slideshow.innerHTML = data.map(row => `
      <div class="slide">
        <img src="${row[0] || ''}" alt="${row[1] || ''}">
      </div>
    `).join('');
    initializeSlideshow();
  }
}

// Initialize Slideshow
function initializeSlideshow() {
  const slides = document.querySelectorAll('.slideshow .slide');
  if (!slides.length) return;

  const totalSlides = slides.length;
  let slideIndex = 0;
  let slideInterval;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
    });
  }

  function startSlider() {
    slideInterval = setInterval(() => {
      slideIndex = (slideIndex + 1) % totalSlides;
      showSlide(slideIndex);
    }, 5000);
  }

  function stopSlider() {
    clearInterval(slideInterval);
  }

  // Pause on hover
  const slideshowContainer = document.querySelector('.slideshow');
  if (slideshowContainer) {
    slideshowContainer.addEventListener('mouseenter', stopSlider);
    slideshowContainer.addEventListener('mouseleave', startSlider);
  }

  // Manual Navigation
  const prevBtn = document.querySelector('.slideshow .prev');
  const nextBtn = document.querySelector('.slideshow .next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopSlider();
      slideIndex = (slideIndex - 1 + totalSlides) % totalSlides;
      showSlide(slideIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopSlider();
      slideIndex = (slideIndex + 1) % totalSlides;
      showSlide(slideIndex);
    });
  }

  // Initialize
  showSlide(slideIndex);
  startSlider();
}

// Populate News Ticker
async function populateNewsTicker() {
  const data = await fetchData();
  const newsTicker = document.getElementById('news-ticker-content');
  if (newsTicker && data.length) {
    newsTicker.innerHTML = data.map(row => `
      <a href="${row[2] || '#'}" target="_blank">${row[1] || ''}</a> |
    `).join('');

    const newsTickerElement = document.querySelector('.news-ticker span');
    if (newsTickerElement) {
      newsTickerElement.style.animationPlayState = 'running';
      newsTickerElement.addEventListener('mouseenter', () => {
        newsTickerElement.style.animationPlayState = 'paused';
      });
      newsTickerElement.addEventListener('mouseleave', () => {
        newsTickerElement.style.animationPlayState = 'running';
      });
    }
  }
}

// Populate Blog Posts
async function populateBlogPosts() {
  const data = await fetchData();
  const blogPostsContainer = document.getElementById('blog-posts');
  if (blogPostsContainer && data.length) {
    blogPostsContainer.innerHTML = data.map(row => `
      <div class="blog-post">
        <div class="blog-thumbnail">
          <img src="${row[3] || ''}" alt="${row[4] || ''}">
        </div>
        <div class="blog-content">
          <h3>${row[4] || ''}</h3>
          <p>${row[5] || ''}</p>
          <a href="${row[7] || '#'}" class="btn">${row[6] || 'Read More'}</a>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.blog-post').forEach(post => {
      post.addEventListener('click', () => {
        const thumbnail = post.querySelector('.blog-thumbnail img')?.src;
        const heading = post.querySelector('.blog-content h3')?.textContent;
        const description = post.querySelector('.blog-content p')?.textContent;
        const buttonLink = post.querySelector('.blog-content .btn')?.href;
        if (thumbnail && heading && description && buttonLink) {
          openModal(thumbnail, heading, description, buttonLink);
        }
      });
    });
  }
}

// Modal functionality
function setupModal() {
  const modal = document.getElementById('blog-modal');
  if (!modal) return;

  const modalThumbnail = document.getElementById('modal-thumbnail');
  const modalHeading = document.getElementById('modal-heading');
  const modalDescription = document.getElementById('modal-description');
  const modalButton = document.getElementById('modal-button');
  const closeModal = document.querySelector('.close');

  function openModal(thumbnail, heading, description, buttonLink) {
    if (modalThumbnail) modalThumbnail.src = thumbnail;
    if (modalHeading) modalHeading.textContent = heading;
    if (modalDescription) modalDescription.textContent = description;
    if (modalButton) modalButton.href = buttonLink;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  if (closeModal) {
    closeModal.addEventListener('click', closeModalFunc);
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModalFunc();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      closeModalFunc();
    }
  });

  return openModal;
}

// Mobile Navigation
function setupMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const activitiesLink = document.querySelector('.nav-links .activities');
  const aboutLink = document.querySelector('.nav-links .about');
  const body = document.body;

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
      body.classList.toggle('menu-open');
    });
  }

  // Update the about/activities click handlers
  if (activitiesLink) {
    activitiesLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        // Only prevent default if clicking the parent link (not submenu items)
        if (e.target === activitiesLink.querySelector('a')) {
          e.preventDefault();
          e.stopPropagation();
          activitiesLink.classList.toggle('active');
        }
      }
    });
  }

  if (aboutLink) {
    aboutLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        // Only prevent default if clicking the parent link (not submenu items)
        if (e.target === aboutLink.querySelector('a')) {
          e.preventDefault();
          e.stopPropagation();
          aboutLink.classList.toggle('active');
        }
      }
    });
  }

  // Close menu when clicking on a regular link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        // For regular links (not submenu parents), close the menu
        if (!link.parentElement.classList.contains('about') && 
            !link.parentElement.classList.contains('activities')) {
          setTimeout(() => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            body.classList.remove('menu-open');
          }, 300);
        }
      }
    });
  });
}

// Testimonial Slider - Modern Implementation
function setupTestimonialSlider() {
  const track = document.querySelector('.testimonial-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');
  
  if (!track || !cards.length) return;
  
  let currentIndex = 0;
  const cardCount = cards.length;
  
  // Create dots
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.slider-dot');
  
  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }
  
  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }
  
  function nextSlide() {
    currentIndex = (currentIndex + 1) % cardCount;
    updateSlider();
  }
  
  function prevSlide() {
    currentIndex = (currentIndex - 1 + cardCount) % cardCount;
    updateSlider();
  }
  
  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  // Auto-advance
  let slideInterval = setInterval(nextSlide, 5000);
  
  // Pause on hover
  track.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  
  track.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
  });
  
  // Initialize
  updateSlider();
}

// Contact Form Handling
function setupContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name')?.value;
      const email = document.getElementById('email')?.value;
      const message = document.getElementById('message')?.value;

      if (!name || !email || !message) {
        showAlert('Please fill out all fields.', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showAlert('Please enter a valid email address.', 'error');
        return;
      }

      try {
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        showAlert('Thank you for contacting us! We will get back to you soon.', 'success');
        contactForm.reset();
      } catch (error) {
        showAlert('There was an error submitting your message. Please try again.', 'error');
        console.error('Form submission error:', error);
      }
    });
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  
  const contactSection = document.querySelector('.contact-form-section');
  if (contactSection) {
    contactSection.insertBefore(alertDiv, contactSection.firstChild);
    
    setTimeout(() => {
      alertDiv.style.opacity = '0';
      setTimeout(() => {
        alertDiv.remove();
      }, 500);
    }, 3000);
  } else {
    alert(message);
  }
}

// About Section Image Slider
function setupAboutSlider() {
  const aboutSlides = document.querySelectorAll('.image-slider .slide');
  if (!aboutSlides.length) return;

  let currentAboutSlide = 0;
  let aboutSlideInterval;

  function showAboutSlide(index) {
    aboutSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  function startAboutSlider() {
    aboutSlideInterval = setInterval(() => {
      currentAboutSlide = (currentAboutSlide + 1) % aboutSlides.length;
      showAboutSlide(currentAboutSlide);
    }, 5000);
  }

  function stopAboutSlider() {
    clearInterval(aboutSlideInterval);
  }

  // Manual Navigation
  const prevBtn = document.querySelector('.slider-prev');
  const nextBtn = document.querySelector('.slider-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      stopAboutSlider();
      currentAboutSlide = (currentAboutSlide - 1 + aboutSlides.length) % aboutSlides.length;
      showAboutSlide(currentAboutSlide);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      stopAboutSlider();
      currentAboutSlide = (currentAboutSlide + 1) % aboutSlides.length;
      showAboutSlide(currentAboutSlide);
    });
  }

  // Pause on hover
  const aboutSlider = document.querySelector('.image-slider');
  if (aboutSlider) {
    aboutSlider.addEventListener('mouseenter', stopAboutSlider);
    aboutSlider.addEventListener('mouseleave', startAboutSlider);
  }

  // Initialize
  showAboutSlide(currentAboutSlide);
  startAboutSlider();
}

// Animated counter for stats
function setupAnimatedCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const aboutStats = document.querySelector('.about-stats');
  if (aboutStats) {
    observer.observe(aboutStats);
  }

  function animateCounters() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-count')) || 0;
      const duration = 2000;
      const step = target / (duration / 16);
      
      let current = 0;
      const counter = setInterval(() => {
        current += step;
        if (current >= target) {
          clearInterval(counter);
          stat.textContent = target.toLocaleString();
        } else {
          stat.textContent = Math.floor(current).toLocaleString();
        }
      }, 16);
    });
  }
}

// Video Controls
function setupVideoControls() {
  const videoContainer = document.querySelector('.video-container');
  if (!videoContainer) return;

  const video = videoContainer.querySelector('video');
  if (!video) return;

  // Ensure video plays when it's in the viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(videoContainer);

  // Click to play/pause
  videoContainer.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
}

// Initialize Particles.js
function initParticles() {
  if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#BE3144"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          }
        },
        "opacity": {
          "value": 0.3,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 40,
            "size_min": 0.1,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#BE3144",
          "opacity": 0.2,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": true,
            "mode": "grab"
          },
          "onclick": {
            "enable": true,
            "mode": "push"
          },
          "resize": true
        },
        "modes": {
          "grab": {
            "distance": 140,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 400,
            "size": 40,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 200,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    });
  }
}

// Update your script.js with this testimonial slider code
function setupTestimonialSlider() {
  const track = document.querySelector('.testimonial-track');
  const cards = document.querySelectorAll('.testimonial-card');
  const dotsContainer = document.querySelector('.slider-dots');
  const prevBtn = document.querySelector('.prev-arrow');
  const nextBtn = document.querySelector('.next-arrow');
  
  if (!track || !cards.length) return;
  
  let currentIndex = 0;
  const cardCount = cards.length;
  
  // Create dots
  cards.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('slider-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.slider-dot');
  
  function updateSlider() {
    cards.forEach((card, index) => {
      card.classList.toggle('active', index === currentIndex);
    });
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }
  
  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }
  
  function nextSlide() {
    currentIndex = (currentIndex + 1) % cardCount;
    updateSlider();
  }
  
  function prevSlide() {
    currentIndex = (currentIndex - 1 + cardCount) % cardCount;
    updateSlider();
  }
  
  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  
  // Auto-advance
  let slideInterval = setInterval(nextSlide, 5000);
  
  // Pause on hover
  track.addEventListener('mouseenter', () => {
    clearInterval(slideInterval);
  });
  
  track.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
  });
  
  // Initialize
  updateSlider();
}

// Facilities Horizontal Scroller
function setupFacilitiesScroller() {
  const facilitiesTrack = document.querySelector('.facilities-track');
  if (!facilitiesTrack) return;

  // Clone all cards for seamless looping
  const cards = facilitiesTrack.querySelectorAll('.facility-card');
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    facilitiesTrack.appendChild(clone);
  });

  // Adjust animation duration based on number of cards
  const cardCount = cards.length;
  const animationDuration = cardCount * 3; // 3 seconds per card
  facilitiesTrack.style.animationDuration = `${animationDuration}s`;

  // Pause animation when hovering
  facilitiesTrack.addEventListener('mouseenter', () => {
    facilitiesTrack.style.animationPlayState = 'paused';
  });

  facilitiesTrack.addEventListener('mouseleave', () => {
    facilitiesTrack.style.animationPlayState = 'running';
  });
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

// Initialize all components
function initializeAll() {
  // Setup preloader first
  setupPreloader();
  
  // Then setup all other components
  setupMobileNav();
  setupTestimonialSlider();
  setupContactForm();
  setupAboutSlider();
  setupAnimatedCounters();
  setupVideoControls();
  setupFacilitiesScroller();
  setupSmoothScrolling();
  initParticles();
  
  // Load data-dependent components
  populateSlideshow();
  populateNewsTicker();
  populateBlogPosts();
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeAll);