// Initialize variables
let currentInvoiceNumber = parseInt(localStorage.getItem('lastInvoiceNumber') || '1000');
let darkMode = localStorage.getItem('darkMode') === 'true';

// DOM Elements
const form = document.getElementById('invoiceForm');
const darkModeToggle = document.getElementById('darkModeToggle');
const loadExcelBtn = document.getElementById('loadExcel');
const excelFileInput = document.getElementById('excelFile');
const logoInput = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');
const invoiceNumber = document.getElementById('invoiceNumber');
const addItemBtn = document.getElementById('addItem');
const itemsBody = document.getElementById('itemsBody');
const searchInput = document.getElementById('searchInvoice');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Form field IDs to save
const formFields = [
    'businessName',
    'businessAddress',
    'businessContact',
    'taxId',
    'clientName',
    'clientAddress',
    'invoiceDate',
    'paymentTerms',
    'currency',
    'taxRate',
    'discountRate',
    'notes',
    'terms',
    'bankDetails'
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    setTheme();
    loadBusinessInfo();
    setInvoiceNumber();
    addItemRow();
    setCurrentDate();
    setupTabHandlers();
    loadStoredInvoices();
});

// Tab Handlers
function setupTabHandlers() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
    });
    
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
}

// Theme Toggle
darkModeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    setTheme();
});

function setTheme() {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    darkModeToggle.innerHTML = darkMode ? 
        '<i class="fas fa-sun"></i>' : 
        '<i class="fas fa-moon"></i>';
}

// Business Info Management
function loadBusinessInfo() {
    formFields.forEach(field => {
        const value = localStorage.getItem(field);
        if (value) document.getElementById(field).value = value;
    });
    
    const storedLogo = localStorage.getItem('logo');
    if (storedLogo) {
        logoPreview.src = storedLogo;
        logoPreview.style.display = 'block';
    }
}

function saveBusinessInfo() {
    formFields.forEach(field => {
        localStorage.setItem(field, document.getElementById(field).value);
    });
}

// Logo Management
logoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block';
            localStorage.setItem('logo', e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Invoice Number Management
function setInvoiceNumber() {
    invoiceNumber.value = `INV-${currentInvoiceNumber}`;
}

function incrementInvoiceNumber() {
    currentInvoiceNumber++;
    localStorage.setItem('lastInvoiceNumber', currentInvoiceNumber);
    setInvoiceNumber();
}

// Set current date
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;
}

// Line Items Management
addItemBtn.addEventListener('click', addItemRow);

function addItemRow() {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><input type="text" class="item-description" required></td>
        <td><input type="number" class="item-quantity" value="1" min="1" required></td>
        <td><input type="number" class="item-rate" value="0" min="0" step="0.01" required></td>
        <td><span class="item-amount">0.00</span></td>
        <td>
            <button type="button" class="delete-row icon-button">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    itemsBody.appendChild(row);

    // Add event listeners for calculations
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateTotals);
    });

    row.querySelector('.delete-row').addEventListener('click', () => {
        row.remove();
        calculateTotals();
    });
}

// Calculations
function calculateTotals() {
    let subtotal = 0;
    const rows = itemsBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = quantity * rate;
        row.querySelector('.item-amount').textContent = amount.toFixed(2);
        subtotal += amount;
    });

    document.getElementById('subtotal').textContent = subtotal.toFixed(2);

    const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
    const discountRate = parseFloat(document.getElementById('discountRate').value) || 0;

    const taxAmount = subtotal * (taxRate / 100);
    const discountAmount = subtotal * (discountRate / 100);
    const total = subtotal + taxAmount - discountAmount;

    document.getElementById('taxAmount').textContent = taxAmount.toFixed(2);
    document.getElementById('discountAmount').textContent = discountAmount.toFixed(2);
    document.getElementById('total').textContent = total.toFixed(2);
    
    return {
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        total
    };
}

// Add event listeners for tax and discount inputs
document.getElementById('taxRate').addEventListener('input', calculateTotals);
document.getElementById('discountRate').addEventListener('input', calculateTotals);

