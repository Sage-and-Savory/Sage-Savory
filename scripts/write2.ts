import fs from 'fs';

const updatedContent = `import { Recipe } from "./store";

export const INITIAL_RECIPES: Recipe[] = [
  // INDIAN (3)
  {
    id: 'ind_1',
    title: 'Butter Chicken',
    image: 'https://images.squarespace-cdn.com/content/v1/5f063187ead18a2e98ba7f9b/1721491902442-7MKYG5QPSQ6A4OEIIU6L/IndienneChef-13.jpg',
    difficulty: 'Medium',
    time: '45 min',
    baseServings: 4,
    region: 'Indian',
    ingredients: [
      { amount: 1.5, unit: 'lb', name: 'Chicken breast', category: 'Meat' },
      { amount: 1, unit: 'cup', name: 'Tomato puree', category: 'Pantry' },
      { amount: 0.5, unit: 'cup', name: 'Heavy cream', category: 'Dairy' },
      { amount: 2, unit: 'tbsp', name: 'Butter', category: 'Dairy' },
      { amount: 1, unit: 'tbsp', name: 'Garam masala', category: 'Pantry' }
    ],
    steps: [
      'Marinate chicken in yogurt and spices.',
      'Cook the chicken in a pan until lightly browned.',
      'Prepare the sauce with puree, cream, and butter.',
      'Simmer the chicken in the sauce for 15 minutes.'
    ],
    detailedSteps: [
      { text: "Cut {0} into bite-sized pieces. Marinate with {4} and a pinch of salt. Let it rest while prepping other items.", time: 10, refs: [0, 4] },
      { text: "In a hot pan, melt half of the {3} and cook the marinated chicken until browned on all sides.", time: 10, refs: [3] },
      { text: "Lower the heat. Add the remaining {3} and pour in the {1}. Simmer gently.", time: 10, refs: [3, 1] },
      { text: "Stir in the {2} to form a rich sauce. Simmer the chicken in the sauce until fully cooked through.", time: 15, refs: [2] }
    ],
    pickyHack: 'Serve the chicken plain on the side if they don’t like the sauce.'
  },
  {
    id: 'ind_2',
    title: 'Palak Paneer',
    image: 'https://media.istockphoto.com/id/1062878792/photo/palak-paneer-spinach-cottage-cheese-curry.jpg?s=612x612&w=0&k=20&c=Bbi4Hab14TiRLsi1g5PRMsjmIQoNCLOzg3wmSC7pios=',
    difficulty: 'Medium',
    time: '30 min',
    baseServings: 4,
    region: 'Indian',
    ingredients: [
      { amount: 1, unit: 'lb', name: 'Paneer', category: 'Dairy' },
      { amount: 1, unit: 'lb', name: 'Spinach', category: 'Produce' },
      { amount: 1, unit: '', name: 'Onion', category: 'Produce' },
      { amount: 0.25, unit: 'cup', name: 'Heavy cream', category: 'Dairy' },
      { amount: 1, unit: 'tsp', name: 'Cumin', category: 'Pantry' }
    ],
    steps: [
      'Blanch the spinach and blend it into a smooth puree.',
      'Sauté onions and spices in a pan.',
      'Add the spinach puree and simmer.',
      'Fold in paneer cubes and let them warm through.'
    ],
    detailedSteps: [
      { text: "Blanch the {1} in boiling water for 2 minutes, then immediately transfer to an ice bath. Blend into a smooth puree.", time: 8, refs: [1] },
      { text: "Finely chop the {2}. In a pan, toast the {4} until fragrant, then sauté the chopped onion until golden brown.", time: 7, refs: [2, 4] },
      { text: "Pour the blended spinach puree into the pan. Bring to a gentle simmer.", time: 5, refs: [] },
      { text: "Cut the {0} into cubes. Fold the paneer and {3} into the simmering spinach. Warm through.", time: 10, refs: [0, 3] }
    ],
    pickyHack: 'Call it "green superhero dip" and serve with crispy naan.'
  },
  {
    id: 'ind_3',
    title: 'Chana Masala',
    image: 'https://i0.wp.com/www.novicehousewife.com/wp-content/uploads/2012/04/dsc_0330.jpg?ssl=1',
    difficulty: 'Easy',
    time: '25 min',
    baseServings: 4,
    region: 'Indian',
    ingredients: [
      { amount: 2, unit: 'cans', name: 'Chickpeas', category: 'Pantry' },
      { amount: 1, unit: 'can', name: 'Diced tomatoes', category: 'Pantry' },
      { amount: 1, unit: '', name: 'Onion', category: 'Produce' },
      { amount: 2, unit: 'cloves', name: 'Garlic', category: 'Produce' },
      { amount: 1, unit: 'tbsp', name: 'Curry powder', category: 'Pantry' }
    ],
    steps: [
      'Sauté onions and garlic until golden.',
      'Add spices, tomatoes, and chickpeas.',
      'Simmer for 20 minutes.',
      'Serve hot over rice.'
    ],
    detailedSteps: [
      { text: "Finely chop the {2} and mince the {3}. Sauté them over medium heat until fragrant and golden.", time: 5, refs: [2, 3] },
      { text: "Stir in the {4} and cook for exactly 60 seconds to bloom the spices.", time: 2, refs: [4] },
      { text: "Pour in the {1} and add the drained {0}.", time: 3, refs: [1, 0] },
      { text: "Cover and let simmer nicely so the flavors marry together.", time: 15, refs: [] }
    ],
    pickyHack: 'Smash some of the chickpeas to make it less chunky for texture-sensitive kids.'
  },

  // MEXICAN (3)
  {
    id: 'mex_1',
    title: 'Chicken Fajitas',
    image: 'https://www.munchkintime.com/wp-content/uploads/2020/05/Easy-Chicken-Fajita-Recipe-with-Fajita-Seasoning-5-2-360x360.jpg',
    difficulty: 'Easy',
    time: '20 min',
    baseServings: 4,
    region: 'Mexican',
    ingredients: [
      { amount: 1.5, unit: 'lb', name: 'Chicken breast', category: 'Meat' },
      { amount: 2, unit: '', name: 'Bell peppers', category: 'Produce' },
      { amount: 1, unit: '', name: 'Onion', category: 'Produce' },
      { amount: 8, unit: '', name: 'Tortillas', category: 'Pantry' },
      { amount: 1, unit: 'tbsp', name: 'Fajita seasoning', category: 'Pantry' }
    ],
    steps: [
      'Slice chicken and vegetables into strips.',
      'Toss chicken with seasoning and sauté until cooked.',
      'Add vegetables and cook briefly until tender-crisp.',
      'Serve with warm tortillas.'
    ],
    detailedSteps: [
      { text: "Quickly slice the {0}, {1}, and {2} into even ½-inch strips.", time: 6, refs: [0, 1, 2] },
      { text: "Toss the chicken strips vigorously with the {4}. Sauté in a searing hot skillet until browned.", time: 8, refs: [0, 4] },
      { text: "Remove the chicken, then immediately add the sliced vegetables to the same skillet. Cook until just tender.", time: 5, refs: [1, 2] },
      { text: "Warm all the {3}. Serve sizzling chicken and vegetables together.", time: 1, refs: [3] }
    ],
    pickyHack: 'Keep chicken and peppers separated in the pan.'
  },
  {
    id: 'mex_2',
    title: 'Beef Enchiladas',
    image: 'https://www.isabeleats.com/wp-content/uploads/2020/09/beef-enchiladas-small-7.jpg',
    difficulty: 'Medium',
    time: '45 min',
    baseServings: 4,
    region: 'Mexican',
    ingredients: [
      { amount: 1, unit: 'lb', name: 'Ground beef', category: 'Meat' },
      { amount: 1.5, unit: 'cups', name: 'Enchilada sauce', category: 'Pantry' },
      { amount: 8, unit: '', name: 'Corn tortillas', category: 'Pantry' },
      { amount: 2, unit: 'cups', name: 'Shredded cheese', category: 'Dairy' }
    ],
    steps: [
      'Brown ground beef and drain excess fat.',
      'Roll beef in tortillas and place in a baking dish.',
      'Cover with sauce and cheese.',
      'Bake at 375°F for 20 minutes.'
    ],
    detailedSteps: [
      { text: "Brown the {0} in a large skillet over medium-high heat. Drain excess fat.", time: 8, refs: [0] },
      { text: "Spoon the cooked beef and a small pinch of {3} into each of the {2}, roll them tightly.", time: 10, refs: [0, 3, 2] },
      { text: "Place in a baking dish. Pour all the {1} evenly over the rolled tortillas.", time: 2, refs: [1] },
      { text: "Sprinkle the rest of the {3} heavily on top. Bake at 375°F until bubbly.", time: 25, refs: [3] }
    ],
    pickyHack: 'Make a mini cheese-only quesadilla with leftover tortillas.'
  },
  {
    id: 'mex_3',
    title: 'Churros with Chocolate',
    image: 'https://img.freepik.com/premium-photo/traditional-spanish-dessert-churros-with-sugar-cinnamon-dipping-chocolate-sauce_43263-974.jpg',
    difficulty: 'Medium',
    time: '35 min',
    baseServings: 4,
    region: 'Mexican',
    ingredients: [
      { amount: 1, unit: 'cup', name: 'Flour', category: 'Pantry' },
      { amount: 0.5, unit: 'cup', name: 'Butter', category: 'Dairy' },
      { amount: 1, unit: 'tbsp', name: 'Cinnamon', category: 'Pantry' },
      { amount: 0.5, unit: 'cup', name: 'Sugar', category: 'Pantry' },
      { amount: 1, unit: 'cup', name: 'Chocolate chips', category: 'Pantry' }
    ],
    steps: [
      'Boil water with butter, then stir in flour to make dough.',
      'Pipe dough into hot oil and fry until golden.',
      'Roll warm churros in cinnamon sugar.',
      'Melt chocolate chips for dipping.'
    ],
    detailedSteps: [
      { text: "Boil 1 cup of water and {1}. Vigorously stir in {0} to form a tight dough.", time: 8, refs: [1, 0] },
      { text: "Pipe the dough into hot frying oil. Fry until deeply golden and crispy.", time: 15, refs: [0] },
      { text: "Whisk the {3} and {2} together in a shallow dish. Roll the hot churros in it.", time: 5, refs: [3, 2] },
      { text: "Melt the {4} in a microwave-safe bowl until completely smooth. Serve on the side.", time: 7, refs: [4] }
    ],
    pickyHack: 'Omit cinnamon if they prefer plain sugar.'
  },

  // ITALIAN (3)
  {
    id: 'ita_1',
    title: 'Spaghetti Carbonara',
    image: 'https://leitesculinaria.com/wp-content/uploads/2010/01/spaghetti-carbonara-dual-plates-pin.jpg',
    difficulty: 'Medium',
    time: '25 min',
    baseServings: 4,
    region: 'Italian',
    ingredients: [
      { amount: 16, unit: 'oz', name: 'Spaghetti', category: 'Pantry' },
      { amount: 6, unit: 'oz', name: 'Pancetta', category: 'Meat' },
      { amount: 1, unit: 'cup', name: 'Parmesan', category: 'Dairy' },
      { amount: 4, unit: 'large', name: 'Eggs', category: 'Dairy' }
    ],
    steps: [
      'Boil pasta until al dente.',
      'Crisp pancetta in a large pan.',
      'Whisk eggs and parmesan together.',
      'Toss hot pasta with pancetta, then off heat, quickly mix in egg mixture until creamy.'
    ],
    detailedSteps: [
      { text: "Boil heavily salted water and cook the {0} until perfectly al dente.", time: 10, refs: [0] },
      { text: "In a cold pan, slowly crisp the chopped {1} to render its fat.", time: 8, refs: [1] },
      { text: "Aggressively whisk the {3} and finely grated {2} in a bowl.", time: 5, refs: [3, 2] },
      { text: "Immediately toss pasta with pancetta. Off heat, stir in the egg mixture to create a silky sauce.", time: 2, refs: [0, 1, 3, 2] }
    ],
    pickyHack: 'Mix a small portion of pasta with just butter and parmesan.'
  },
  {
    id: 'ita_2',
    title: 'Margherita Pizza',
    image: 'https://picography.co/wp-content/uploads/2018/09/picography-pizza-margherita-cheese-tomato-jakub-kapusnak-small-768x512.jpg',
    difficulty: 'Easy',
    time: '30 min',
    baseServings: 2,
    region: 'Italian',
    ingredients: [
      { amount: 1, unit: 'lb', name: 'Pizza dough', category: 'Pantry' },
      { amount: 0.5, unit: 'cup', name: 'Tomato sauce', category: 'Pantry' },
      { amount: 8, unit: 'oz', name: 'Fresh mozzarella', category: 'Dairy' },
      { amount: 1, unit: 'handful', name: 'Fresh basil', category: 'Produce' }
    ],
    steps: [
      'Preheat oven to 500°F (or highest setting).',
      'Stretch dough and top with sauce.',
      'Add torn mozzarella pieces.',
      'Bake until crust is golden and cheese is bubbly. Top with basil.'
    ],
    detailedSteps: [
      { text: "Aggressively preheat the oven and your baking surface to 500°F.", time: 10, refs: [] },
      { text: "Stretch out the {0} until thin and perfectly round on a floured board.", time: 5, refs: [0] },
      { text: "Use a ladle to thinly spread the {1}. Tear the {2} into chunks and distribute evenly.", time: 5, refs: [1, 2] },
      { text: "Bake until cheese boils and crust blackens slightly. Quickly scatter {3} on top.", time: 10, refs: [3] }
    ],
    pickyHack: 'Bake a small edge without sauce if they like dry breadsticks.'
  },
  {
    id: 'ita_3',
    title: 'Mushroom Risotto',
    image: 'https://www.westviamidwest.com/wp-content/uploads/2014/07/Mushroom-Risotto-West-Via-Midwest-7.jpg.webp',
    difficulty: 'Medium',
    time: '40 min',
    baseServings: 4,
    region: 'Italian',
    ingredients: [
      { amount: 1.5, unit: 'cups', name: 'Arborio rice', category: 'Pantry' },
      { amount: 4, unit: 'cups', name: 'Chicken or veg broth', category: 'Pantry' },
      { amount: 8, unit: 'oz', name: 'Mushrooms', category: 'Produce' },
      { amount: 0.5, unit: 'cup', name: 'Parmesan', category: 'Dairy' },
      { amount: 2, unit: 'tbsp', name: 'Butter', category: 'Dairy' }
    ],
    steps: [
      'Sauté mushrooms until browned, then remove from pan.',
      'Toast rice lightly in butter.',
      'Slowly add warm broth, ladling one cup at a time until absorbed.',
      'Stir in cooked mushrooms and parmesan at the end.'
    ],
    detailedSteps: [
      { text: "Keep {1} simmering. Pan-fry the sliced {2} until deeply browned, set aside.", time: 10, refs: [1, 2] },
      { text: "Melt half the {4} and lightly toast the {0} for a minute.", time: 5, refs: [4, 0] },
      { text: "Slowly add warm broth one ladle at a time, letting it be completely absorbed before adding more.", time: 20, refs: [1] },
      { text: "Finish by stirring in leftover {4}, grated {3}, and mushrooms until it is rich and creamy.", time: 5, refs: [4, 3, 2] }
    ],
    pickyHack: 'Leave the mushrooms out of one portion.'
  },

  // AMERICAN (3)
  {
    id: 'ame_1',
    title: 'Classic Cheeseburger',
    image: 'https://flavorfulife.com/wp-content/uploads/2025/09/Caramelized-Onion-Burgers-hero.jpg',
    difficulty: 'Easy',
    time: '20 min',
    baseServings: 4,
    region: 'American',
    ingredients: [
      { amount: 1.5, unit: 'lb', name: 'Ground beef', category: 'Meat' },
      { amount: 4, unit: '', name: 'Hamburger buns', category: 'Pantry' },
      { amount: 4, unit: 'slices', name: 'Cheddar cheese', category: 'Dairy' },
      { amount: 1, unit: '', name: 'Tomato', category: 'Produce' },
      { amount: 4, unit: 'leaves', name: 'Lettuce', category: 'Produce' }
    ],
    steps: [
      'Form beef into 4 patties.',
      'Grill or pan-fry 3-4 minutes per side.',
      'Add cheese during the last minute of cooking.',
      'Assemble on buns with lettuce and tomato.'
    ],
    detailedSteps: [
      { text: "Loosely shape the {0} into 4 equally-sized patties without overworking the meat.", time: 5, refs: [0] },
      { text: "Sear perfectly on a screaming hot pan for 3 to 4 minutes per side.", time: 8, refs: [] },
      { text: "Melt a slice of {2} over each patty during the final 60 seconds of cooking.", time: 2, refs: [2] },
      { text: "Layer the patties onto toasted {1} along with the fresh {3} and {4}.", time: 5, refs: [1, 3, 4] }
    ],
    pickyHack: 'Serve bun and patty side-by-side like a puzzle.'
  },
  {
    id: 'ame_2',
    title: 'Macaroni and Cheese',
    image: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122128262768533001',
    difficulty: 'Medium',
    time: '35 min',
    baseServings: 6,
    region: 'American',
    ingredients: [
      { amount: 16, unit: 'oz', name: 'Elbow macaroni', category: 'Pantry' },
      { amount: 2, unit: 'cups', name: 'Cheddar cheese', category: 'Dairy' },
      { amount: 2, unit: 'cups', name: 'Milk', category: 'Dairy' },
      { amount: 2, unit: 'tbsp', name: 'Flour', category: 'Pantry' },
      { amount: 2, unit: 'tbsp', name: 'Butter', category: 'Dairy' }
    ],
    steps: [
      'Cook pasta according to package directions.',
      'Make a roux with butter and flour, then whisk in milk.',
      'Stir in cheese until melted and smooth.',
      'Combine cheese sauce with pasta and bake until bubbly.'
    ],
    detailedSteps: [
      { text: "Boil heavily salted water and cook all the {0}. Drain it very well.", time: 10, refs: [0] },
      { text: "Melt the {4} in a saucepan, then whisk in the {3} and cook for exactly two minutes to build a roux.", time: 5, refs: [4, 3] },
      { text: "Pour the cold {2} carefully into the hot roux while mixing continuously to create the sauce base.", time: 10, refs: [2] },
      { text: "Remove from heat, aggressively mix in {1}. Stir in the macaroni and bake until bubbling beautifully.", time: 10, refs: [1, 0] }
    ],
    pickyHack: 'Top with crushed crackers for a fun crunch.'
  },
  {
    id: 'ame_3',
    title: 'BBQ Ribs',
    image: 'https://hips.hearstapps.com/hmg-prod/images/serving-52-68828c22f4002.jpeg?crop=1xw:0.9972222222222222xh;center,top&resize=980:*',
    difficulty: 'Hard',
    time: '4 hours',
    baseServings: 4,
    region: 'American',
    ingredients: [
      { amount: 2, unit: 'racks', name: 'Pork ribs', category: 'Meat' },
      { amount: 1, unit: 'cup', name: 'BBQ sauce', category: 'Pantry' },
      { amount: 2, unit: 'tbsp', name: 'Brown sugar', category: 'Pantry' },
      { amount: 1, unit: 'tbsp', name: 'Paprika', category: 'Pantry' }
    ],
    steps: [
      'Rub ribs with dry spices.',
      'Bake low and slow at 275°F for 3 hours covered in foil.',
      'Remove foil, brush with BBQ sauce.',
      'Broil for 5 minutes until sticky and caramelized.'
    ],
    detailedSteps: [
      { text: "Firmly massage the {2} and {3} all over the {0} to form a crusty dry rub.", time: 10, refs: [2, 3, 0] },
      { text: "Seal the pork securely in foil to trap in steam while cooking.", time: 5, refs: [0] },
      { text: "Bake exceptionally low and slow at 275°F for three solid hours.", time: 180, refs: [] },
      { text: "Unwrap ribs and generously slop on {1}. Broil intensely for 5 minutes until perfectly sticky.", time: 10, refs: [1] }
    ],
    pickyHack: 'Give them a bone to hold like a dinosaur.'
  }
];
\`;

fs.writeFileSync('src/recipes.ts', updatedContent);
`
