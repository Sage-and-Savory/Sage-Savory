import fs from 'fs';
import path from 'path';

const additions = {
  en: { whatsInYourFridge: "What's in your fridge?", fridgePlaceholder: "e.g. Chicken, broccoli, rice...", generate: "Generate", thinking: "Thinking...", camera: "Camera", gallery: "Gallery", measurements: "Measurements", preferredRecipeUnits: "Preferred recipe units", usSystem: "US system", metricIndia: "Metric / India", darkMode: "Dark Mode", toggleDarkAppearance: "Toggle dark appearance", preferences: "Preferences" },
  es: { whatsInYourFridge: "¿Qué hay en tu refri?", fridgePlaceholder: "Ej. Pollo, brócoli, arroz...", generate: "Generar", thinking: "Pensando...", camera: "Cámara", gallery: "Galería", measurements: "Medidas", preferredRecipeUnits: "Unidades preferidas", usSystem: "Sistema US", metricIndia: "Métrico / India", darkMode: "Modo Oscuro", toggleDarkAppearance: "Alternar apariencia oscura", preferences: "Preferencias" },
  fr: { whatsInYourFridge: "Qu'y a-t-il dans le frigo ?", fridgePlaceholder: "ex. Poulet, brocoli, riz...", generate: "Générer", thinking: "Réflexion...", camera: "Caméra", gallery: "Galerie", measurements: "Mesures", preferredRecipeUnits: "Unités de recettes préférées", usSystem: "Système US", metricIndia: "Métrique / Inde", darkMode: "Mode Sombre", toggleDarkAppearance: "Basculer l'apparence", preferences: "Préférences" },
  de: { whatsInYourFridge: "Was ist im Kühlschrank?", fridgePlaceholder: "z.B. Hähnchen, Brokkoli, Reis...", generate: "Generieren", thinking: "Denken...", camera: "Kamera", gallery: "Galerie", measurements: "Maßeinheiten", preferredRecipeUnits: "Bevorzugte Einheiten", usSystem: "US-System", metricIndia: "Metrisch / Indien", darkMode: "Dunkelmodus", toggleDarkAppearance: "Dunkle Optik", preferences: "Präferenzen" },
  it: { whatsInYourFridge: "Cosa c'è nel frigo?", fridgePlaceholder: "Es. Pollo, broccoli, riso...", generate: "Genera", thinking: "Pensando...", camera: "Fotocamera", gallery: "Galleria", measurements: "Misure", preferredRecipeUnits: "Unità preferite", usSystem: "Sistema US", metricIndia: "Metrico / India", darkMode: "Modalità Scusa", toggleDarkAppearance: "Alterna aspetto scuro", preferences: "Preferenze" },
  pt: { whatsInYourFridge: "O que tem na geladeira?", fridgePlaceholder: "Ex: Frango, brócolis, arroz...", generate: "Gerar", thinking: "Pensando...", camera: "Câmera", gallery: "Galeria", measurements: "Medidas", preferredRecipeUnits: "Unidades preferidas", usSystem: "Sistema US", metricIndia: "Métrico / Índia", darkMode: "Modo Escuro", toggleDarkAppearance: "Alternar aparência", preferences: "Preferências" },
  zh: { whatsInYourFridge: "冰箱里有什么？", fridgePlaceholder: "例如：鸡肉，西兰花，米饭...", generate: "生成", thinking: "思考中...", camera: "相机", gallery: "相册", measurements: "测量单位", preferredRecipeUnits: "首选食谱单位", usSystem: "美制单位", metricIndia: "公制 / 印度", darkMode: "深色模式", toggleDarkAppearance: "切换深色外观", preferences: "偏好设置" },
  ja: { whatsInYourFridge: "冷蔵庫に何がありますか？", fridgePlaceholder: "例：鶏肉、ブロッコリー、ご飯...", generate: "生成する", thinking: "考え中...", camera: "カメラ", gallery: "ギャラリー", measurements: "測定単位", preferredRecipeUnits: "優先するレシピの単位", usSystem: "米国単位", metricIndia: "メートル法 / インド", darkMode: "ダークモード", toggleDarkAppearance: "ダークモードの切り替え", preferences: "設定" },
  ko: { whatsInYourFridge: "냉장고에 무엇이 있나요?", fridgePlaceholder: "예: 닭고기, 브로콜리, 쌀...", generate: "생성", thinking: "생각 중...", camera: "카메라", gallery: "갤러리", measurements: "측정 단위", preferredRecipeUnits: "선호하는 레시피 단위", usSystem: "미국 단위", metricIndia: "미터법 / 인도", darkMode: "다크 모드", toggleDarkAppearance: "다크 모드 전환", preferences: "환경설정" },
  ru: { whatsInYourFridge: "Что в холодильнике?", fridgePlaceholder: "Например: Курица, брокколи, рис...", generate: "Сгенерировать", thinking: "Думаю...", camera: "Камера", gallery: "Галерея", measurements: "Измерения", preferredRecipeUnits: "Предпочитаемые единицы", usSystem: "Система США", metricIndia: "Метрическая / Индия", darkMode: "Темный режим", toggleDarkAppearance: "Переключить темный вид", preferences: "Предпочтения" },
  hi: { whatsInYourFridge: "फ्रिज में क्या है?", fridgePlaceholder: "उदाहरण: चिकन, ब्रोकोली, चावल...", generate: "उत्पन्न करें", thinking: "सोच रहा हूँ...", camera: "कैमरा", gallery: "गैलरी", measurements: "माप", preferredRecipeUnits: "पसंदीदा नुस्खा इकाइयां", usSystem: "अमेरिकी प्रणाली", metricIndia: "मीट्रिक / भारत", darkMode: "डार्क मोड", toggleDarkAppearance: "डार्क मोड टॉगल करें", preferences: "प्राथमिकताएं" },
  bn: { whatsInYourFridge: "ফ্রিজে কি আছে?", fridgePlaceholder: "যেমন চিকেন, ব্রকোলি, ভাত...", generate: "তৈরি করুন", thinking: "ভাবছি...", camera: "ক্যামেরা", gallery: "গ্যালারি", measurements: "পরিমাপ", preferredRecipeUnits: "পছন্দের রেসিপি ইউনিট", usSystem: "ইউএস সিস্টেম", metricIndia: "মেট্রিক / ভারত", darkMode: "ডার্ক মোড", toggleDarkAppearance: "ডার্ক মোড টগল করুন", preferences: "পছন্দসমূহ" },
  ta: { whatsInYourFridge: "குளிர்சாதனப் பெட்டியில் என்ன இருக்கிறது?", fridgePlaceholder: "உதாரணமாக சிக்கன், ப்ரோக்கோலி, அரிசி...", generate: "உருவாக்கு", thinking: "யோசிக்கிறது...", camera: "காமெரா", gallery: "கேலரி", measurements: "அளவீடுகள்", preferredRecipeUnits: "விருப்பமான அலகுகள்", usSystem: "யுஎஸ் அமைப்பு", metricIndia: "மெட்ரிக் / இந்தியா", darkMode: "இருண்ட பயன்முறை", toggleDarkAppearance: "இருண்ட பயன்முறையை மாற்றவும்", preferences: "விருப்பங்கள்" },
  ml: { whatsInYourFridge: "ഫ്രിഡ്ജിൽ എന്തൊക്കെയുണ്ട്?", fridgePlaceholder: "ഉദാഹരണത്തിന് ചിക്കൻ, ബ്രൊക്കോളി, അരി...", generate: "സൃഷ്ടിക്കുക", thinking: "ചിന്തിക്കുന്നു...", camera: "കാമറ", gallery: "ഗ്യാലറി", measurements: "അളവുകൾ", preferredRecipeUnits: "തിരഞ്ഞെടുത്ത പാചക യൂണിറ്റുകൾ", usSystem: "യുഎസ് സിസ്റ്റം", metricIndia: "മെട്രിക് / ഇന്ത്യ", darkMode: "ഡാർക്ക് മോഡ്", toggleDarkAppearance: "ഡാർക്ക് മോഡ് മാറുക", preferences: "മുൻഗണനകൾ" }
};

const dir = path.join(process.cwd(), 'public', 'locales');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.json')) {
    const lang = file.replace('.json', '');
    const p = path.join(dir, file);
    const existing = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    const newContent = { ...existing, ...(additions[lang] || additions['en']) };
    fs.writeFileSync(p, JSON.stringify(newContent, null, 2));
  }
}

console.log("Updated translation files with new keys");
