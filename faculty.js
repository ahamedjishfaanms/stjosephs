// Configuration
const GOOGLE_SHEETS_API_KEY = 'AIzaSyDfV560Qe0YuL6nRvfxiFhahCFQbR-igtM';
const SPREADSHEET_ID = '10RGLEh-7edbD7fsLk976a5Zp_SYwvzkAbdlh_tEMO_Q';
const SHEET_NAME = 'Faculties';
const RANGE = 'A:Z';

// DOM Elements
const facultiesContainer = document.getElementById('faculties-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const facultyModal = document.getElementById('faculty-modal');
const closeModal = document.querySelector('.close-modal');
const modalBody = document.querySelector('.modal-body');
const searchInput = document.getElementById('faculty-search');
const filterButtons = document.querySelectorAll('.filter-btn');

// Global Variables
let allFaculties = [];
let displayedFaculties = [];
let currentDisplayCount = 8;
const incrementCount = 8;

// Fetch data from Google Sheets
async function fetchFacultyData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data.values) {
            const headers = data.values[0].map(header => header.toLowerCase().replace(/\s+/g, '_'));
            
            allFaculties = data.values.slice(1).map(row => {
                let faculty = {};
                headers.forEach((header, index) => {
                    faculty[header] = row[index] || '';
                });
                return faculty;
            });
            
            displayedFaculties = [...allFaculties];
            displayFaculties();
            document.querySelector('.preloader').classList.add('loaded');
        } else {
            throw new Error('No data found in the spreadsheet');
        }
    } catch (error) {
        console.error('Error fetching faculty data:', error);
        allFaculties = getMockFacultyData();
        displayedFaculties = [...allFaculties];
        displayFaculties();
        document.querySelector('.preloader').classList.add('loaded');
    }
}

// Rest of your faculty.js code remains the same...

