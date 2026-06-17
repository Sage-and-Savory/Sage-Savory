const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The main issue is `font-bold` is spread a lot, let's substitute most `font-bold` inside text elements like span, p, label with `font-medium`.
content = content.replace(/<span className="([^"]*)font-bold([^"]*)">/g, '<span className="$1font-medium$2">');
content = content.replace(/<p className="([^"]*)font-bold([^"]*)">/g, '<p className="$1font-medium$2">');
content = content.replace(/<label className="([^"]*)font-bold([^"]*)">/g, '<label className="$1font-medium$2">');

// For buttons, font-medium or font-bold is okay but let's change them to font-medium as well.
content = content.replace(/<button className="([^"]*)font-bold([^"]*)">/g, '<button className="$1font-medium$2">');

// For h2, h3, h1, they keep font-extrabold or font-bold
// Wait, I replaced `font-extrabold` with `font-bold tracking-tight` earlier so they are bold now.

// "text-sm font-bold" -> "text-sm font-medium" universally to catch many instances
content = content.replace(/text-sm font-bold/g, 'text-sm font-medium');
// "text-xs font-bold" -> "text-xs font-medium"
content = content.replace(/text-xs font-bold/g, 'text-xs font-medium');

// AI Generator Button
// The generate button's text: "AI Magic Generator" etc.
content = content.replace(/> AI Magic Generator/g, '> AI Magic Generator');
// The Generate button has: text-sm font-bold -> text-sm font-medium. Done.

// Let's do the same for CreateRecipeOverlay.tsx
let overlay = fs.readFileSync('src/CreateRecipeOverlay.tsx', 'utf8');
overlay = overlay.replace(/<span className="([^"]*)font-bold([^"]*)">/g, '<span className="$1font-medium$2">');
overlay = overlay.replace(/<p className="([^"]*)font-bold([^"]*)">/g, '<p className="$1font-medium$2">');
overlay = overlay.replace(/<label className="([^"]*)font-bold([^"]*)">/g, '<label className="$1font-medium$2">');
overlay = overlay.replace(/<button([^>]*)font-bold([^>]*)>/g, '<button$1font-medium$2>');
overlay = overlay.replace(/text-sm font-bold/g, 'text-sm font-medium');
overlay = overlay.replace(/text-xs font-bold/g, 'text-xs font-medium');
overlay = overlay.replace(/text-base font-bold/g, 'text-base font-medium');
overlay = overlay.replace(/font-extrabold/g, 'font-bold tracking-tight');

fs.writeFileSync('src/App.tsx', content);
fs.writeFileSync('src/CreateRecipeOverlay.tsx', overlay);

console.log('Fonts weights updated');
