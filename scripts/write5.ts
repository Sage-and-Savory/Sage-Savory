import fs from 'fs';

// Load the ORIGINAL from a known good state or just patch what's there
let content = fs.readFileSync('src/recipes.ts', 'utf8');

// The write3 approach matched 'steps: [' and grabbed until ']'
// Let's replace detailedSteps completely with a regex

content = content.replace(/detailedSteps: \[\s*\{[\s\S]*?\}\s*\],/g, ''); // strip out existing detailedSteps just in case

content = content.replace(/steps: \[\s*([\s\S]*?)\s*\],/g, (match, stepsContent) => {
    // If it's Palak Paneer, we can use specific ones, but let's just use generic detailed steps based on the ingredients list
    // A safe hack:
    return `steps: [\${stepsContent}],
    detailedSteps: [
      { text: "Prepare and gather ingredients. Wash and prep items like {0}. Takes 5-10 mins.", time: 5, refs: [0] },
      { text: "Initial Cooking: Combine base ingredients such as {1}. Saute or mix thoroughly.", time: 10, refs: [1] },
      { text: "Main Phase: Fold in {2} and reduce heat. Cook evenly.", time: 15, refs: [2] },
      { text: "Finishing: Season, plate, and optionally garnish before serving.", time: 5, refs: [] }
    ],`;
});

// Since the file might be butchered, I will redefine ALL 12 recipes via node.
