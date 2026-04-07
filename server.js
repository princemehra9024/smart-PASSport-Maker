const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.post('/process', upload.single('photo'), async (req, res) => {
    try {
        const apiKey = req.body.apikey;
        const copies = parseInt(req.body.copies) || 25;
        const sizeOption = req.body.size || 'us'; // 'us' 2x2 inch, 'eu' 35x45mm
        const gapSpacing = parseInt(req.body.spacing) || 40;

        if (!req.file || !apiKey) {
            return res.send(`<div class="api-error"><div class="error-icon">⚠️</div>Please provide both an image and an API key.</div>`);
        }

        // 1. Remove Background
        const form = new FormData();
        form.append('size', 'auto');
        form.append('image_file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const bgResponse = await axios.post('https://api.remove.bg/v1.0/removebg', form, {
            headers: {
                ...form.getHeaders(),
                'X-Api-Key': apiKey
            },
            responseType: 'arraybuffer'
        });

        const bgRemovedBuffer = bgResponse.data;

        // 2. Resize to Passport Size & add White Background (300 DPI)
        let passportWidth = 600;
        let passportHeight = 600;
        let sizeName = "Passport";

        if (sizeOption === 'us') {
            passportWidth = 600; passportHeight = 600; sizeName = "Passport (2x2 inch)";
        } else if (sizeOption === 'eu') {
            passportWidth = 413; passportHeight = 531; sizeName = "Visa (35x45 mm)";
        } else if (sizeOption === 'stamp') {
            passportWidth = 236; passportHeight = 295; sizeName = "Stamp (20x25 mm)";
        } else if (sizeOption === 'pan') {
            passportWidth = 295; passportHeight = 413; sizeName = "PAN Card (25x35 mm)";
        }

        let passportImg = await sharp(bgRemovedBuffer)
            .resize(passportWidth, passportHeight, {
                fit: 'cover',
                position: 'attention'  // Smart crop: auto-detects and focuses on the face/subject
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // White background
            .png()
            .toBuffer();

        // Add padding AROUND the passport crop so the full head and shoulders are properly framed
        // Standard passport: face occupies 70-80% of height, space above head and chin visible
        const paddingPercent = 0.10; // 10% padding on all sides
        const paddedW = Math.round(passportWidth * (1 - paddingPercent * 2));
        const paddedH = Math.round(passportHeight * (1 - paddingPercent * 2.2)); // slightly more top/bottom room

        const finalPassportImg = await sharp(bgRemovedBuffer)
            .resize(paddedW, paddedH, {
                fit: 'contain',       // contain = no cropping, whole person fits inside
                position: 'attention',
                background: { r: 255, g: 255, b: 255 }
            })
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .png()
            .toBuffer();

        // Embed centered on the final canvas size with white border
        passportImg = await sharp({
            create: {
                width: passportWidth,
                height: passportHeight,
                channels: 3,
                background: { r: 255, g: 255, b: 255 }
            }
        })
        .composite([{
            input: finalPassportImg,
            gravity: 'centre'
        }])
        .png()
        .toBuffer();

        // 3. Create Collage (Dynamic canvas, max A4 width 2480px at 300 dpi)
        const canvasWidth = 2480; 
        const padding = gapSpacing; 

        // Calculate layout
        const cols = Math.floor((canvasWidth - padding) / (passportWidth + padding));
        const rows = Math.ceil(copies / cols);
        
        const canvasHeight = Math.max(1200, (rows * (passportHeight + padding)) + padding);

        const compositeItems = [];

        // center horizontally
        const startX = Math.round((canvasWidth - (cols * passportWidth + (cols - 1) * padding)) / 2);
        const startY = padding; // limit to top

        for (let i = 0; i < copies; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = startX + col * (passportWidth + padding);
            const y = startY + row * (passportHeight + padding);

            compositeItems.push({
                input: passportImg,
                top: y,
                left: x
            });
        }

        const finalCanvas = sharp({
            create: {
                width: canvasWidth,
                height: canvasHeight,
                channels: 3,
                background: { r: 255, g: 255, b: 255 } // Solid white page
            }
        });

        let outputBuffer;
        if (compositeItems.length > 0) {
            outputBuffer = await finalCanvas.composite(compositeItems).png().toBuffer();
        } else {
            outputBuffer = await finalCanvas.png().toBuffer();
        }

        const base64Img = outputBuffer.toString('base64');
        const dataUri = `data:image/png;base64,${base64Img}`;

        let savedMsg = '';
        if (req.body.clientName && req.body.clientName.trim() !== '') {
            const clientBase = req.body.clientName.trim().replace(/[^a-z0-9]/gi, '_');
            const saveDir = path.join(__dirname, 'saved_sheets');
            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir);
            }
            const filename = `${clientBase}_${Math.floor(Date.now()/1000)}.png`;
            const savePath = path.join(saveDir, filename);
            fs.writeFileSync(savePath, outputBuffer);
            savedMsg = `<p style="color:var(--green); margin-top:5px; font-weight:bold; font-size:1.3rem;">✅ Saved locally as: <b>${filename}</b></p>`;
        }

        res.send(`
            <div class="result-container fade-in-up">
                <h3 class="success-title">Magic Complete!</h3>
                <p>Generated ${copies} copies of ${sizeName}.</p>
                ${savedMsg}
                <div class="img-preview-box">
                    <img src="${dataUri}" id="generated-canvas" alt="Generated Sheet" class="result-img" />
                </div>
                <div class="form-row" style="margin-top: 1.5rem;">
                    <a href="${dataUri}" download="passport-sheet.png" class="submit-btn primary-btn half-width" style="margin-top:0;">💾 DOWNLOAD</a>
                    <button type="button" onclick="printResult()" class="submit-btn half-width" style="margin-top:0; background:#FFD166;">🖨️ DIRECT PRINT</button>
                </div>
            </div>
        `);
    } catch (error) {
        console.error("Error Processing Request:", error);
        let errMsg = "An unknown error occurred.";
        if (error.response && error.response.data) {
            try {
                const decoder = new TextDecoder('utf-8');
                const errData = decoder.decode(error.response.data);
                const json = JSON.parse(errData);
                errMsg = json.errors ? json.errors[0].title : "API Error";
            } catch(e) {
                errMsg = error.message;
            }
        } else {
            errMsg = error.message;
        }
        res.send(`<div class="api-error"><div class="error-icon">⚠️</div> Error processing request: ${errMsg}</div>`);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
