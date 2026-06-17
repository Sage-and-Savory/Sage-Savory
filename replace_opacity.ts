import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replaceAll('bg-white dark:bg-[#2C2C2E]/20', 'bg-white/20 dark:bg-[#2C2C2E]/20');
content = content.replaceAll('bg-white dark:bg-[#2C2C2E]/40', 'bg-white/40 dark:bg-[#2C2C2E]/40');
content = content.replaceAll('bg-white dark:bg-[#2C2C2E]/80', 'bg-white/80 dark:bg-[#2C2C2E]/80');
content = content.replaceAll('bg-white dark:bg-[#2C2C2E]/90', 'bg-white/90 dark:bg-[#2C2C2E]/90');
content = content.replaceAll('bg-gray-50 dark:bg-[#262628]/50', 'bg-gray-50/50 dark:bg-[#262628]/50');

// One detail check. Wait, in `App.tsx` did I replace `text-white` anywhere? No, I only replaced `text-[#333333]`.

fs.writeFileSync('src/App.tsx', content);
