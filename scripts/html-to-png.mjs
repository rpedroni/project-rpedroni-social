#!/usr/bin/env node
/**
 * HTML to PNG renderer for Instagram posts
 * Uses Puppeteer with local Chrome to render at exact dimensions
 * 
 * Usage: node html-to-png.mjs <input.html> <output.png> [width] [height] [scale]
 * 
 * Defaults: 1080x1350 (4:5 Instagram portrait) at 2x scale
 */

import puppeteer from 'puppeteer-core';
import { resolve } from 'path';

const [,, inputFile, outputFile, widthStr = '1080', heightStr = '1350', scaleStr = '2'] = process.argv;

if (!inputFile || !outputFile) {
  console.error('Usage: node html-to-png.mjs <input.html> <output.png> [width] [height] [scale]');
  process.exit(1);
}

const width = parseInt(widthStr);
const height = parseInt(heightStr);
const scale = parseFloat(scaleStr);

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();

await page.setViewport({ 
  width, 
  height, 
  deviceScaleFactor: scale  // 2x for retina quality
});

const filePath = resolve(inputFile);
await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 15000 });

// Wait for fonts to load
await page.evaluateHandle('document.fonts.ready');

await page.screenshot({
  path: resolve(outputFile),
  type: 'png',
  clip: { x: 0, y: 0, width, height }
});

const stats = await import('fs').then(fs => fs.statSync(resolve(outputFile)));
console.log(`✅ Rendered ${width}x${height} @${scale}x → ${outputFile} (${(stats.size / 1024).toFixed(0)}KB)`);

await browser.close();
