import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { pages } from '../content.mjs';
import { media } from '../media.mjs';

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
