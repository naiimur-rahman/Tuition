const fs = require('fs');

const file = '/Users/naimurrahman/Downloads/Tuition/tuition-bd/src/components/Navbar.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{isLinkActive\([^)]+\)\s*&&\s*\(\s*<motion\.div\s*layoutId="activeNavIndicator"[^>]+\/>\s*\)\}/g, '');

fs.writeFileSync(file, content);
console.log('Removed activeNavIndicator from Navbar.tsx');
