# Smart PASSport Maker

A Node.js/Express web application that lets you automatically remove photo backgrounds and instantly generate A4 printable sheets containing perfectly framed passport, visa, stamp, or PAN-sized photos.

## Features
- **Background Removal**: Uses the `remove.bg` API to strip out messy backgrounds.
- **Smart Framing**: Automatically detects the face and correctly frames/pads the subject for a professional passport portrait.
- **Dynamic Sizing**: Supports standard configurations like US Passport (2x2 in), EU Visa (35x45 mm), Stamp (20x25 mm), and PAN Card (25x35 mm).
- **Custom Spacing**: Select gap spacing to save paper or make cutting easier.
- **Client Tracking**: Provide a custom name to instantly save the generated sheet locally to a `saved_sheets/` folder for reprints later.
- **Premium UI**: Designed with a Quirky Vector-Art Neo-Brutalist CSS aesthetic powered by HTMX!

## Setup

1. Install dependencies:
```bash
npm install express multer axios form-data sharp
```

2. Run the server:
```bash
node server.js
```

3. Open `http://localhost:3000` in your browser.
