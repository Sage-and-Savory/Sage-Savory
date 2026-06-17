const https = require('https');
https.get('https://zmgtllzebsgfolgytznp.supabase.co', (res) => {
  console.log('StatusCode:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
