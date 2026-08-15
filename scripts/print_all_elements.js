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
    console.log(`[${idx}] ${el.imgRelId ? 'IMAGE: ' + el.mediaFile + ' | ' : ''}${el.text || ''}`);
  });
});
