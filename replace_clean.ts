import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/dark:text-gray-500 dark:text-gray-400/g, 'dark:text-gray-500');
content = content.replace(/dark:text-gray-400 dark:text-gray-500/g, 'dark:text-gray-500');
content = content.replace(/dark:text-gray-200 dark:text-gray-300/g, 'dark:text-gray-200');
content = content.replace(/dark:text-[#E5E5EA] dark:text-gray-200/g, 'dark:text-[#E5E5EA]'); // Maybe some other duplicate?
content = content.replace(/dark:text-[#E5E5EA] dark:text-[#E5E5EA]/g, 'dark:text-[#E5E5EA]');
content = content.replace(/dark:bg-[#2C2C2E] dark:bg-[#38383A]/g, 'dark:bg-[#2C2C2E]');
content = content.replace(/dark:bg-[#1C1C1E] dark:bg-[#1C1C1E]/g, 'dark:bg-[#1C1C1E]');
content = content.replace(/dark:bg-[#38383A] dark:bg-[#38383A]/g, 'dark:bg-[#38383A]');

fs.writeFileSync('src/App.tsx', content);
