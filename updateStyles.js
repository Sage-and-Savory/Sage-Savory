const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

const OLD_GREEN = '#8A9A86';
const OLD_GREEN_HOVER = '#768573';
const NEW_TEAL = '#0D9488';     // Deep teal/emerald
const NEW_TEAL_HOVER = '#0F766E';

const OLD_BG_LIGHT = '#FDFBF7';
const NEW_BG_LIGHT = '#FAFAFA';

const OLD_BG_DARK = '#1C1C1E';
const NEW_BG_DARK = '#0A0A0A';

// Simple global replaces
content = content.replace(/#8A9A86/g, NEW_TEAL);
content = content.replace(/#768573/g, NEW_TEAL_HOVER);

content = content.replace(/#FDFBF7/g, NEW_BG_LIGHT);
content = content.replace(/#1C1C1E/g, NEW_BG_DARK);

// "dark:bg-[#2C2C2E]" often represents cards/containers
// Replace with "dark:bg-white/5 backdrop-blur-md"
// But only for borders/backgrounds to apply glassmorphism.
content = content.replace(/dark:bg-\[#2C2C2E\]/g, 'dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10');

// Replace dark mode borders
content = content.replace(/dark:border-\[#38383A\]/g, 'dark:border-white/10');

// Pills rounded
content = content.replace(/rounded-xl/g, 'rounded-2xl');
content = content.replace(/rounded-2xl/g, 'rounded-full');

content = content.replace(/rounded-3xl/g, 'rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)]');
content = content.replace(/transition-colors/g, 'transition-all duration-300 ease-in-out');

fs.writeFileSync('./src/App.tsx', content);

let overlay = fs.readFileSync('./src/CreateRecipeOverlay.tsx', 'utf8');
overlay = overlay.replace(/#8A9A86/g, NEW_TEAL);
overlay = overlay.replace(/#768573/g, NEW_TEAL_HOVER);

overlay = overlay.replace(/#FDFBF7/g, NEW_BG_LIGHT);
overlay = overlay.replace(/#1C1C1E/g, NEW_BG_DARK);

overlay = overlay.replace(/dark:bg-\[#2C2C2E\]/g, 'dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10');
overlay = overlay.replace(/dark:border-\[#38383A\]/g, 'dark:border-white/10');
overlay = overlay.replace(/rounded-xl/g, 'rounded-2xl');
overlay = overlay.replace(/rounded-2xl/g, 'rounded-full');

overlay = overlay.replace(/rounded-3xl/g, 'rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)]');
overlay = overlay.replace(/transition-colors/g, 'transition-all duration-300 ease-in-out');

fs.writeFileSync('./src/CreateRecipeOverlay.tsx', overlay);

console.log('App.tsx and CreateRecipeOverlay.tsx updated');
