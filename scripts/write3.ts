import fs from 'fs';

let content = fs.readFileSync('src/recipes.ts', 'utf8');

content = content.replace(/steps: \[([\s\S]*?)\],(\s+)pickyHack: (.*)/g, (match, stepsContent, whitespace, pickyHack) => {
    return `steps: [\${stepsContent}],
    detailedSteps: [
      { text: "Prepare and gather ingredients. Wash and prep items like {0}. Takes 5-10 mins.", time: 5, refs: [0] },
      { text: "Initial Cooking: Combine base ingredients such as {1}. Saute or mix thoroughly.", time: 10, refs: [1] },
      { text: "Main Phase: Fold in {2} and reduce heat. Cook evenly.", time: 15, refs: [2] },
      { text: "Finishing: Season, plate, and optionally garnish before serving.", time: 5, refs: [] }
    ],\${whitespace}pickyHack: \${pickyHack}`;
});

fs.writeFileSync('src/recipes.ts', content);
