// VLA 模型图解站构建脚本：content.mjs → docs/*.html
// 零依赖，Node >= 18。输出到 docs/（GitHub Pages classic /docs 路径）。
import { mkdirSync, writeFileSync, rmSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from './content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = here;
const docsDir = join(root, 'docs');
rmSync(docsDir, { recursive: true, force: true });
mkdirSync(join(docsDir, 'assets'), { recursive: true });

// 复制 assets（仅文件）
for (const f of readdirSync(join(root, 'assets'))) {
  const p = join(root, 'assets', f);
  if (statSync(p).isFile()) writeFileSync(join(docsDir, 'assets', f), readFileSync(p));
}

const CSS = `
:root{--bg:#faf9f5;--bg-soft:#f0eee6;--card:#ffffff;--fg:#1f1e1d;--mut:#6e6b64;--faint:#87847e;--line:#e5e1d8;--line-strong:#d9d3c5;--acc:#c96442;--acc-strong:#b04f31;--ok:#71855c;--warn:#a1732c;--bad:#b15b4c}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.85 Georgia,"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif}
::selection{background:#f2d8cc}
main{max-width:860px;margin:0 auto;padding:34px 20px 90px}
h1,h2,h3,.top .brand{font-family:Georgia,"Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif;font-weight:600}
h1{font-size:31px;line-height:1.3;margin:.3em 0 .2em}
.kicker{font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--acc);margin:1.2em 0 .2em}
h2{font-size:22px;margin:2.6em 0 .7em;padding-bottom:.3em;border-bottom:1px solid var(--line)}
h3{font-size:18.5px;margin:1.9em 0 .5em}
p{margin:.8em 0}
a{color:var(--acc);text-decoration:none}a:hover{text-decoration:underline;color:var(--acc-strong)}
code{background:var(--bg-soft);border:1px solid var(--line);border-radius:5px;padding:.05em .4em;font-size:.88em;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
hr{border:none;border-top:1px solid var(--line);margin:2.4em 0}
ul,ol{padding-left:1.5em}li{margin:.35em 0}
blockquote{margin:1.2em 0;padding:2px 18px;border-left:3px solid var(--acc);background:var(--bg-soft);border-radius:0 10px 10px 0;color:#4a463c}
.note{background:var(--bg-soft);border-left:3px solid var(--acc);border-radius:0 10px 10px 0;padding:12px 18px;margin:16px 0;font-size:15.5px;color:#4a463c;line-height:1.75}
.top{border-bottom:1px solid var(--line);background:var(--bg-soft)}
.top nav{max-width:860px;margin:0 auto;padding:15px 20px;display:flex;gap:20px;align-items:baseline;flex-wrap:wrap}
.top .brand{font-weight:700;font-size:16.5px;color:var(--fg)}
.top .brand::before{content:'✳ ';color:var(--acc)}
.top a{font-size:14.5px;font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;color:var(--mut)}
.top a:hover{color:var(--acc)}
footer{border-top:1px solid var(--line);margin-top:70px;background:var(--bg-soft)}
footer div{max-width:860px;margin:0 auto;padding:20px;color:var(--faint);font-size:13.5px;line-height:1.7}
/* 图与视频 */
figure{margin:1.6em 0;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 14px 10px;box-shadow:0 1px 2px rgba(60,50,30,.04);text-align:center}
figure img,figure video{max-width:100%;border-radius:8px;display:block;margin:0 auto}
figure img{background:#fff}
figcaption{font-size:13.5px;color:var(--faint);line-height:1.65;padding:10px 6px 2px;text-align:left;font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}
figcaption b{color:var(--mut)}
video{width:100%;background:#111}
figure.duo{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start}
figure.duo figcaption{grid-column:1/-1}
@media(max-width:640px){figure.duo{grid-template-columns:1fr}}
/* 自制动画框 */
.anim{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 14px 8px;margin:1.6em 0;text-align:center}
.anim svg{max-width:100%;height:auto}
/* 卡片与表 */
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:1.6em 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:0 1px 2px rgba(60,50,30,.04)}
.card h3{margin:.1em 0 .35em;font-size:17px}
.card a{color:var(--fg)} .card a:hover{color:var(--acc)}
.card .meta{color:var(--faint);font-size:13.5px;font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}
table{border-collapse:collapse;width:100%;margin:1.4em 0;font-size:15px;background:var(--card);border-radius:12px;overflow:hidden}
th,td{border:1px solid var(--line);padding:9px 12px;text-align:left;vertical-align:top;line-height:1.6}
th{background:var(--bg-soft);font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;font-size:13.5px;color:var(--mut)}
/* 时间线 */
.timeline{list-style:none;padding:0;margin:1.8em 0;border-left:2px solid var(--line-strong)}
.timeline li{margin:0 0 1.4em;padding:0 0 0 22px;position:relative}
.timeline li::before{content:'';position:absolute;left:-7px;top:.55em;width:12px;height:12px;border-radius:50%;background:var(--acc);border:2.5px solid var(--bg)}
.timeline .yr{font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;font-weight:700;color:var(--acc);font-size:14px}
/* 卷间导航 */
.model-nav{display:flex;flex-wrap:wrap;gap:14px;margin:26px 0;font-size:14.5px;justify-content:space-between}
.badge{display:inline-block;font-family:-apple-system,"Segoe UI","Microsoft YaHei",sans-serif;font-size:11.5px;font-weight:700;border-radius:6px;padding:1px 8px;color:#fff;vertical-align:2px}
.b-new{background:var(--acc)} .b-oss{background:var(--ok)} .b-rl{background:var(--bad)}
.toc{background:var(--bg-soft);border-radius:12px;padding:14px 20px;margin:1.6em 0;font-size:15px}
.toc ol{margin:.3em 0}
p,li,figcaption{overflow-wrap:anywhere}
@media(max-width:640px){main{padding:22px 14px 60px}h1{font-size:25px}}
`;

function page(p, body) {
  const nav = p.nav || [];
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${p.title}</title>
<script>window.MathJax={tex:{inlineMath:[['$','$']],displayMath:[['$$','$$']]},chtml:{displayAlign:'left'}};</script>
<script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
<style>${CSS}</style>
</head>
<body>
<div class="top"><nav><span class="brand">VLA 模型图解</span><a href="./">总览</a>${nav.map(n => `<a href="./${n[1]}">${n[0]}</a>`).join('')}<a href="https://github.com/JaleWang-BUPT/vla-models-explained" target="_blank" rel="noopener">GitHub</a></nav></div>
<main>
${body}
</main>
<footer><div>本站是研究笔记，非官方资料；方法描述以各论文/官方博客为准，图片与视频版权归原作者（见各图注与 <a href="./credits.html">Credits</a>）。文本与自制动画以 MIT 协议提供 · <a href="https://github.com/JaleWang-BUPT/vla-models-explained" target="_blank" rel="noopener">GitHub 仓库</a></div></footer>
</body>
</html>`;
}

const allNav = pages.map(p => [p.short, p.file + '.html']);
for (const p of pages) {
  const others = allNav.filter(n => n[1] !== p.file + '.html');
  const body = p.body + `\n<nav class="model-nav"><span>${p.prev ? `<a href="./${p.prev}.html">← ${pages.find(x => x.file === p.prev).short}</a>` : ''}</span><span>${p.next ? `<a href="./${p.next}.html">${pages.find(x => x.file === p.next).short} →</a>` : ''}</span></nav>`;
  writeFileSync(join(docsDir, p.file + '.html'), page({ ...p, nav: others.slice(0, 6) }, body));
  console.log('built', p.file + '.html');
}
console.log('done →', docsDir);
