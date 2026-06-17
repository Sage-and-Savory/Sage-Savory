const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Colors
const OLD_GREEN = '#8A9A86';
const OLD_GREEN_HOVER = '#768573';
const NEW_TEAL = '#0D9488';     // Deep teal/emerald
const NEW_TEAL_HOVER = '#0F766E';

const OLD_BG_LIGHT = '#FDFBF7';
const NEW_BG_LIGHT = '#FAFAFA';

const OLD_BG_DARK = '#1C1C1E';
const NEW_BG_DARK = '#0A0A0A';

const OLD_CARD_BG_LIGHT = 'bg-white';
const OLD_CARD_BG_DARK = 'dark:bg-[#2C2C2E]';

// Simple global replaces
content = content.replace(/#8A9A86/g, NEW_TEAL);
content = content.replace(/#768573/g, NEW_TEAL_HOVER);

content = content.replace(/#FDFBF7/g, NEW_BG_LIGHT);
content = content.replace(/#1C1C1E/g, NEW_BG_DARK);

// "dark:bg-[#2C2C2E]" often represents cards/containers
// Replace with "dark:bg-white/5 backdrop-blur-md"
content = content.replace(/dark:bg-\[#2C2C2E\]/g, 'dark:bg-white/5 backdrop-blur-md border dark:border-white/10');

// Component Cards styling
content = content.replace(/bg-white dark:bg-white\/5 backdrop-blur-md border dark:border-white\/10 p-6 rounded-3xl shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\] border border-gray-100 dark:border-\[#38383A\]/g, 'bg-white/90 dark:bg-white/5 backdrop-blur-md p-6 rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.06)] border border-white/40 dark:border-white/10');

// Check text font weights: "font-black" to "font-bold", "font-extrabold" to "font-bold" or "font-medium" for headers
// Keep headers bold, make some body medium/normal.
content = content.replace(/font-extrabold/g, 'font-bold tracking-tight');
content = content.replace(/text-3xl md:text-4xl font-bold tracking-tight text-\[#333333\] dark:text-\[#E5E5EA\]/g, 'text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white');

// Pill shapes
content = content.replace(/rounded-xl/g, 'rounded-2xl'); // Increase rounding basically
content = content.replace(/rounded-2xl/g, 'rounded-full'); // for pills... actually let's just make it rounded-3xl or full

// "bg-white dark:bg-[#2C2C2E]"...
content = content.replace(/bg-white dark:bg-white\/5/g, 'bg-white/90 dark:bg-white/5');

// For transitions:
content = content.replace(/transition-colors/g, 'transition-all duration-300 ease-in-out');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