// Display faculties in the grid
function displayFaculties() {
    // Clear existing content
    facultiesContainer.innerHTML = '';
    
    // Get the subset to display
    const facultiesToDisplay = displayedFaculties.slice(0, currentDisplayCount);
    
    // Create cards for each faculty
    facultiesToDisplay.forEach(faculty => {
        const card = createFacultyCard(faculty);
        facultiesContainer.appendChild(card);
    });
    
    // Show/hide load more button
    if (currentDisplayCount < displayedFaculties.length) {
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Create a faculty card element
function createFacultyCard(faculty) {
    const card = document.createElement('div');
    card.className = 'faculty-card';
    card.dataset.department = faculty.department ? faculty.department.toLowerCase().replace(/\s+/g, '-') : '';
    
    // Image or default avatar
    const imageHTML = faculty.image_url ? 
        `<img src="${faculty.image_url}" alt="${faculty.name}">` : 
        `<div class="default-avatar"><i class="fas fa-user-tie"></i></div>`;
    
    // Social media links
    const socialHTML = `
        ${faculty.linkedin ? `<a href="${faculty.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ''}
        ${faculty.email ? `<a href="mailto:${faculty.email}"><i class="fas fa-envelope"></i></a>` : ''}
        ${faculty.whatsapp ? `<a href="https://wa.me/${faculty.whatsapp}" target="_blank"><i class="fab fa-whatsapp"></i></a>` : ''}
    `;
    
    card.innerHTML = `
        <div class="faculty-image">
            ${imageHTML}
        </div>
        <div class="faculty-info">
            <h2>${faculty.name || 'Faculty Name'}</h2>
            <div class="department">${faculty.department || 'Department'}</div>
            <div class="position">${faculty.position || 'Position'}</div>
            <div class="faculty-social">
                ${socialHTML}
            </div>
            <button class="profile-btn" data-id="${faculty.id || ''}">View Profile</button>
        </div>
    `;
    
    // Add click event to view profile
    card.querySelector('.profile-btn').addEventListener('click', () => {
        showFacultyModal(faculty);
    });
    
    return card;
}

// Show faculty modal with details
function showFacultyModal(faculty) {
    // Image or default avatar
    const imageHTML = faculty.image_url ? 
        `<img src="${faculty.image_url}" alt="${faculty.name}">` : 
        `<div class="default-avatar"><i class="fas fa-user-tie"></i></div>`;
    
    // Social media links
    const socialHTML = `
        ${faculty.linkedin ? `<a href="${faculty.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ''}
        ${faculty.email ? `<a href="mailto:${faculty.email}"><i class="fas fa-envelope"></i></a>` : ''}
        ${faculty.whatsapp ? `<a href="https://wa.me/${faculty.whatsapp}" target="_blank"><i class="fab fa-whatsapp"></i></a>` : ''}
        ${faculty.twitter ? `<a href="${faculty.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
        ${faculty.research_gate ? `<a href="${faculty.research_gate}" target="_blank"><i class="fab fa-researchgate"></i></a>` : ''}
    `;
    
    // Qualifications list
    const qualificationsHTML = faculty.qualifications ? 
        `<ul>${faculty.qualifications.split('\n').map(q => `<li>${q}</li>`).join('')}</ul>` : 
        '<p>No qualifications listed.</p>';
    
    // Research interests
    const researchHTML = faculty.research_interests ? 
        `<ul>${faculty.research_interests.split('\n').map(r => `<li>${r}</li>`).join('')}</ul>` : 
        '<p>No research interests listed.</p>';
    
    // Contact info
    const contactHTML = `
        ${faculty.email ? `<p><i class="fas fa-envelope"></i> ${faculty.email}</p>` : ''}
        ${faculty.phone ? `<p><i class="fas fa-phone"></i> ${faculty.phone}</p>` : ''}
        ${faculty.office ? `<p><i class="fas fa-map-marker-alt"></i> ${faculty.office}</p>` : ''}
    `;
    
    modalBody.innerHTML = `
        <div class="modal-image">
            ${imageHTML}
        </div>
        <div class="modal-details">
            <div class="modal-header">
                <h2>${faculty.name || 'Faculty Name'}</h2>
                <div class="department">${faculty.department || 'Department'}</div>
                <div class="position">${faculty.position || 'Position'}</div>
                <div class="modal-social">
                    ${socialHTML}
                </div>
            </div>
            
            <div class="modal-bio">
                <h3>About</h3>
                <p>${faculty.bio || 'No biography available.'}</p>
            </div>
            
            <div class="modal-qualifications">
                <h4>Qualifications</h4>
                ${qualificationsHTML}
            </div>
            
            <div class="modal-research">
                <h4>Research Interests</h4>
                ${researchHTML}
            </div>
            
            <div class="modal-contact">
                <h4>Contact</h4>
                ${contactHTML}
            </div>
        </div>
    `;
    
    // Show modal
    facultyModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Filter faculties by department
function filterFaculties(department) {
    if (department === 'all') {
        displayedFaculties = [...allFaculties];
    } else {
        displayedFaculties = allFaculties.filter(faculty => {
            const facultyDept = faculty.department ? faculty.department.toLowerCase().replace(/\s+/g, '-') : '';
            return facultyDept.includes(department);
        });
    }
    
    // Reset display count
    currentDisplayCount = 8;
    
    // Display filtered results
    displayFaculties();
}

// Search faculties by name
function searchFaculties(query) {
    if (!query) {
        displayedFaculties = [...allFaculties];
    } else {
        const lowerQuery = query.toLowerCase();
        displayedFaculties = allFaculties.filter(faculty => {
            const name = faculty.name ? faculty.name.toLowerCase() : '';
            return name.includes(lowerQuery);
        });
    }
    
    // Reset display count
    currentDisplayCount = 8;
    
    // Display search results
    displayFaculties();
}

// Mock data for demonstration
function getMockFacultyData() {
    return [
        {
            id: 1,
            name: "Dr. Jane Doe",
            department: "Computer Science",
            position: "Professor",
            bio: "Dr. Jane Doe specializes in Artificial Intelligence and Machine Learning with over 15 years of teaching experience.",
            qualifications: "Ph.D. in Computer Science\nM.Sc. in Data Science\nB.Sc. in Computer Engineering",
            research_interests: "Machine Learning\nNatural Language Processing\nComputer Vision",
            email: "jane.doe@example.com",
            phone: "+1234567890",
            office: "CS Building, Room 205",
            linkedin: "https://linkedin.com/in/janedoe",
            whatsapp: "1234567890",
            twitter: "https://twitter.com/janedoe",
            research_gate: "https://researchgate.net/profile/jane_doe",
            image_url: "Image/download.jpg"
        },
        {
            id: 2,
            name: "Dr. John Smith",
            department: "Mathematics",
            position: "Associate Professor",
            bio: "Dr. John Smith is an expert in Applied Mathematics and has published numerous papers in top-tier journals.",
            qualifications: "Ph.D. in Mathematics\nM.Sc. in Applied Mathematics\nB.Sc. in Pure Mathematics",
            research_interests: "Numerical Analysis\nDifferential Equations\nMathematical Modeling",
            email: "john.smith@example.com",
            phone: "+0987654321",
            office: "Math Building, Room 112",
            linkedin: "https://linkedin.com/in/johnsmith",
            whatsapp: "987654321",
            image_url: "Image/download.jpg"
        },
        // Add more mock faculty data as needed
    ];
}

// Event Listeners
loadMoreBtn.addEventListener('click', () => {
    currentDisplayCount += incrementCount;
    displayFaculties();
});

closeModal.addEventListener('click', () => {
    facultyModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', (e) => {
    if (e.target === facultyModal) {
        facultyModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

searchInput.addEventListener('input', (e) => {
    searchFaculties(e.target.value);
});

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        filterFaculties(button.dataset.department);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchFacultyData();
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    document.body.classList.toggle('menu-open');
});

// Close submenus when clicking elsewhere
document.addEventListener('click', (e) => {
    if (!e.target.closest('.about') && !e.target.closest('.activities')) {
        document.querySelectorAll('.sub-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});