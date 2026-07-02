const puppeteer = require('puppeteer');
const path = require('path');

const url = 'file://' + path.join(__dirname, 'template.html');
const jobs = [
  { f: 'square', w: 1200, h: 1200, dsf: 2, out: 'wanderingbar-square-1200.png' },
  { f: 'story',  w: 1080, h: 1920, dsf: 2, out: 'wanderingbar-story-1080x1920.png' },
  { f: 'banner', w: 1200, h: 675,  dsf: 2, out: 'wanderingbar-banner-1200x675.png' },
  { f: 'poster', w: 850,  h: 1100, dsf: 3, out: 'wanderingbar-poster-letter-2550x3300.png' },
];

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
  for (const j of jobs) {
    const page = await browser.newPage();
    await page.setViewport({ width: j.w, height: j.h, deviceScaleFactor: j.dsf });
    await page.goto(`${url}?f=${j.f}`, { waitUntil: 'networkidle0', timeout: 60000 });
    try { await page.evaluate(() => document.fonts.ready); } catch (e) {}
    await new Promise(r => setTimeout(r, 400));
    const el = await page.$('.stage');
    await el.screenshot({ path: path.join(__dirname, j.out) });
    console.log('✓', j.out, `${j.w*j.dsf}x${j.h*j.dsf}`);
    await page.close();
  }
  await browser.close();
})();
