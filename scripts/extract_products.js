const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'docx_extracted');
const folders = fs.readdirSync(baseDir);

const allProducts = [];

folders.forEach(folder => {
  const xmlPath = path.join(baseDir, folder, 'word', 'document.xml');
  const relsPath = path.join(baseDir, folder, 'word', '_rels', 'document.xml.rels');
  
  if (!fs.existsSync(xmlPath)) return;

  const xml = fs.readFileSync(xmlPath, 'utf8');
  let relsMap = {};
  if (fs.existsSync(relsPath)) {
    const relsXml = fs.readFileSync(relsPath, 'utf8');
    const relMatches = relsXml.matchAll(/Id="(rId\d+)"[^>]*Target="(media\/[^"]+)"/g);
    for (const m of relMatches) {
      relsMap[m[1]] = m[2];
    }
  }

  // Parse structure into blocks (paragraphs and images)
  const blockRegex = /<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g;
  let match;
  let elements = [];

  while ((match = blockRegex.exec(xml)) !== null) {
    const pContent = match[1];
    
    // Extract text
    const tRegex = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
    let tMatch;
    let text = '';
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      text += tMatch[1];
    }
    text = text.trim();

    // Extract image rId
    let imgRelId = null;
    const blipMatch = /<a:blip[^>]*r:embed="(rId\d+)"/g.exec(pContent);
    if (blipMatch) {
      imgRelId = blipMatch[1];
    }

    if (text || imgRelId) {
      elements.push({ text, imgRelId, mediaFile: imgRelId ? relsMap[imgRelId] : null });
    }
  }

  console.log(`=== Processing folder: ${folder} (elements: ${elements.length}) ===`);
  
  // We can group elements into products. Products usually start with a title line or MRP line.
  // Let's dump all text lines first to understand structure per folder.
  const dumpFile = path.join(__dirname, `dump_${folder.replace(/[^a-zA-Z0-9]/g, '_')}.json`);
  fs.writeFileSync(dumpFile, JSON.stringify(elements, null, 2));
});

console.log('Dump completed.');
