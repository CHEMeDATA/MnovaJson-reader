const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const folderArg = process.argv[2] || 'demo';
const htmlDir = path.resolve(__dirname, '..', folderArg);

if (!fs.existsSync(htmlDir)) {
  console.error(`❌ Folder "${htmlDir}" does not exist.`);
  process.exit(1);
}

const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));
if (htmlFiles.length === 0) {
  console.warn(`⚠️ No .html files found in ${htmlDir}`);
  process.exit(0);
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  let hasErrors = false;

  for (const file of htmlFiles) {
    const filePath = `file://${path.join(htmlDir, file)}`;
    console.log(`\n🔍 Testing ${file}...`);

    page.removeAllListeners('pageerror');
    page.on('pageerror', (err) => {
      console.error(`🚨 JS error in ${file}:\n`, err.toString());
      hasErrors = true;
    });

    try {
      await page.goto(filePath, { waitUntil: 'load', timeout: 10000 });

      const d3Count = await page.evaluate(() => {
        if (typeof d3 === 'undefined') return -1;
        return d3.selectAll('*').size();
      });

      if (d3Count === -1) {
        console.warn(`⚠️  D3.js not found in ${file}`);
      } else {
        console.log(`📊 D3 object count: ${d3Count}`);
      }

    } catch (e) {
      console.error(`❌ Failed to load ${file}:`, e.message);
      hasErrors = true;
    }
  }

  await browser.close();

  if (hasErrors) {
    console.error('\n❌ One or more HTML files failed.');
    process.exit(1);
  } else {
    console.log('\n✅ All HTML files loaded successfully with no JS errors.');
  }
})();
