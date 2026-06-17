import { INITIAL_RECIPES } from './src/recipes';

async function test() {
  const response = await fetch('http://localhost:3000/api/translate-recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'es', recipes: INITIAL_RECIPES })
  });
  const data = await response.text();
  console.log('STATUS:', response.status, 'DATA:', data.substring(0, 500));
}

test();

