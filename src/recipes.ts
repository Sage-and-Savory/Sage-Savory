import { Recipe } from "./store";

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
    detailedSteps: [
      { text: "Firmly massage the {2} and {3} all over the {0} to form a crusty dry rub.", time: 10, refs: [2, 3, 0] },
      { text: "Seal the pork securely in foil to trap in steam while cooking.", time: 5, refs: [0] },
      { text: "Bake exceptionally low and slow at 275°F for three solid hours.", time: 180, refs: [] },
      { text: "Unwrap ribs and generously slop on {1}. Broil intensely for 5 minutes until perfectly sticky.", time: 10, refs: [1] }
    ],
    pickyHack: 'Give them a bone to hold like a dinosaur.'
  },

  // MEDITERRANEAN (3)
  {
    id: 'med_1',
    title: 'Greek Salad with Chicken',
    image: 'https://www.simplyrecipes.com/thmb/MT5nausgqMjh1mE5hhPCdNqugjA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/SImply-Recipes-Grilled-Chicken-Greek-Salad-LEAD-8-c88f094657c54f11827cb503359443b5.jpg',
    difficulty: 'Easy',
    time: '20 min',
    baseServings: 2,
    region: 'Mediterranean',
    ingredients: [
      { amount: 1, unit: 'lb', name: 'Chicken breast', category: 'Meat' },
      { amount: 2, unit: 'cups', name: 'Cucumbers', category: 'Produce' },
      { amount: 1, unit: 'cup', name: 'Cherry tomatoes', category: 'Produce' },
      { amount: 0.5, unit: 'cup', name: 'Feta cheese', category: 'Dairy' },
      { amount: 0.5, unit: 'cup', name: 'Kalamata olives', category: 'Pantry' }
    ],
    detailedSteps: [
      { text: "Grill or pan-sear the {0} until fully cooked. Let rest, then slice.", time: 15, refs: [0] },
      { text: "Chop the {1} into bite-sized chunks. Halve the {2} and the {4}.", time: 5, refs: [1, 2, 4] },
      { text: "Toss everything together. Crumble the {3} heavily over the top.", time: 2, refs: [3] }
    ],
    pickyHack: 'Serve all the components separated on a plate.'
  },
  {
    id: 'med_2',
    title: 'Falafel Wraps',
    image: 'https://thumbs.dreamstime.com/b/falafel-wrap-vegetables-falafel-wrap-vegetables-to-go-280561105.jpg',
    difficulty: 'Medium',
    time: '45 min',
    baseServings: 4,
    region: 'Mediterranean',
    ingredients: [
      { amount: 1, unit: 'can', name: 'Chickpeas', category: 'Pantry' },
      { amount: 4, unit: '', name: 'Pita breads', category: 'Pantry' },
      { amount: 0.5, unit: 'cup', name: 'Tzatziki sauce', category: 'Dairy' },
      { amount: 1, unit: 'cup', name: 'Lettuce', category: 'Produce' },
      { amount: 2, unit: 'cloves', name: 'Garlic', category: 'Produce' }
    ],
    detailedSteps: [
      { text: "Drain and rinse the {0}. Pulse in a food processor with minced {4} until crumbly.", time: 10, refs: [0, 4] },
      { text: "Form into small patties. Pan-fry until deeply browned and crisp.", time: 15, refs: [] },
      { text: "Warm the {1} so they are pliable. Smear generously with {2}.", time: 3, refs: [1, 2] },
      { text: "Fill pitas with falafel patties and shredded {3}.", time: 2, refs: [3] }
    ],
    pickyHack: 'Call them "mini burger bites" and serve pita separately.'
  },
  {
    id: 'med_3',
    title: 'Lemon Herb Fish',
    image: 'https://deliciousdetour.com/wp-content/uploads/2023/08/Lemon-Brown-Butter-Fish-2.jpg',
    difficulty: 'Easy',
    time: '25 min',
    baseServings: 2,
    region: 'Mediterranean',
    ingredients: [
      { amount: 2, unit: 'fillets', name: 'White fish', category: 'Meat' },
      { amount: 1, unit: '', name: 'Lemon', category: 'Produce' },
      { amount: 2, unit: 'tbsp', name: 'Olive oil', category: 'Pantry' },
      { amount: 1, unit: 'tbsp', name: 'Oregano', category: 'Pantry' },
      { amount: 1, unit: 'cup', name: 'Cherry tomatoes', category: 'Produce' }
    ],
    detailedSteps: [
      { text: "Drizzle the {2} over the {0}. Rub aggressively with {3}.", time: 5, refs: [2, 0, 3] },
      { text: "Bake at 400°F alongside the {4} until the fish is flaky.", time: 15, refs: [4] },
      { text: "Squeeze fresh {1} juice all over the fish immediately out of the oven.", time: 1, refs: [1] }
    ],
    pickyHack: 'Exclude tomatoes and call it "pirate treasure fish."'
  },

  // PLAN B (3)
  {
    id: 'plan_b_1',
    title: '15-Minute Pesto Salmon',
    image: 'https://thumbs.dreamstime.com/b/grilled-salmon-fillet-lemon-microgreens-plate-gourmet-restaurant-plating-high-quality-photo-419585813.jpg',
    time: '15 min',
    difficulty: 'Easy',
    baseServings: 2,
    isPlanB: true,
    region: 'Global',
    ingredients: [
      { amount: 2, unit: 'fillets', name: 'Salmon', category: 'Meat' },
      { amount: 3, unit: 'tbsp', name: 'Pesto', category: 'Pantry' },
      { amount: 1, unit: 'bag', name: 'Spinach', category: 'Produce' }
    ],
    detailedSteps: [
      { text: "Preheat oven to 400°F. Lay out the {0} on a baking sheet and slather thickly with {1}.", time: 3, refs: [0, 1] },
      { text: "Bake for 10-12 minutes until the fish flakes easily with a fork.", time: 12, refs: [] },
      { text: "In the last minute, briefly wilt the {2} in a pan with a splash of water to serve alongside.", time: 2, refs: [2] }
    ],
    pickyHack: 'Give them the salmon without pesto if green stuff is scary.'
  },
  {
    id: 'plan_b_2',
    title: 'BBQ Chicken Quesadillas',
    image: 'https://media.chefdehome.com/750/0/0/bbq-chicken-quesadilla/bbq-chicken-grilled-quesadilla-chefdehome-5.jpg',
    time: '15 min',
    difficulty: 'Easy',
    baseServings: 2,
    isPlanB: true,
    region: 'Mexican',
    ingredients: [
      { amount: 4, unit: 'large', name: 'Tortillas', category: 'Pantry' },
      { amount: 1, unit: 'cup', name: 'Shredded rotisserie chicken', category: 'Meat' },
      { amount: 0.5, unit: 'cup', name: 'BBQ sauce', category: 'Pantry' },
      { amount: 1, unit: 'cup', name: 'Shredded cheese', category: 'Dairy' }
    ],
    detailedSteps: [
      { text: "In a bowl, toss the {1} with the {2} until completely coated.", time: 2, refs: [1, 2] },
      { text: "Lay out two {0}. Scatter half the {3} evenly.", time: 2, refs: [0, 3] },
      { text: "Pile on the chicken, top with remaining cheese, and cover with the other tortillas.", time: 2, refs: [] },
      { text: "Toast in a hot skillet for 3 minutes per side until deeply golden and melty.", time: 6, refs: [] }
    ],
    pickyHack: 'Make a plain cheese quesadilla on the side.'
  },
  {
    id: 'plan_b_3',
    title: '15-Minute Tomato Soup',
    image: 'https://wellnessbykay.com/wp-content/uploads/2023/10/grilled-cheese-with-tomato-soup-684x1024.jpg',
    time: '15 min',
    difficulty: 'Easy',
    baseServings: 4,
    isPlanB: true,
    region: 'Global',
    ingredients: [
      { amount: 1, unit: 'can (28 oz)', name: 'Crushed tomatoes', category: 'Pantry' },
      { amount: 0.5, unit: 'cup', name: 'Heavy cream', category: 'Dairy' },
      { amount: 1, unit: 'tbsp', name: 'Olive oil', category: 'Pantry' },
      { amount: 8, unit: 'slices', name: 'Bread', category: 'Pantry' },
      { amount: 4, unit: 'slices', name: 'Cheddar cheese', category: 'Dairy' },
    ],
    detailedSteps: [
      { text: "Simmer the {0} in a pot and slowly stir in the {1} to create a rich soup base.", time: 10, refs: [0, 1] },
      { text: "Brush the {3} with {2} and assemble sandwiches with the {4}.", time: 3, refs: [3, 2, 4] },
      { text: "Grill the sandwiches until golden and cheese is gooey.", time: 5, refs: [] }
    ],
    pickyHack: 'Serve soup in a mug to sip like hot cocoa.'
  }
];
