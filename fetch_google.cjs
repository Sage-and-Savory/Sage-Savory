const google = require('googlethis');

(async () => {
  const options = {
    page: 0, 
    safe: false, 
    additional_params: { 
      hl: 'en' 
    }
  };
  const response = await google.image('Butter chicken food photography', options);
  console.log(response[0].url);
})();
