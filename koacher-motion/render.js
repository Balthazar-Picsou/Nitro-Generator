// Frame-by-frame renderer: headless Chromium -> PNG frames -> ffmpeg (H.264).
//   node render.js                 render every scene + the continuous master video
//   node render.js --stills        one PNG per scene (end-of-scene state) for review
//   node render.js --scenes 3,11   re-render only these scenes (1-based), then re-assemble
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require(process.env.PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright');

const FPS = 30;
const TAIL = 0.5; // exit transition between scenes, only in the master video
const WORKERS = 4;
const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const MASTER = path.join(OUT, 'KOACHER_E4_ciblage_prospection.mp4');

const args = process.argv.slice(2);
const stills = args.includes('--stills');
const only = args.includes('--scenes') ? args[args.indexOf('--scenes') + 1].split(',').map(n => +n - 1) : null;

function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error('ffmpeg ' + c)) : res())));
  return { ff, done };
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(ROOT, 'index.html') + '?t=0');
  await page.evaluate(() => document.fonts.ready);
  return page;
}

async function renderRange(page, i, from, to, exit, file) {
  const { ff, done } = encoder(file);
  const n = Math.round((to - from) * FPS);
  for (let f = 0; f < n; f++) {
    const lt = from + f / FPS;
    const ex = exit ? (f + 1) / n : 0;
    await page.evaluate(([i, lt, ex]) => window.renderScene(i, lt, ex), [i, lt, ex]);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
}

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--font-render-hinting=none'] });
  const probe = await openPage(browser);
  const scenes = await probe.evaluate(() => window.SCENES);
  const pad = k => String(k + 1).padStart(2, '0');

  if (stills) {
    fs.mkdirSync(path.join(OUT, 'stills'), { recursive: true });
    for (let i = 0; i < scenes.length; i++) {
      if (only && !only.includes(i)) continue;
      await probe.evaluate(([i, t]) => window.renderScene(i, t), [i, scenes[i].dur - 0.05]);
      await probe.screenshot({ path: path.join(OUT, 'stills', `${scenes[i].name}.png`) });
    }
    await browser.close();
    return;
  }

  fs.mkdirSync(path.join(OUT, 'slides'), { recursive: true });
  fs.mkdirSync(path.join(OUT, '.tails'), { recursive: true });
  const jobs = [];
  scenes.forEach((s, i) => {
    if (only && !only.includes(i)) return;
    jobs.push({ i, from: 0, to: s.dur, exit: false, file: path.join(OUT, 'slides', `${s.name}.mp4`), cost: s.dur });
    if (i < scenes.length - 1) jobs.push({ i, from: s.dur, to: s.dur + TAIL, exit: true, file: path.join(OUT, '.tails', `${pad(i)}.mp4`), cost: TAIL });
  });
  jobs.sort((a, b) => b.cost - a.cost);

  const t0 = Date.now();
  let left = jobs.length;
  const pages = [probe, ...(await Promise.all(Array.from({ length: WORKERS - 1 }, () => openPage(browser))))];
  await Promise.all(pages.map(async page => {
    for (let job = jobs.shift(); job; job = jobs.shift()) {
      await renderRange(page, job.i, job.from, job.to, job.exit, job.file);
      console.log(`${path.basename(job.file)} ok (${--left} restants, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  }));
  await browser.close();

  const list = [];
  scenes.forEach((s, i) => {
    list.push(`file '${path.join(OUT, 'slides', `${s.name}.mp4`)}'`);
    if (i < scenes.length - 1) list.push(`file '${path.join(OUT, '.tails', `${pad(i)}.mp4`)}'`);
  });
  fs.writeFileSync(path.join(OUT, '.concat.txt'), list.join('\n') + '\n');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(OUT, '.concat.txt'), '-c', 'copy', '-movflags', '+faststart', MASTER]);

  // chapter list for cutting the master into slides
  let t = 0;
  const fmtT = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  const rows = scenes.map((s, i) => {
    const r = `${pad(i)}  ${fmtT(t)} → ${fmtT(t + s.dur)}  ${s.name}`;
    t += s.dur + (i < scenes.length - 1 ? TAIL : 0);
    return r;
  });
  fs.writeFileSync(path.join(OUT, 'chapitres.txt'), rows.join('\n') + '\n');
  console.log(rows.join('\n'));
  console.log('master:', MASTER);
})().catch(e => { console.error(e); process.exit(1); });
