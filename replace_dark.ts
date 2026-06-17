import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Use literal string replacement for the first item
content = content.replace(
  'className="w-full min-h-screen bg-gray-100 flex justify-center font-sans tracking-tight text-[#333333]"',
  'className={`w-full min-h-screen bg-gray-100 dark:bg-black flex justify-center font-sans tracking-tight text-[#333333] dark:text-[#E5E5EA] ${userState.theme === "dark" ? "dark" : ""}`}'
);

content = content.replace(
  'const { favorites, toggleFavorite } = useAppStore();',
  'const { favorites, toggleFavorite, userState } = useAppStore();'
);

content = content.replace(
  'className="w-full max-w-md bg-[#FDFBF7] min-h-screen relative shadow-2xl flex flex-col"',
  'className="w-full max-w-md bg-[#FDFBF7] dark:bg-[#1C1C1E] min-h-screen relative shadow-2xl flex flex-col transition-colors duration-300"'
);

// Global replacements for colors
content = content.replaceAll('bg-[#FDFBF7]', 'bg-[#FDFBF7] dark:bg-[#1C1C1E]');
content = content.replaceAll('text-[#333333]', 'text-[#333333] dark:text-[#E5E5EA]');
content = content.replaceAll('bg-white', 'bg-white dark:bg-[#2C2C2E]');
content = content.replaceAll('bg-gray-50', 'bg-gray-50 dark:bg-[#262628]');
content = content.replaceAll('bg-gray-100', 'bg-gray-100 dark:bg-[#38383A]');
content = content.replaceAll('border-gray-100', 'border-gray-100 dark:border-[#38383A]');
content = content.replaceAll('border-gray-200', 'border-gray-200 dark:border-[#38383A]');
content = content.replaceAll('text-gray-400', 'text-gray-400 dark:text-gray-500');
content = content.replaceAll('text-gray-500', 'text-gray-500 dark:text-gray-400');
content = content.replaceAll('text-gray-600', 'text-gray-600 dark:text-gray-300');
content = content.replaceAll('text-gray-800', 'text-gray-800 dark:text-gray-200');

// Fix accidental duplicates
content = content.replaceAll('dark:bg-[#1C1C1E] dark:bg-[#1C1C1E]', 'dark:bg-[#1C1C1E]');
content = content.replaceAll('dark:text-[#E5E5EA] dark:text-[#E5E5EA]', 'dark:text-[#E5E5EA]');
content = content.replaceAll('dark:bg-[#2C2C2E] dark:bg-[#2C2C2E]', 'dark:bg-[#2C2C2E]');

// Also add a theme toggle button in SettingsView
content = content.replace(
  '<div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">',
  `<div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-[#38383A] overflow-hidden mb-6">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#8A9A86]/20 flex items-center justify-center text-[#8A9A86]">
                   <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[#333333] dark:text-[#E5E5EA]">Dark Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Toggle dark appearance</div>
                </div>
              </div>
              <button
                onClick={() => setTheme(userState.theme === 'dark' ? 'light' : 'dark')}
                className={\`flex items-center w-12 h-6 rounded-full p-1 transition-colors \${userState.theme === 'dark' ? 'bg-[#8A9A86]' : 'bg-gray-300 dark:bg-gray-600'}\`}
              >
                <div className={\`w-4 h-4 rounded-full bg-white transition-transform \${userState.theme === 'dark' ? 'translate-x-6' : ''}\`} />
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-[#38383A] overflow-hidden">`
);

// SettingsView needs setTheme
content = content.replace(
  'const { userState, setLanguage, setPremium, setPreferredUnits } = useAppStore();',
  'const { userState, setLanguage, setPremium, setPreferredUnits, setTheme } = useAppStore();'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced!");