// Get all form data
function getFormData() {
    const calculations = calculateTotals();
    
    return {
        // Invoice details
        invoiceNumber: invoiceNumber.value,
        date: document.getElementById('invoiceDate').value,
        paymentTerms: document.getElementById('paymentTerms').value,
        currency: document.getElementById('currency').value,
        
        // Business details
        businessName: document.getElementById('businessName').value,
        businessAddress: document.getElementById('businessAddress').value,
        businessContact: document.getElementById('businessContact').value,
        taxId: document.getElementById('taxId').value,
        logo: localStorage.getItem('logo'),
        
        // Client details
        clientName: document.getElementById('clientName').value,
        clientAddress: document.getElementById('clientAddress').value,
        
        // Items
        items: Array.from(itemsBody.querySelectorAll('tr')).map(row => ({
            description: row.querySelector('.item-description').value,
            quantity: row.querySelector('.item-quantity').value,
            rate: row.querySelector('.item-rate').value,
            amount: row.querySelector('.item-amount').textContent
        })),
        
        // Calculations
        subtotal: calculations.subtotal.toFixed(2),
        taxRate: calculations.taxRate,
        taxAmount: calculations.taxAmount.toFixed(2),
        discountRate: calculations.discountRate,
        discountAmount: calculations.discountAmount.toFixed(2),
        total: calculations.total.toFixed(2),
        
        // Additional information
        notes: document.getElementById('notes').value,
        terms: document.getElementById('terms').value,
        bankDetails: document.getElementById('bankDetails').value
    };
}

// Save to Excel file in the same directory
function saveToExcel(invoice) {
    // Get existing invoices from file if it exists
    let invoices = [];
    try {
        const existingWorkbook = XLSX.readFile('invoices.xlsx');
        const firstSheet = existingWorkbook.Sheets[existingWorkbook.SheetNames[0]];
        invoices = XLSX.utils.sheet_to_json(firstSheet);
    } catch (error) {
        // File doesn't exist yet, start with empty array
        invoices = [];
    }
    
    // Add new invoice
    invoices.push(invoice);
    
    // Save to local storage for viewing
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Create workbook and save
    const ws = XLSX.utils.json_to_sheet(invoices);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
    XLSX.writeFile(wb, 'invoices.xlsx');
    
    // Refresh the invoice list and switch to it
    displayInvoices(invoices);
    switchTab('invoiceList');
}

// --- NEW BUTTON HANDLERS ---
const generateInvoiceBtn = document.getElementById('generateInvoiceBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Generate Invoice: Save to localStorage only
if (generateInvoiceBtn) {
    generateInvoiceBtn.addEventListener('click', function() {
        saveBusinessInfo();
        const invoice = getFormData();
        // Save to localStorage
        let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        displayInvoices(invoices);
        switchTab('invoiceList');
        incrementInvoiceNumber();
        alert('Invoice saved!');
    });
}

// Export All Invoices to Excel
const exportAllBtn = document.getElementById('exportAllBtn');
if (exportAllBtn) {
    exportAllBtn.addEventListener('click', function() {
        let invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        if (invoices.length === 0) {
            alert('No invoices to export!');
            return;
        }
        const ws = XLSX.utils.json_to_sheet(invoices);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Invoices');
        XLSX.writeFile(wb, 'invoices.xlsx');
    });
}


// Download PDF: Only download PDF, do not save to Excel
if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', async function() {
        saveBusinessInfo();
        const invoice = getFormData();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const invoiceElement = document.querySelector('#newInvoice');
        const canvas = await html2canvas(invoiceElement, {
            scale: 2,
            backgroundColor: getComputedStyle(document.body).getPropertyValue('--card-background')
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
    });
}

// Clear form when switching to New Invoice tab
const newInvoiceTabBtn = document.querySelector('.tab-button[data-tab="newInvoice"]');
if (newInvoiceTabBtn) {
    newInvoiceTabBtn.addEventListener('click', clearInvoiceForm);
}

