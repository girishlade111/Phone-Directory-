/**
 * Google Apps Script for Phone Directory Web App
 * This script handles POST requests from the add.html form
 * and adds new entries to the Google Sheet
 */

function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.openById('1huaeuW4wszb1F8eTytVi4RC_T88fZwpTDZgiJs8u5RY').getActiveSheet();
    
    // Get form data from the POST request
    const params = e.parameter;
    
    // Create timestamp
    const timestamp = new Date();
    
    // Prepare row data in the correct order matching sheet headers
    // Headers: Timestamp, Name, Role, ContactNo, WhatsApp, Email, Instagram, Threads, Address
    const rowData = [
      timestamp,
      params.name || '',
      params.role || '',
      params.contactNo || '',
      params.whatsapp || '',
      params.email || '',
      params.instagram || '',
      params.threads || '',
      params.address || ''
    ];
    
    // Append the new row to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput('Success')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    // Log error for debugging
    console.error('Error in doPost:', error);
    
    // Return error response
    return ContentService
      .createTextOutput('Error: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Test function to verify the script works
 * You can run this in the Apps Script editor to test
 */
function testDoPost() {
  const testEvent = {
    parameter: {
      name: 'Test User',
      role: 'Test Role',
      contactNo: '+1234567890',
      whatsapp: '+1234567890',
      email: 'test@example.com',
      instagram: 'https://instagram.com/test',
      threads: 'https://threads.net/@test',
      address: '123 Test Street, Test City'
    }
  };
  
  const result = doPost(testEvent);
  console.log('Test result:', result.getContent());
}

/**
 * Function to set up the sheet with proper headers
 * Run this once to initialize your sheet
 */
function setupSheet() {
  const sheet = SpreadsheetApp.openById('1huaeuW4wszb1F8eTytVi4RC_T88fZwpTDZgiJs8u5RY').getActiveSheet();
  
  // Set headers in the first row
  const headers = [
    'Timestamp',
    'Name', 
    'Role',
    'ContactNo',
    'WhatsApp',
    'Email',
    'Instagram',
    'Threads',
    'Address'
  ];
  
  // Clear the first row and set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format the header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f1f3f4');
  
  console.log('Sheet setup complete with headers:', headers);
}