<div align="center">
  <h1>✨ Smart PASSport Maker ✨</h1>
  <p><strong>Stop paying for passport photos. Upload, Magic-Remove Background, and Print!</strong></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
  [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
  [![HTMX](https://img.shields.io/badge/htmx-336699?style=for-the-badge&logo=html5&logoColor=white)](https://htmx.org)
</div>

---

## 📸 What is it?
The **Smart Passport Maker** is an ultra-fast, entirely local web application built on Node.js. It automatically connects to the `remove.bg` API to strip messy backgrounds from ANY photo, and uses AI-attention cropping to perfectly frame the subject for official documentation sizes. 

It generates a **high-resolution A4 collage**, ready to be printed directly from your browser!

### 🎨 Neo-Brutalist "Sticker" Design
The UI was exclusively designed to ditch the boring corporate app look, featuring a heavy vector-art Neo-Brutalist aesthetic.
- ⚡ **Magic Scanner Animation:** Watch your photo get dynamically scanned on the loading screen!
- 🌈 **Hover Pops & Deep Shadows:** Flat design clashing beautifully with intense drop shadows.

---

## 🚀 Epic Features
- [x] **Smart AI Framing**: Automatically detects the face and centers the crop with correct shoulder-padding.
- [x] **Universal Sizing**:
  - `🇺🇸 Passport` (2x2 inch)
  - `🇪🇺 Visa` (35x45 mm)
  - `🇮🇳 PAN Card` (25x35 mm)
  - `🪪 Stamp Size` (20x25 mm)
- [x] **Direct Printing**: Built right into the browser, skip the "save-as" step completely!
- [x] **Client Vault Tracking**: Servicing a client? Type their name and the server automatically stores their high-res sheet in your local `saved_sheets/` vault so you can reprint later for them effortlessly.
- [x] **Cut-Assist Spacing (Gap Control)**: Dynamically change the padding between printed images (10px, 20px, 40px, or 80px) to make scissor-cutting ridiculously easy.

---

## 🛠️ Installation & Setup

1. **Clone the magic**
```bash
git clone https://github.com/princemehra9024/smart-PASSport-Maker.git
cd smart-PASSport-Maker
```

2. **Install dependencies**
```bash
npm install 
```

3. **Required packages** (Pre-installed via step 2)
> `express`, `multer`, `axios`, `form-data`, `sharp`

4. **Launch the Server**
```bash
node server.js
```

5. **Let's Make Passports!**
Visit `http://localhost:3000` in your browser.

> **Note**: You will need a `remove.bg` API key configured in the application for the background removals to function correctly!

---
<div align="center">
  <i>Built with ❤️ using Sharp Image Processing & HTMX Dynamic Rendering</i>
</div>