function clearInvoiceForm() {
    formFields.forEach(field => {
        const el = document.getElementById(field);
        if (el.tagName === 'SELECT') {
            el.selectedIndex = 0;
        } else {
            el.value = '';
        }
    });
    // Clear items
    itemsBody.innerHTML = '';
    addItemRow();
    setInvoiceNumber();
    setCurrentDate();
    if (logoPreview) logoPreview.style.display = 'none';
    // Show both buttons for new invoice
    if (generateInvoiceBtn) generateInvoiceBtn.style.display = '';
    if (downloadPdfBtn) downloadPdfBtn.style.display = '';
}



// Load Excel File
loadExcelBtn.addEventListener('click', () => {
    excelFileInput.click();
});

excelFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const invoices = XLSX.utils.sheet_to_json(firstSheet);
            
            localStorage.setItem('invoices', JSON.stringify(invoices));
            displayInvoices(invoices);
            switchTab('invoiceList');
        };
        reader.readAsArrayBuffer(file);
    }
});

// Load stored invoices on startup
function loadStoredInvoices() {
    try {
        const workbook = XLSX.readFile('invoices.xlsx');
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const invoices = XLSX.utils.sheet_to_json(firstSheet);
        localStorage.setItem('invoices', JSON.stringify(invoices));
        displayInvoices(invoices);
    } catch (error) {
        // File doesn't exist yet, try loading from localStorage as fallback
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        if (invoices.length > 0) {
            displayInvoices(invoices);
        }
    }
}

// Display Invoices
function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesBody');
    tbody.innerHTML = '';
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.date}</td>
            <td>${invoice.clientName}</td>
            <td>
                <div>Subtotal: ${invoice.subtotal}</div>
                <div>Tax (${invoice.taxRate}%): ${invoice.taxAmount}</div>
                <div>Discount (${invoice.discountRate}%): ${invoice.discountAmount}</div>
                <div><strong>Total: ${invoice.total}</strong></div>
            </td>
            <td>
                <button onclick="viewInvoice('${invoice.invoiceNumber}')" class="icon-button">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search Invoices
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const filtered = invoices.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
        invoice.clientName.toLowerCase().includes(searchTerm)
    );
    displayInvoices(filtered);
});

// View Invoice
window.viewInvoice = function(invoiceNum) {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const invoice = invoices.find(inv => inv.invoiceNumber === invoiceNum);
    
    if (invoice) {
        // Switch to new invoice tab
        switchTab('newInvoice');
        
        // Fill all form fields
        formFields.forEach(field => {
            if (invoice[field]) {
                document.getElementById(field).value = invoice[field];
            }
        });
        
        // Set logo if exists
        if (invoice.logo) {
            logoPreview.src = invoice.logo;
            logoPreview.style.display = 'block';
        }
        
        // Set invoice number
        document.getElementById('invoiceNumber').value = invoice.invoiceNumber;
        
        // Clear existing items
        itemsBody.innerHTML = '';
        
        // Add invoice items
        invoice.items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" class="item-description" value="${item.description}" required></td>
                <td><input type="number" class="item-quantity" value="${item.quantity}" min="1" required></td>
                <td><input type="number" class="item-rate" value="${item.rate}" min="0" step="0.01" required></td>
                <td><span class="item-amount">${item.amount}</span></td>
                <td>
                    <button type="button" class="delete-row icon-button">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            itemsBody.appendChild(row);
            
            // Add event listeners for calculations
            const inputs = row.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('input', calculateTotals);
            });

            row.querySelector('.delete-row').addEventListener('click', () => {
                row.remove();
                calculateTotals();
            });
        });
        
        // Set tax and discount rates
        document.getElementById('taxRate').value = invoice.taxRate;
        document.getElementById('discountRate').value = invoice.discountRate;
        
        calculateTotals();
        // Only show Download PDF button when viewing
        if (generateInvoiceBtn) generateInvoiceBtn.style.display = 'none';
        if (downloadPdfBtn) downloadPdfBtn.style.display = '';
    }
};
