import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { pages } from '../content.mjs';
import { media } from '../media.mjs';
import { deepDives, teachingExamples } from '../research-notes.mjs';
import { advancedSections } from '../research-advanced.mjs';
import { scoreAmplification, ddimDeterministic, wilsonInterval, orthonormalDct, zeroFailureUpper, positiveFraction, cacheBudget } from '../notes/quantitative.mjs';

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

test('six chapters preserve their first five deep dives and now have twenty sections', () => {
  assert.equal(Object.keys(deepDives).length, 6);
  for (const p of chapters) {
    const sections = deepDives[p.file];
    assert.equal(sections.length, 5, p.file);
    assert.equal((p.body.match(/<h2\b/g) || []).length, 20, p.file);
    assert.ok(sections.every(section => section.body.length > 300), p.file);
    assert.match(p.body, /教学算例/);
    assert.match(p.body, /研究建议/);
    assert.match(p.body, /不是论文新结果或作者默认配置/);
    for (const section of sections) {
      assert.ok(p.body.includes(`<h2 id="${section.id}">${section.title}</h2>`));
    }
  }
});

test('sixty advanced sections are substantive, ordered, illustrated and research-labelled', () => {
  assert.equal(Object.keys(advancedSections).length, 6);
  assert.equal(Object.values(advancedSections).flat().length, 60);
  for (const p of chapters) {
    const sections = advancedSections[p.file];
    assert.equal(sections.length, 10, p.file);
    assert.equal(new Set(sections.map(section => section.id)).size, 10, p.file);
    for (const [index, section] of sections.entries()) {
      assert.ok(section.title.startsWith(`${index + 11}. `), section.title);
      assert.ok((section.body.match(/[\u4e00-\u9fff]/g) || []).length >= 300, section.id);
      assert.ok(p.body.includes(`<h2 id="${section.id}">${section.title}</h2>`), section.id);
      assert.doesNotMatch(section.body, /<style\b|\bstyle=|<script\b|<svg\b/i, section.id);
    }
    assert.ok(sections.some(section => section.body.includes('<figure>')), p.file + ': original diagram missing');
    const brief = sections[9].body;
    for (const label of [/研究假设/, /对照|组别|基线|因素设计/, /指标/, /预算|成本|计算/, /交付|保存/]) assert.match(brief, label, p.file);
    const withoutToc = p.body.replace(/<nav class="toc"[\s\S]*?<\/nav>/g, '');
    assert.ok((withoutToc.match(/[\u4e00-\u9fff]/g) || []).length >= 6500, p.file);
    assert.match(p.body, /没有在本站执行新的模型训练或真机实验/);
  }
});

test('score amplification and deterministic DDIM obey their stated equations', () => {
  const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-10, `${x} != ${y}`);
  near(scoreAmplification(0.64), 0.75);
  assert.ok(scoreAmplification(0.01) > scoreAmplification(0.81));
  for (const invalid of [0, 1, -1, NaN, '0.64']) assert.throws(() => scoreAmplification(invalid), RangeError);
  const result = ddimDeterministic(0.4, 1.2, 0.64, 0.81);
  near(result.clean, -0.4);
  near(result.next, -0.36 + Math.sqrt(0.19) * 1.2);
  near(ddimDeterministic(0.4, 1.2, 0.64, 0.64).next, 0.4);
  near(ddimDeterministic(0.4, 1.2, 0.64, 1).next, -0.4);
  assert.throws(() => ddimDeterministic(0.4, 1.2, 0.81, 0.64), RangeError);
  assert.throws(() => ddimDeterministic(NaN, 1.2, 0.64, 0.81), RangeError);
});

