// Configuration
const SHEET_ID = '1huaeuW4wszb1F8eTytVi4RC_T88fZwpTDZgiJs8u5RY';
const API_KEY = 'AIzaSyCl9iFfxfVzJ-LXqgtwGCzSBnHus-1xWTA';
const SHEET_RANGE = 'Sheet1!A:I'; // Adjust range if your sheet has a different name
const API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;

// Multiple CSV URL formats to try
const CSV_URLS = [
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`
];

// Global variables
let allContacts = [];
let filteredContacts = [];
let displayedContacts = [];
let contactsPerPage = 6;
let currentPage = 1;

// DOM elements
const loadingElement = document.getElementById('loading');
const directoryGrid = document.getElementById('directoryGrid');
const searchInput = document.getElementById('searchInput');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize theme system
    initializeTheme();
    
    // Create animated sparkles background
    createSparklesBackground();
    
    // Load contacts from Google Sheets
    await loadContacts();
    
    // Set up search functionality
    setupSearch();
});



// Load contacts from Google Sheets
async function loadContacts() {
    try {
        showLoading(true);
        
        // Try Google Sheets API first
        let contacts = await loadFromAPI();
        
        // If API fails, try CSV fallback
        if (!contacts || contacts.length === 0) {
            console.log('API failed, trying CSV fallback...');
            contacts = await loadFromCSV();
        }
        
        // If both fail, show sample data for testing
        if (!contacts || contacts.length === 0) {
            console.log('Both API and CSV failed, showing sample data...');
            contacts = getSampleData();
        }
        
        allContacts = contacts;
        filteredContacts = [...allContacts];
        currentPage = 1;
        
        renderContactsWithPagination();
        showLoading(false);
        
    } catch (error) {
        console.error('Error loading contacts:', error);
        // Show sample data instead of error for testing
        console.log('Showing sample data due to error...');
        allContacts = getSampleData();
        filteredContacts = [...allContacts];
        currentPage = 1;
        renderContactsWithPagination();
        showLoading(false);
    }
}

// Get sample data for testing
function getSampleData() {
    return [
        {
            name: 'John Doe',
            role: 'Software Engineer',
            contactno: '+1234567890',
            whatsapp: '+1234567890',
            email: 'john.doe@company.com',
            instagram: 'https://instagram.com/johndoe',
            threads: 'https://threads.net/@johndoe',
            address: '123 Main St, New York, NY 10001'
        },
        {
            name: 'Jane Smith',
            role: 'Product Manager',
            contactno: '+1987654321',
            whatsapp: '+1987654321',
            email: 'jane.smith@company.com',
            instagram: 'https://instagram.com/janesmith',
            threads: 'https://threads.net/@janesmith',
            address: '456 Oak Ave, San Francisco, CA 94102'
        },
        {
            name: 'Mike Johnson',
            role: 'UI/UX Designer',
            contactno: '+1555123456',
            whatsapp: '+1555123456',
            email: 'mike.johnson@company.com',
            instagram: 'https://instagram.com/mikejohnson',
            threads: '',
            address: '789 Pine St, Seattle, WA 98101'
        },
        {
            name: 'Sarah Wilson',
            role: 'Marketing Head',
            contactno: '+1444987654',
            whatsapp: '+1444987654',
            email: 'sarah.wilson@company.com',
            instagram: '',
            threads: 'https://threads.net/@sarahwilson',
            address: '321 Elm St, Austin, TX 73301'
        }
    ];
}

// Load contacts using Google Sheets API
async function loadFromAPI() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data.values || data.values.length < 2) {
            console.log('No data found in sheet');
            return [];
        }
        
        return parseAPIData(data.values);
        
    } catch (error) {
        console.error('API loading failed:', error);
        return null;
    }
}

// Load contacts using CSV export
async function loadFromCSV() {
    for (const url of CSV_URLS) {
        try {
            console.log('Trying CSV URL:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
                console.log(`CSV request failed for ${url}: ${response.status}`);
                continue;
            }
            
            const csvText = await response.text();
            console.log('CSV Response length:', csvText.length);
            console.log('CSV Response preview:', csvText.substring(0, 300));
            
            if (csvText.trim().length === 0) {
                console.log('Empty CSV response');
                continue;
            }
            
            const contacts = parseCSV(csvText);
            if (contacts.length > 0) {
                console.log('Successfully parsed contacts from CSV:', contacts.length);
                return contacts;
            }
            
        } catch (error) {
            console.error(`CSV loading failed for ${url}:`, error);
            continue;
        }
    }
    
    throw new Error('All CSV loading attempts failed');
}

// Parse Google Sheets API response
function parseAPIData(values) {
    if (values.length < 2) return [];
    
    const headers = values[0].map(header => header.toLowerCase().replace(/\s+/g, ''));
    const contacts = [];
    
    for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const contact = {};
        
        headers.forEach((header, index) => {
            contact[header] = row[index] || '';
        });
        
        // Only add contacts with required fields
        if (contact.name && contact.name.trim()) {
            contacts.push(contact);
        }
    }
    
    console.log('Parsed contacts from API:', contacts);
    return contacts;
}

// Parse CSV text into contact objects
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    // Get headers from first line
    const headers = lines[0].split(',').map(header => header.replace(/"/g, '').trim());
    
    // Parse data rows
    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
            const contact = {};
            headers.forEach((header, index) => {
                contact[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
            });
            
            // Only add contacts with required fields
            if (contact.name && contact.name.trim()) {
                contacts.push(contact);
            }
        }
    }
    
    return contacts;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    values.push(current.trim());
    return values;
}

// Render contacts in the grid
function renderContacts(contacts) {
    if (contacts.length === 0) {
        directoryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6c757d;">
                <i data-lucide="users" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                <p>No contacts found.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    directoryGrid.innerHTML = contacts.map((contact, index) => createContactCard(contact, index)).join('');
    lucide.createIcons();
    
    // Add event listeners for address tooltips
    setupAddressTooltips();
}

// Create HTML for a single contact card
function createContactCard(contact, index) {
    const name = contact.name || 'Unknown';
    const role = contact.role || 'No role specified';
    const contactNo = contact.contactno || '';
    const whatsapp = contact.whatsapp || '';
    const email = contact.email || '';
    const instagram = contact.instagram || '';
    const threads = contact.threads || '';
    const address = contact.address || '';
    
    return `
        <div class="contact-card clickable-card" onclick="showContactDetails(${index})" data-contact-index="${index}">
            <div class="contact-name">${escapeHtml(name)}</div>
            <div class="contact-role">${escapeHtml(role)}</div>
            <div class="contact-links" onclick="event.stopPropagation()">
                ${contactNo ? `<a href="tel:${contactNo}" class="contact-link" title="Call ${name}">
                    <i data-lucide="phone"></i>
                </a>` : ''}
                ${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^\d]/g, '')}" target="_blank" class="contact-link" title="WhatsApp ${name}">
                    <i data-lucide="message-circle"></i>
                </a>` : ''}
                ${email ? `<a href="mailto:${email}" class="contact-link" title="Email ${name}">
                    <i data-lucide="mail"></i>
                </a>` : ''}
                ${instagram ? `<a href="${instagram}" target="_blank" class="contact-link" title="Instagram Profile">
                    <i data-lucide="instagram"></i>
                </a>` : ''}
                ${threads ? `<a href="${threads}" target="_blank" class="contact-link" title="Threads Profile">
                    <i data-lucide="at-sign"></i>
                </a>` : ''}
                ${address ? `<div class="contact-link address-tooltip" title="Address">
                    <i data-lucide="map-pin"></i>
                    <div class="tooltip-content">${escapeHtml(address)}</div>
                </div>` : ''}
            </div>
            <div class="click-hint">
                <i data-lucide="eye"></i>
                Click to view details
            </div>
        </div>
    `;
}

