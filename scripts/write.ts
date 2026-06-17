import fs from 'fs';

let content = fs.readFileSync('src/recipes.ts', 'utf8');

content = content.replace(/steps: \[([\s\S]*?)\],/g, (match) => {
    return match + `
    detailedSteps: [
      { text: "Prep step: Measure and prepare all ingredients. Take out {0}.", time: 5, ingredientIndices: [0] },
      { text: "Initial cooking: Heat the pan and add {1}.", time: 10, ingredientIndices: [1] },
      { text: "Main cooking phase: Combine remaining ingredients, including {2}.", time: 15, ingredientIndices: [2] },
      { text: "Final touches: Plate the meal and let it rest.", time: 5, ingredientIndices: [] }
    ],`;
});

fs.writeFileSync('src/recipes.ts', content);
