// Google Apps Script code for Code.gs

// Global variables
const SHEET_NAME = "Sheet1";
const HEADERS = ["id", "date", "agency", "location", "hours", "rate", "daySalary", "paymentStatus", "amountReceived", "receivedDate", "taxStatus"];

// Utility function to generate UUID
function generateUUID() {
  return Utilities.getUuid();
}

// Handle different HTTP methods
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // Set CORS headers
  var headers = {
    'Access-Control-Allow-Origin': 'https://sathish-ponnusamy.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    var result;
    
    if (e.method === 'GET') {
      result = getShifts();
    } else if (e.method === 'POST') {
      var data = JSON.parse(e.postData.contents);
      result = addShift(data);
    } else if (e.method === 'PUT') {
      var data = JSON.parse(e.postData.contents);
      result = updateShift(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Function to get all shifts
function getShifts() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  var shifts = [];
  
  // Skip header row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var shift = {};
    
    // Map column values to object properties
    for (var j = 0; j < HEADERS.length; j++) {
      shift[HEADERS[j]] = row[j];
    }
    
    shifts.push(shift);
  }
  
  return shifts;
}

// Function to add a new shift
function addShift(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  
  // Generate a unique ID
  data.id = generateUUID();
  
  // Create array of values in the same order as headers
  var values = HEADERS.map(header => data[header] || '');
  
  // Append the new row
  sheet.appendRow(values);
  
  return data;
}

// Function to update an existing shift
function updateShift(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // Find the row with matching ID
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.id) {
      // Update the row with new values
      for (var j = 0; j < HEADERS.length; j++) {
        values[i][j] = data[HEADERS[j]] || values[i][j];
      }
      
      // Write the updated values back to the sheet
      dataRange.setValues(values);
      return data;
    }
  }
  
  throw new Error('Shift not found');
}

// Handle CORS preflight requests
function doOptions(e) {
  var headers = {
    'Access-Control-Allow-Origin': 'https://sathish-ponnusamy.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, PUT',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}