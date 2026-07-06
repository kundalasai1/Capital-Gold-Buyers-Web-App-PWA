const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Sai Kumar\\..gemini\\antigravity\\brain\\e956c8da-a103-4f64-bc1f-05633ee5988d\\gold_display_1783363120887.png";
// Fix path double dot check:
const actualSrc = "C:\\Users\\Sai Kumar\\.gemini\\antigravity\\brain\\e956c8da-a103-4f64-bc1f-05633ee5988d\\gold_display_1783363120887.png";

const dest = path.join(__dirname, '..', 'public', 'gold_display.png');

// Ensure destination directories exist
const destDir = path.dirname(dest);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(actualSrc, dest);
console.log('Successfully copied gold display image to public/gold_display.png');
