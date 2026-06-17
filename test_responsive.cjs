fetch('http://localhost:3000/api/health').then(res => res.text()).then(t => console.log('Responsive:', t)).catch(e => console.error('Error:', e.message));
