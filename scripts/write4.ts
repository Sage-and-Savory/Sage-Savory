import fs from 'fs';

let content = fs.readFileSync('src/recipes.ts', 'utf8');

// The original file is a TypeScript file exporting INITIAL_RECIPES.
// Note: right now the file contains literal \${stepsContent}. I should restore the original file first!
