const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'tuition-bd', 'src');

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkAndReplace(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('Tuition Console') || content.includes('tuition-bd')) {
        content = content.replace(/Tuition Console/g, 'TutorHire');
        content = content.replace(/Tuition-bd/g, 'TutorHire');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

walkAndReplace(srcDir);
console.log('Done replacing text.');
