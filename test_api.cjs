const req = new Request('http://localhost:3000/api/generate-recipe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'tomato, garlic, pasta',
    language: 'en'
  })
});
fetch(req).then(res => {
  console.log('STATUS:', res.status);
  return res.text();
}).then(text => {
  console.log('RESPONSE:', text);
}).catch(err => {
  console.error('ERROR:', err);
});
