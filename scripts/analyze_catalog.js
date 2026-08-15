const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'docx_extracted');
const folders = fs.readdirSync(baseDir);

folders.forEach(folder => {
  const dumpFile = path.join(__dirname, `dump_${folder.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  if (!fs.existsSync(dumpFile)) return;
  const elements = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
  
  console.log(`\n========================================`);
  console.log(`FOLDER: ${folder}`);
  console.log(`========================================`);

  elements.forEach((el, idx) => {
    if (el.text) {
      console.log(`[${idx}] ${el.text.substring(0, 100)}${el.text.length > 100 ? '...' : ''}`);
    }
    if (el.mediaFile) {
      console.log(`  └─ IMAGE: ${el.mediaFile}`);
    }
  });
});
