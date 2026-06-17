const google = require('googlethis');
const fs = require('fs');

async function updateRecipes() {
  let fileContent = fs.readFileSync('src/recipes.ts', 'utf8');

  const queries = [
    { id: "ind_1", query: "Butter Chicken high quality food photography plating" },
    { id: "ind_2", query: "Palak Paneer high quality food photography plating" },
    { id: "ind_3", query: "Chana Masala high quality food photography plating" },
    { id: "mex_1", query: "Chicken Fajitas high quality food photography plating" },
    { id: "mex_2", query: "Beef Enchiladas high quality food photography plating" },
    { id: "mex_3", query: "Churros with Chocolate high quality food photography plating" },
    { id: "ita_1", query: "Spaghetti Carbonara high quality food photography plating" },
    { id: "ita_2", query: "Margherita Pizza high quality food photography plating" },
    { id: "ita_3", query: "Mushroom Risotto high quality food photography plating" },
    { id: "asi_1", query: "Beef Stir-Fry high quality food photography plating" },
    { id: "asi_2", query: "Vegetable Pad Thai high quality food photography plating" },
    { id: "asi_3", query: "Chicken Dumplings high quality food photography plating" },
    { id: "ame_1", query: "Classic Cheeseburger high quality food photography plating" },
    { id: "ame_2", query: "Macaroni and Cheese high quality food photography plating" },
    { id: "ame_3", query: "BBQ Ribs high quality food photography plating" },
    { id: "med_1", query: "Greek Salad with Chicken high quality food photography plating" },
    { id: "med_2", query: "Falafel Wrap high quality food photography plating" },
    { id: "med_3", query: "Lemon Herb baked Fish high quality food photography plating" },
    { id: "plan_b_1", query: "Pesto Salmon high quality food photography plating" },
    { id: "plan_b_2", query: "BBQ Chicken Quesadillas high quality food photography plating" },
    { id: "plan_b_3", query: "Tomato Soup with grilled cheese high quality food photography plating" },
  ];

  for (let q of queries) {
    try {
      const response = await google.image(q.query, { page: 0, safe: false, additional_params: { hl: 'en' } });
      if (response && response.length > 0) {
        // filter out any urls that have weird encodings or are data URIs
        const validImages = response.filter(img => img.url.startsWith('https://') && !img.url.includes('x-raw-image'));
        if (validImages.length > 0) {
           let imageUrl = validImages[0].url;
           // replace the image url for the specific ID
           // Look for: id: 'ind_1', \n title: ..., \n image: '...'
           const regex = new RegExp(`(id:\\s*'${q.id}'[\\s\\S]*?image:\\s*')(.*?)(')`);
           if (regex.test(fileContent)) {
             fileContent = fileContent.replace(regex, `$1${imageUrl}$3`);
             console.log(`Updated ${q.id} with ${imageUrl}`);
           } else {
             console.log(`Regex not matched for ${q.id}`);
           }
        }
      }
    } catch(err) {
      console.log(`Error updating ${q.id}`, err.message);
    }
  }

  fs.writeFileSync('src/recipes.ts', fileContent);
}

updateRecipes();
