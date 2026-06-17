const https = require('https');

async function search(query) {
  return new Promise((resolve, reject) => {
    https.get(`https://unsplash.com/napi/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            resolve(json.results[0].id);
          } else {
            resolve('1548943487-a2e4b43b4850');
          }
        } catch(e) {
          resolve('1548943487-a2e4b43b4850');
        }
      });
    }).on('error', () => resolve('1548943487-a2e4b43b4850'));
  });
}

(async () => {
  const queries = [
    "Butter Chicken", "Palak Paneer", "Chana Masala",
    "Chicken Fajitas", "Beef Enchiladas", "Churros",
    "Spaghetti Carbonara", "Margherita Pizza", "Mushroom Risotto",
    "Beef Stir-Fry", "Vegetable Pad Thai", "Dumplings",
    "Cheeseburger", "Macaroni and cheese", "BBQ Ribs",
    "Greek Salad Chicken", "Falafel Wrap", "Lemon Herb Fish",
    "Pesto Salmon", "Chicken Quesadilla", "Tomato Soup"
  ];
  for (let q of queries) {
    const id = await search(q + " food dish recipe");
    console.log(`${q}: ${id}`);
  }
})();
