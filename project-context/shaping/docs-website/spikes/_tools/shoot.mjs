// Usage: node shoot.mjs <baseUrl> <outDir> [pagePath...]
// Full-page screenshots of each page in light and dark, at desktop and phone width.
import { chromium } from 'playwright';
const [base, out, ...paths] = process.argv.slice(2);
const pages = paths.length ? paths : ['/'];
const sizes = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) for (const [size, viewport] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ viewport, colorScheme: scheme });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const name = (p.replace(/^\/|\.html$|\/$/g, '') || 'home').replace(/\//g, '-');
    await page.screenshot({ path: `${out}/${name}-${scheme}-${size}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
