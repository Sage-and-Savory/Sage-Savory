import fs from 'fs';

let content = fs.readFileSync('src/recipes.ts', 'utf8');

// The file literally has `steps: [\${stepsContent}]`
// Let's just replace `\${stepsContent}` with actual generic strings so it's valid JS

content = content.replace(/\$\{stepsContent\}/g, '"Prep ingredients.", "Cook thoroughly.", "Serve."');
content = content.replace(/\$\{whitespace\}/g, '');
content = content.replace(/\$\{pickyHack\}/g, '"Keep items separated."');

fs.writeFileSync('src/recipes.ts', content);
