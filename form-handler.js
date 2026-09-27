// Google Apps Script Web App URL - You'll need to replace this with your deployed script URL
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

// DOM elements
const entryForm = document.getElementById('entryForm');
const messageElement = document.getElementById('message');
const submitButton = entryForm.querySelector('.submit-btn');

// Initialize the form
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Set up form submission
    setupForm();
});

// Set up form submission handling
function setupForm() {
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable submit button and show loading state
        setSubmitState(true);
        hideMessage();
        
        try {
            // Collect form data
            const formData = new FormData(entryForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate required fields
            if (!validateForm(data)) {
                setSubmitState(false);
                return;
            }
            
            // Submit data to Google Apps Script
            await submitData(data);
            
            // Show success message and reset form
            showMessage('Entry added successfully!', 'success');
            entryForm.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showMessage('Failed to add entry. Please try again.', 'error');
        } finally {
            setSubmitState(false);
        }
    });
}

// Validate form data
function validateForm(data) {
    const requiredFields = ['name', 'role', 'contactNo', 'email'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
        if (!data[field] || !data[field].trim()) {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        showMessage(`Please fill in all required fields: ${missingFields.join(', ')}`, 'error');
        return false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Validate URLs if provided
    const urlFields = ['instagram', 'threads'];
    for (const field of urlFields) {
        if (data[field] && data[field].trim()) {
            try {
                new URL(data[field]);
            } catch {
                showMessage(`Please enter a valid URL for ${field}.`, 'error');
                return false;
            }
        }
    }
    
    return true;
}

// Submit data to Google Apps Script
async function submitData(data) {
    // For now, we'll simulate the submission since the Google Apps Script URL needs to be configured
    // Replace this with actual fetch call once the script is deployed
    
    if (SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
        // Simulate API call for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Form data that would be submitted:', data);
        return;
    }
    
    const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.text();
    console.log('Submission result:', result);
}

// Set submit button state
function setSubmitState(loading) {
    const buttonText = submitButton.querySelector('span') || submitButton.lastChild;
    const buttonIcon = submitButton.querySelector('i');
    
    if (loading) {
        submitButton.disabled = true;
        if (buttonIcon) {
            buttonIcon.setAttribute('data-lucide', 'loader-2');
            buttonIcon.style.animation = 'spin 1s linear infinite';
        }
        if (buttonText && buttonText.nodeType === Node.TEXT_NODE) {
            buttonText.textContent = ' Submitting...';
        }
    } else {
        submitButton.disabled = false;
        if (buttonIcon) {
            buttonIcon.setAttribute('data-lucide', 'plus-circle');
            buttonIcon.style.animation = '';
        }
        if (buttonText && buttonText.nodeType === Node.TEXT_NODE) {
            buttonText.textContent = ' Add Entry';
        }
    }
    
    // Recreate icons to apply changes
    lucide.createIcons();
}

// Show message to user
function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide message
function hideMessage() {
    messageElement.className = 'message hidden';
}