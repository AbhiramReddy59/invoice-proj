# InvoMate - Invoice Management System

A modern, browser-based Invoice Management System for small businesses and freelancers. Easily create, manage, and export professional invoices with a beautiful, responsive UI.

## 🚀 Features
- **Create Invoices:** Fill in business, client, and item details with a dynamic form.
- **Professional PDF Generation:** Download invoices as polished PDFs.
- **Invoice History:** View, search, and manage previously created invoices.
- **Export to Excel:** Export all invoices to a single Excel file when needed.
- **Dark/Light Mode:** Toggle between dark and light themes.
- **Responsive Design:** Works great on desktop and mobile.
- **No Backend Needed:** All data is stored in your browser (localStorage).

## 📦 Tech Stack
- HTML5, CSS3, JavaScript (Vanilla)
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation
- [html2canvas](https://github.com/niklasvh/html2canvas) for PDF snapshot
- [SheetJS (xlsx)](https://github.com/SheetJS/sheetjs) for Excel export
- Font Awesome for icons

## 🖥️ Getting Started
1. **Clone this repo:**
   ```sh
   git clone <your-repo-url>
   cd app invoice proj
   ```
2. **Run locally:**
   ```sh
   python -m http.server 8000
   # or use any static server (Live Server, http-server, etc.)
   ```
3. **Open in browser:**
   Visit [http://localhost:8000](http://localhost:8000)

## 🌐 Deployment
- Deploy easily to Netlify, Vercel, or GitHub Pages.
- For Netlify, just drag and drop the folder, or use the Netlify CLI:
  ```sh
  netlify deploy --prod
  ```

## ⚠️ Security Note
- All data is stored in your browser (localStorage). For sensitive or multi-user data, consider adding a backend.

