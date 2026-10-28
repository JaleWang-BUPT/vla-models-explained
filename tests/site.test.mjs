import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { pages } from '../content.mjs';
import { media } from '../media.mjs';
import { deepDives, teachingExamples } from '../research-notes.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(root, path));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const provenance = JSON.parse(read('media-provenance.json'));
const stylesheet = read('build.mjs').toString().match(/const CSS = `([\s\S]*?)`;/)[1];
const chapters = pages.filter(p => !['index', 'credits'].includes(p.file));

test('original Claude-style CSS is byte-for-byte unchanged', () => {
  assert.equal(hash(stylesheet), provenance.style.cssSha256);
  assert.equal(pages.length, 8);
  assert.equal(chapters.length, 6);
  for (const p of pages) {
    assert.doesNotMatch(p.body, /<style\b|\bstyle=/i, p.file);
    const html = read(`docs/${p.file}.html`).toString();
    assert.equal(html.match(/<style>([\s\S]*?)<\/style>/)[1], stylesheet);
  }
});

test('every published asset has traceable attribution and a matching snapshot', () => {
  assert.deepEqual(provenance.files.map(m => m.file).sort(), Object.keys(media).sort());
  const combined = chapters.map(p => p.body).join('\n');
  for (const entry of provenance.files) {
    assert.equal(hash(read(`assets/${entry.file}`)), entry.sha256, entry.file);
    assert.equal(hash(read(`docs/assets/${entry.file}`)), entry.sha256, `built ${entry.file}`);
    assert.equal(entry.sourcePage, media[entry.file].source);
    assert.match(entry.sourcePage, /^https:\/\//);
    assert.ok(combined.includes(`./assets/${entry.file}`), `unused catalogue entry ${entry.file}`);
    assert.ok(media[entry.file].alt.length > 6, entry.file);
    if (entry.video) {
      assert.equal(entry.video.codec, 'h264');
      assert.ok(entry.video.durationSeconds > 0 && entry.video.frames > 1);
      assert.ok(entry.video.width > 0 && entry.video.height > 0);
      assert.equal(hash(read(`assets/${entry.poster.file}`)), entry.poster.sha256);
      assert.equal(hash(read(`docs/assets/${entry.poster.file}`)), entry.poster.sha256);
    }
  }
  assert.equal(provenance.files.filter(m => m.video).length, 9);
});

test('official animations keep controls and never force autoplay', () => {
  for (const p of chapters) {
    const videos = [...p.body.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)];
    assert.ok(videos.length, `${p.file}: official animation missing`);
    assert.ok(p.body.includes('<img '), `${p.file}: paper/project figure missing`);
    assert.doesNotMatch(p.body, /<svg\b|<animateMotion\b|\bautoplay\b/i);
    for (const [, attributes, body] of videos) {
      for (const required of ['controls', 'playsinline', 'preload="metadata"', 'poster=', 'aria-label=']) {
        assert.ok(attributes.includes(required), `${p.file}: missing ${required}`);
      }
      assert.ok(body.includes('type="video/mp4"'));
      assert.ok(body.includes('打开媒体文件'));
    }
    assert.doesNotMatch(p.body, /alt=""/);
  }
});

test('six chapters each have five substantial, clearly labelled deep-dive sections', () => {
  assert.equal(Object.keys(deepDives).length, 6);
  for (const p of chapters) {
    const sections = deepDives[p.file];
    assert.equal(sections.length, 5, p.file);
    assert.equal((p.body.match(/<h2\b/g) || []).length, 10, p.file);
    assert.ok(sections.every(section => section.body.length > 300), p.file);
    assert.match(p.body, /教学算例/);
    assert.match(p.body, /研究建议/);
    assert.match(p.body, /不是论文新结果或作者默认配置/);
    for (const section of sections) {
      assert.ok(p.body.includes(`<h2 id="${section.id}">${section.title}</h2>`));
    }
  }
});

