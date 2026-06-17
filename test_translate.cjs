const http = require('http');
const req = http.request('http://localhost:3000/api/translate-recipes', { method: 'POST', headers: {'Content-Type': 'application/json'} }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', data.substring(0, 500)));
});
req.write(JSON.stringify({ language: 'es', recipes: [{ id: '1', title: 'Test Recipe', ingredients: [{name: 'apple', amount: 1, unit: 'unit', category: 'Produce'}], detailedSteps: [{text: 'Eat the apple', time: 1, refs: []}] }] }));
req.end();
