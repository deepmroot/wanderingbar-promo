const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const url = 'file://' + path.join(__dirname, 'template.html');

const formats = [
  { f: 'square', w: 1200, h: 1200, dsf: 2, suffix: 'square-1200' },
  { f: 'story',  w: 1080, h: 1920, dsf: 2, suffix: 'story-1080x1920' },
  { f: 'banner', w: 1200, h: 675,  dsf: 2, suffix: 'banner-1200x675' },
  { f: 'poster', w: 850,  h: 1100, dsf: 3, suffix: 'poster-letter-2550x3300' },
];

// optionally render a subset: node render.js booking sips
const all = ['brand', 'wedding', 'party', 'craft', 'booking', 'sips'];
const campaigns = process.argv.length > 2 ? process.argv.slice(2).filter(c => all.includes(c)) : all;

// brand keeps its original filenames so existing links don't break
const outName = (c, fmt) =>
  c === 'brand' ? `wanderingbar-${fmt.suffix}.png` : `wanderingbar-${c}-${fmt.suffix}.png`;

(async () => {
  const outDir = path.join(__dirname, 'images');
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
  for (const c of campaigns) {
    for (const fmt of formats) {
      const page = await browser.newPage();
      await page.setViewport({ width: fmt.w, height: fmt.h, deviceScaleFactor: fmt.dsf });
      await page.goto(`${url}?f=${fmt.f}&c=${c}`, { waitUntil: 'networkidle0', timeout: 60000 });
      try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
      await new Promise(r => setTimeout(r, 400));
      const el = await page.$('.stage');
      const out = outName(c, fmt);
      await el.screenshot({ path: path.join(outDir, out) });
      console.log('✓', out, `${fmt.w * fmt.dsf}x${fmt.h * fmt.dsf}`);
      await page.close();
    }
  }
  await browser.close();
})();
