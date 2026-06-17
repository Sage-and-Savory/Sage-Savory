const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Fix duplicate borders
content = content.replace(/border border-gray-200 dark:border-white\/10 /g, '');
content = content.replace(/border border-gray-100 dark:border-\[#38383A\]/g, 'border border-gray-200 dark:border-white/10');
content = content.replace(/border border-gray-100 dark:border-white\/10/g, 'border border-gray-200 dark:border-white/10');

// Fix duplicate shadow issue
content = content.replace(/shadow-sm border border-[^ ]+/g, 'shadow-sm');

// Fix big cards floating elegant shadows.
content = content.replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0.05\)\]/g, '');
content = content.replace(/shadow-\[0_8px_30px_rgb\(0,0,0,0.04\)\]/g, 'shadow-[0_20px_40px_rgba(0,0,0,0.06)]');
content = content.replace(/shadow-\[0_4px_20px_rgb\(0,0,0,0.03\)\]/g, 'shadow-[0_12px_32px_rgba(0,0,0,0.05)]');

// If there are giant elements that got wrapped in rounded-full instead of rounded-3xl, 
// let's restore rounded-3xl / rounded-2xl to big cards:
content = content.replace(/className="([^"]*)bg-white dark:bg-white\/5 backdrop-blur-md([^"]*)rounded-full([^"]*)"/g, 'className="$1bg-white dark:bg-white/5 backdrop-blur-md$2rounded-3xl$3"');

// Fix the generator button specifically
content = content.replace(/rounded-full shadow-\[0_20px_40px_rgba\(0,0,0,0.06\)\]/g, 'rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)]');

// Write back
fs.writeFileSync('src/App.tsx', content);

// Do same for overlay
let overlay = fs.readFileSync('src/CreateRecipeOverlay.tsx', 'utf8');
overlay = overlay.replace(/border border-gray-200 dark:border-white\/10 /g, '');
overlay = overlay.replace(/border border-gray-100 dark:border-\[#38383A\]/g, 'border border-gray-200 dark:border-white/10');
overlay = overlay.replace(/border border-gray-100 dark:border-white\/10/g, 'border border-gray-200 dark:border-white/10');
overlay = overlay.replace(/className="([^"]*)bg-white dark:bg-white\/5 backdrop-blur-md([^"]*)rounded-full([^"]*)"/g, 'className="$1bg-white dark:bg-white/5 backdrop-blur-md$2rounded-3xl$3"');
fs.writeFileSync('src/CreateRecipeOverlay.tsx', overlay);

console.log('Cleanup complete');