// Render contacts with pagination
function renderContactsWithPagination() {
    if (filteredContacts.length === 0) {
        directoryGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i data-lucide="users" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                <p>No contacts found.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    // Calculate contacts to display
    const startIndex = 0;
    const endIndex = currentPage * contactsPerPage;
    displayedContacts = filteredContacts.slice(startIndex, endIndex);
    
    // Render contact cards
    const contactsHTML = displayedContacts.map((contact, index) => {
        // Use the original index from filteredContacts for modal functionality
        const originalIndex = filteredContacts.indexOf(contact);
        return createContactCard(contact, originalIndex);
    }).join('');
    
    // Check if there are more contacts to load
    const hasMoreContacts = endIndex < filteredContacts.length;
    
    // Create load more button if needed
    const loadMoreButton = hasMoreContacts ? `
        <div class="load-more-container" style="grid-column: 1 / -1; text-align: center; margin-top: 2rem;">
            <button class="load-more-btn" onclick="loadMoreContacts()">
                <i data-lucide="chevron-down"></i>
                Load More (${filteredContacts.length - endIndex} remaining)
            </button>
        </div>
    ` : '';
    
    // Update the grid
    directoryGrid.innerHTML = contactsHTML + loadMoreButton;
    lucide.createIcons();
    
    // Add event listeners for address tooltips
    setupAddressTooltips();
}

// Load more contacts function
function loadMoreContacts() {
    currentPage++;
    renderContactsWithPagination();
    
    // Smooth scroll to the new content
    setTimeout(() => {
        const newCards = document.querySelectorAll('.contact-card');
        if (newCards.length > (currentPage - 1) * contactsPerPage) {
            const targetCard = newCards[(currentPage - 1) * contactsPerPage];
            if (targetCard) {
                targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 100);
}

// Set up search functionality with pagination reset
function setupSearch() {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredContacts = [...allContacts];
        } else {
            filteredContacts = allContacts.filter(contact => {
                const name = (contact.name || '').toLowerCase();
                const role = (contact.role || '').toLowerCase();
                return name.includes(searchTerm) || role.includes(searchTerm);
            });
        }
        
        // Reset pagination when searching
        currentPage = 1;
        renderContactsWithPagination();
    });
}

// Set up address tooltips
function setupAddressTooltips() {
    const tooltips = document.querySelectorAll('.address-tooltip');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('click', (e) => {
            e.preventDefault();
            // Toggle tooltip visibility on mobile
            const content = tooltip.querySelector('.tooltip-content');
            content.style.opacity = content.style.opacity === '1' ? '0' : '1';
            content.style.visibility = content.style.visibility === 'visible' ? 'hidden' : 'visible';
        });
    });
}

