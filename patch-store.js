const fs = require('fs');
let code = fs.readFileSync('src/store.tsx', 'utf8');
code = `import { INITIAL_RECIPES } from './recipes';\n` + code;
code = code.replace(/const INITIAL_RECIPES: Recipe\[\] \= \[[\s\S]*?\];\n/, '');
fs.writeFileSync('src/store.tsx', code);