test('orthonormal DCT preserves energy and the teaching quantization bound', () => {
  const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-10, `${x} != ${y}`);
  const constant = orthonormalDct([0.2, 0.2, 0.2, 0.2]);
  near(constant[0], 0.4);
  for (const value of constant.slice(1)) near(value, 0);
  const values = [0.13, 0.27, -0.11, 0.34];
  const coefficients = orthonormalDct(values);
  near(values.reduce((sum, x) => sum + x * x, 0), coefficients.reduce((sum, x) => sum + x * x, 0));
  const delta = 0.05;
  const quantized = coefficients.map(x => Math.round(x / delta) * delta);
  const recovered = values.map((_, j) => quantized.reduce((sum, c, k) => sum + c * Math.sqrt((k === 0 ? 1 : 2) / values.length) * Math.cos(Math.PI * (j + 0.5) * k / values.length), 0));
  const mse = recovered.reduce((sum, x, j) => sum + (x - values[j]) ** 2, 0) / values.length;
  assert.ok(mse <= delta * delta / 4 + 1e-12);
  near(orthonormalDct([0.7])[0], 0.7);
  assert.throws(() => orthonormalDct([]), RangeError);
});

test('confidence examples handle small samples without claiming model results', () => {
  const bounds = wilsonInterval(16, 20);
  assert.ok(Math.abs(bounds.lower - 0.584) < 0.001);
  assert.ok(Math.abs(bounds.upper - 0.919) < 0.001);
  const mirror = wilsonInterval(4, 20);
  assert.ok(Math.abs(bounds.lower + mirror.upper - 1) < 1e-10);
  assert.equal(wilsonInterval(0, 20).lower, 0);
  assert.equal(wilsonInterval(20, 20).upper, 1);
  assert.ok(Math.abs(zeroFailureUpper(100) - 0.0295130496) < 1e-9);
  assert.ok(zeroFailureUpper(1000) < zeroFailureUpper(100));
  assert.throws(() => wilsonInterval(21, 20), RangeError);
  assert.throws(() => wilsonInterval(16, 20, Infinity), RangeError);
  assert.throws(() => zeroFailureUpper(0), RangeError);
  assert.match(advancedSections['diffusion-policy'][7].body, /教学算例/);
  assert.match(advancedSections.pistar06[7].body, /不是RECAP的实际实验次数或结果/);
});

test('thresholds, cache budgets and displayed arithmetic remain consistent', () => {
  assert.equal(positiveFraction([-0.2, 0, 0.1, 0.5, 0.8], 0.1), 0.4);
  assert.equal(positiveFraction([-0.2, 0, 0.1, 0.5, 0.8], 0), 0.6);
  assert.equal(positiveFraction([0, 0], 0), 0);
  assert.throws(() => positiveFraction([], 0), RangeError);
  assert.deepEqual(cacheBudget(60, 5, 10, 10), {cached: 120, repeated: 660});
  assert.deepEqual(cacheBudget(60, 5, 1, 10), {cached: 75, repeated: 75});
  assert.throws(() => cacheBudget(60, 5, 0, 10), RangeError);
  const exampleBodies = new Map(Object.values(advancedSections).flatMap(sections => sections.flatMap(section => [...section.body.matchAll(/data-advanced-example="([^"]+)">([\s\S]*?)<\/div>/g)].map(m => [m[1], m[2]]))));
  for (const [key, value] of [['ddim', '0.1631'], ['wilson', '58.4'], ['dct', '0.40'], ['delta-anchor', '[11,13,16]'], ['cache-budget', '660'], ['attention-count', '31684'], ['threshold', '40'], ['zero-failure', '2.95'], ['system-latency', '2120']]) {
    assert.ok(exampleBodies.get(key)?.includes(value), key + ': displayed value drifted');
  }
  assert.equal(50 * 128 + 50 ** 2, 8900);
  assert.equal((128 + 50) ** 2, 31684);
  assert.equal(50 * 51 / 2, 1275);
  assert.ok(Math.abs(0.95 ** 10 - 0.5987369392) < 1e-9);
  assert.ok(Math.abs(0.02 - (-0.02) - 0.04) < 1e-10);
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
