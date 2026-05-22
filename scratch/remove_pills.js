const fs = require('fs');

const files = [
  '/Users/naimurrahman/Downloads/Tuition/tuition-bd/src/app/about/page.tsx',
  '/Users/naimurrahman/Downloads/Tuition/tuition-bd/src/app/contact/page.tsx',
  '/Users/naimurrahman/Downloads/Tuition/tuition-bd/src/app/guidelines/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Regex to match the span tags containing the badges
    content = content.replace(/\s*<span className="text-\[10px\] tracking-\[0\.3em\] font-mono font-extrabold uppercase bg-emerald-500\/10 border border-emerald-500\/20 text-emerald-400 px-3\.5 py-1\.5 rounded-full">\s*(Our Mission|Get In Touch|Platform Policies)\s*<\/span>\s*/gi, '\n');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
