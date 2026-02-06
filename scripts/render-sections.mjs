#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import { resolve } from 'path';

const [,, inputFile, outputPrefix = '/tmp/scribble'] = process.argv;

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--no-sandbox']
});

const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });

const filePath = resolve(inputFile);
await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 15000 });
await page.evaluateHandle('document.fonts.ready');

const ids = process.argv[4] ? process.argv[4].split(',') : ['v-a', 'v-b', 'v-c', 'v-d', 'v-e'];

for (const id of ids) {
  const el = await page.$(`#${id}`);
  if (el) {
    const box = await el.boundingBox();
    await page.screenshot({
      path: `${outputPrefix}-${id.replace('v-','')}.png`,
      type: 'png',
      clip: { x: box.x, y: box.y, width: 1080, height: 1350 }
    });
    console.log(`✅ ${id} → ${outputPrefix}-${id.replace('v-','')}.png`);
  }
}

await browser.close();