test('chapter contents link to every section and every local fragment exists', () => {
  const documents = new Map(pages.map(p => [p.file + '.html', read(`docs/${p.file}.html`).toString()]));
  for (const p of pages) {
    const ids = [...p.body.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `${p.file}: duplicate anchors`);
    if (deepDives[p.file]) {
      const toc = p.body.match(/<nav class="toc"[\s\S]*?<\/nav>/)?.[0];
      assert.ok(toc, `${p.file}: missing contents`);
      assert.doesNotMatch(toc, /<a href="#[^"]+">\d+\./, 'ordered contents already supplies numbering');
      for (const [, id] of p.body.matchAll(/<h2 id="([^"]+)"/g)) {
        assert.ok(toc.includes(`href="#${id}"`), `${p.file}: section absent from contents`);
      }
    }
    for (const [, href] of p.body.matchAll(/href="((?:\.\/|#)[^"]*)"/g)) {
      const target = new URL(href, `https://local.test/${p.file}.html`);
      if (!target.hash) continue;
      const targetHtml = documents.get(target.pathname.slice(1) || 'index.html');
      assert.ok(targetHtml, href);
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), href);
    }
  }
});

test('teaching arithmetic checks noise, time reversal, queue alignment and advantage', () => {
  const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
  const d = teachingExamples.diffusion;
  near(Math.sqrt(d.alphaBar) * d.clean + Math.sqrt(1 - d.alphaBar) * d.noise, d.noisy);
  near((d.noisy - Math.sqrt(1 - d.alphaBar) * d.noise) / Math.sqrt(d.alphaBar), d.recovered);
  const f = teachingExamples.flow;
  near((1 - f.paperTime) * f.noise + f.paperTime * f.clean, f.noisy);
  near(f.codeTime * f.noise + (1 - f.codeTime) * f.clean, f.noisy);
  near(f.paperTime + f.codeTime, 1);
  near(f.clean - f.noise, f.paperVelocity);
  near(f.noise - f.clean, f.codeVelocity);
  near(f.noisy + f.step * f.paperVelocity, f.updated);
  near(f.noisy - f.step * f.codeVelocity, f.updated);
  const q = teachingExamples.queue;
  assert.equal(Math.ceil(q.hz * q.latencySeconds), q.elapsedActions);
  assert.equal(q.chunk - q.elapsedActions, q.remainingActions);
  assert.equal(q.queuedAtRequest - q.elapsedActions, q.marginActions);
  const a = teachingExamples.advantage;
  near(a.rewardPerStep * a.steps + a.nextValue - a.currentValue, a.advantage);
  assert.ok(a.advantage > a.threshold);
  const p = teachingExamples.progress;
  near(100 * p.completed / p.milestones, p.progressPercent);
  assert.equal(Number(p.completed === p.milestones), p.taskSuccess);
  const examples = new Map(chapters.flatMap(p => [...p.body.matchAll(/data-example="([^"]+)">([\s\S]*?)<\/div>/g)].map(m => [m[1], m[2]])));
  assert.equal(examples.size, 5);
  for (const [kind, value] of [['diffusion', '0.40'], ['flow', '0.50'], ['queue', '38'], ['advantage', '=2'], ['progress', '75']]) {
    assert.ok(examples.get(kind)?.includes(value), `${kind}: displayed example drifted`);
  }
});

test('implementation references use fixed commits and preserve paired flow conventions', () => {
  const combined = chapters.map(p => p.body).join('\n');
  assert.match(combined, /openpi\/blob\/215abfb217dbac7d5f1273282331b9b1866c0479\//);
  assert.match(combined, /lerobot\/blob\/9f45b7b37cc4b33f8ecdb503aa4d209370bd528d\//);
  assert.match(combined, /NOISE_AT_ONE/);
  assert.match(combined, /从1向0积分/);
  assert.match(pages.find(p => p.file === 'pi07').body, /保留控制模式而不对其做dropout/);
});

for (const p of pages) test(`${p.file}: build, mathematics, local links and media are complete`, () => {
  const html = read(`docs/${p.file}.html`).toString();
  assert.ok(html.includes(p.body), 'generated content is stale');
  assert.equal((p.body.match(/<figure\b/g) || []).length, (p.body.match(/<figcaption>/g) || []).length);
  assert.equal((p.body.match(/<figure\b/g) || []).length, (p.body.match(/<\/figure>/g) || []).length);
  assert.ok(!p.body.replace(/\$[^$\n]+\$/g, '').includes('$'), 'unbalanced math delimiters');
  for (const [, path] of html.matchAll(/(?:src|href|poster)="\.\/([^"#]*)"/g)) {
    assert.ok(existsSync(join(root, 'docs', path || 'index.html')), `missing local link ${path}`);
  }
  for (const [, file] of p.body.matchAll(/(?:src)="\.\/assets\/([^"/]+)"/g)) {
    assert.ok(media[file], `unregistered image/video ${file}`);
  }
});