// Show/hide loading state
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
    directoryGrid.style.display = show ? 'none' : 'grid';
}

// Show error message
function showError(message) {
    directoryGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #dc3545;">
            <i data-lucide="alert-circle" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
            <p>${escapeHtml(message)}</p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #0d6efd; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Retry
            </button>
        </div>
    `;
    lucide.createIcons();
}

// Show contact details in modal
function showContactDetails(index) {
    const contact = filteredContacts[index];
    if (!contact) return;
    
    const name = contact.name || 'Unknown';
    const role = contact.role || 'No role specified';
    const contactNo = contact.contactno || '';
    const whatsapp = contact.whatsapp || '';
    const email = contact.email || '';
    const instagram = contact.instagram || '';
    const threads = contact.threads || '';
    const address = contact.address || '';
    const timestamp = contact.timestamp || '';
    
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="contactModal" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${escapeHtml(name)}</h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="briefcase"></i>
                            Role
                        </div>
                        <div class="detail-value">${escapeHtml(role)}</div>
                    </div>
                    
                    ${contactNo ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="phone"></i>
                            Contact Number
                        </div>
                        <div class="detail-value">
                            <a href="tel:${contactNo}" class="detail-link">${escapeHtml(contactNo)}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${whatsapp ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="message-circle"></i>
                            WhatsApp
                        </div>
                        <div class="detail-value">
                            <a href="https://wa.me/${whatsapp.replace(/[^\d]/g, '')}" target="_blank" class="detail-link">${escapeHtml(whatsapp)}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${email ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="mail"></i>
                            Email
                        </div>
                        <div class="detail-value">
                            <a href="mailto:${email}" class="detail-link">${escapeHtml(email)}</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${instagram ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="instagram"></i>
                            Instagram
                        </div>
                        <div class="detail-value">
                            <a href="${instagram}" target="_blank" class="detail-link">View Profile</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${threads ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="at-sign"></i>
                            Threads
                        </div>
                        <div class="detail-value">
                            <a href="${threads}" target="_blank" class="detail-link">View Profile</a>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${address ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="map-pin"></i>
                            Address
                        </div>
                        <div class="detail-value">${escapeHtml(address)}</div>
                    </div>
                    ` : ''}
                    
                    ${timestamp ? `
                    <div class="contact-detail-item">
                        <div class="detail-label">
                            <i data-lucide="calendar"></i>
                            Added On
                        </div>
                        <div class="detail-value">${escapeHtml(new Date(timestamp).toLocaleDateString())}</div>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <div class="modal-actions">
                        ${contactNo ? `<a href="tel:${contactNo}" class="action-btn primary">
                            <i data-lucide="phone"></i>
                            Call
                        </a>` : ''}
                        ${whatsapp ? `<a href="https://wa.me/${whatsapp.replace(/[^\d]/g, '')}" target="_blank" class="action-btn success">
                            <i data-lucide="message-circle"></i>
                            WhatsApp
                        </a>` : ''}
                        ${email ? `<a href="mailto:${email}" class="action-btn secondary">
                            <i data-lucide="mail"></i>
                            Email
                        </a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize icons in modal
    lucide.createIcons();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('contactModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Theme System
function initializeTheme() {
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Create theme toggle button
    createThemeToggle();
}

function createThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i data-lucide="sun"></i>';
    themeToggle.title = 'Toggle theme';
    themeToggle.onclick = toggleTheme;
    
    // Add to header
    const header = document.querySelector('.header');
    if (header) {
        header.appendChild(themeToggle);
    }
    
    // Update icon based on current theme
    updateThemeIcon();
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeToggle = document.querySelector('.theme-toggle');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'dark' 
            ? '<i data-lucide="moon"></i>' 
            : '<i data-lucide="sun"></i>';
        lucide.createIcons();
    }
}

// Optimized Animated Sparkles Background
function createSparklesBackground() {
    // Reduce sparkles on mobile for better performance
    const isMobile = window.innerWidth <= 768;
    const sparkleCount = isMobile ? 15 : 25;
    const sparkleInterval = isMobile ? 800 : 500;
    
    const sparklesContainer = document.createElement('div');
    sparklesContainer.className = 'sparkles-container';
    document.body.appendChild(sparklesContainer);
    
    // Create initial sparkles (reduced count)
    for (let i = 0; i < sparkleCount; i++) {
        createSparkle(sparklesContainer);
    }
    
    // Continuously add new sparkles (less frequent)
    setInterval(() => {
        // Limit total sparkles to prevent performance issues
        if (sparklesContainer.children.length < sparkleCount * 2) {
            createSparkle(sparklesContainer);
        }
    }, sparkleInterval);
}

function createSparkle(container) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    
    // Random position
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    
    // Random size
    const size = Math.random() * 4 + 2;
    sparkle.style.width = size + 'px';
    sparkle.style.height = size + 'px';
    
    // Random animation duration
    const duration = Math.random() * 3 + 2;
    sparkle.style.animationDuration = duration + 's';
    
    // Random delay
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    
    container.appendChild(sparkle);
    
    // Remove sparkle after animation
    setTimeout(() => {
        if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle);
        }
    }, (duration + 2) * 1000);
}