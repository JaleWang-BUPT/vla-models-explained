// 站点内容：每个条目是一个页面 { file, title, short, kicker, body, prev, next }
// 正文为原创中文研究笔记；引用图片/视频的版权归原作者，图注逐条标注。

const FIG = (src, cap, cls = '') =>
  `<figure${cls ? ` class="${cls}"` : ''}><img src="./assets/${src}" loading="lazy" alt=""><figcaption>${cap}</figcaption></figure>`;

const VID = (src, cap) =>
  `<figure><video src="./assets/${src}" controls playsinline preload="metadata"></video><figcaption>${cap}</figcaption></figure>`;

/* ---------- 自制 SVG 动画（SMIL，无 JS 依赖） ---------- */

// A1 Diffusion Policy：从噪声去噪出多模态动作分布
const animDiffusion = `
<div class="anim">
<svg viewBox="0 0 640 260" role="img" aria-label="扩散策略去噪动画">
  <defs>
    <path id="dp1" d="M60,210 C200,180 320,220 580,150" fill="none"/>
    <path id="dp2" d="M60,210 C220,90 360,150 580,70"  fill="none"/>
    <path id="dp3" d="M60,210 C240,150 400,60  580,190" fill="none"/>
  </defs>
  <text x="60" y="34" font-size="15" fill="#6e6b64">噪声样本 x_T</text>
  <text x="470" y="34" font-size="15" fill="#6e6b64">动作轨迹（多模态）</text>
  <g opacity="1">
    <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.15;0.4;0.9;1" dur="6s" repeatCount="indefinite"/>
    ${Array.from({ length: 26 }, (_, i) => {
      const x = 60 + (i * 19) % 180, y = 90 + (i * 37) % 130;
      return `<circle cx="${x}" cy="${y}" r="2.4" fill="#87847e"><animate attributeName="opacity" values="0.9;0.9;0;0;0.9" keyTimes="0;0.15;0.4;0.9;1" dur="6s" repeatCount="indefinite"/></circle>`;
    }).join('')}
  </g>
  <path d="M60,210 C200,180 320,220 580,150" stroke="#c96442" stroke-width="2.4" fill="none" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.35;0.62;0.95;1" dur="6s" repeatCount="indefinite"/></path>
  <path d="M60,210 C220,90 360,150 580,70"  stroke="#71855c" stroke-width="2.4" fill="none" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.38;0.66;0.95;1" dur="6s" repeatCount="indefinite"/></path>
  <path d="M60,210 C240,150 400,60 580,190" stroke="#a1732c" stroke-width="2.4" fill="none" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.41;0.7;0.95;1" dur="6s" repeatCount="indefinite"/></path>
  <circle r="4.5" fill="#c96442"><animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.95;1" path="M60,210 C200,180 320,220 580,150"/><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.35;0.55;0.95;1" dur="6s" repeatCount="indefinite"/></circle>
  <text x="60" y="246" font-size="12.5" fill="#87847e">同一个起点观测 → 去噪收敛到不同的可行轨迹：回归头会取均值，扩散模型落到其中一条上</text>
</svg></div>`;

// A2 π0：flow matching 直线流
const animFlow = `
<div class="anim">
<svg viewBox="0 0 640 230" role="img" aria-label="flow matching 动画">
  <defs>
    <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#c96442"/></marker>
  </defs>
  <text x="40" y="34" font-size="15" fill="#6e6b64">噪声 z₁ ∼ N(0, I)</text>
  <text x="470" y="34" font-size="15" fill="#6e6b64">动作块（50 Hz，未来 t 步）</text>
  ${[ [90,180,520,90], [90,140,520,150], [90,100,520,60] ].map(([x1,y1,x2,y2],i) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e5e1d8" stroke-width="2"/>`).join('')}
  ${[ [90,180,520,90], [90,140,520,150], [90,100,520,60] ].map(([x1,y1,x2,y2],i) =>
    `<circle r="4.6" fill="${['#c96442','#71855c','#a1732c'][i]}"><animateMotion dur="2.6s" begin="${i*0.5}s" repeatCount="indefinite" path="M${x1},${y1} L${x2},${y2}"/></circle>`).join('')}
  <g fill="#87847e">${[ [90,180],[90,140],[90,100] ].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>
  <g>${[ [520,90],[520,150],[520,60] ].map(([x,y],i) => `<rect x="${x}" y="${y-9}" width="46" height="18" rx="4" fill="${['#c96442','#71855c','#a1732c'][i]}" opacity="0.25"/><rect x="${x}" y="${y-9}" width="46" height="18" rx="4" fill="none" stroke="${['#c96442','#71855c','#a1732c'][i]}" stroke-width="1.6"/>`).join('')}</g>
  <text x="60" y="218" font-size="12.5" fill="#87847e">训练：回归直线速度场 v ≈ a − z₁　推理：从噪声出发沿直线 Euler 积分数步</text>
</svg></div>`;

// A3 SmolVLA：异步推理（推理与执行重叠）
const animAsync = `
<div class="anim">
<svg viewBox="0 0 640 220" role="img" aria-label="异步推理解释动画">
  <text x="30" y="60" font-size="14.5" fill="#6e6b64">GPU 推理（下一块）</text>
  <rect x="30" y="72" width="580" height="26" rx="8" fill="#f0eee6"/>
  <rect x="30" y="72" width="150" height="26" rx="8" fill="#c96442" opacity="0.85">
    <animate attributeName="x" values="30;460;30" dur="5s" repeatCount="indefinite"/>
  </rect>
  <text x="30" y="140" font-size="14.5" fill="#6e6b64">机器人执行（动作块队列）</text>
  ${[0,1,2,3,4].map(i => `<rect x="${30 + i * 118}" y="152" width="104" height="26" rx="8" fill="#71855c" opacity="${0.28 + i * 0.16}">
    <animate attributeName="opacity" values="${[0.9,0.7,0.5,0.3,0.15][i]};0.15;${[0.9,0.7,0.5,0.3,0.15][i]}" keyTimes="0;0.5;1" dur="5s" repeatCount="indefinite"/>
  </rect>`).join('')}
  <line x1="70" y1="60" x2="70" y2="190" stroke="#b15b4c" stroke-width="2" stroke-dasharray="5 5">
    <animate attributeName="x1" values="70;590;70" dur="5s" repeatCount="indefinite"/><animate attributeName="x2" values="70;590;70" dur="5s" repeatCount="indefinite"/>
  </line>
  <text x="430" y="206" font-size="12.5" fill="#87847e">红虚线 = 当前时刻：执行第 k 块的同时，GPU 已在算第 k+1 块</text>
</svg></div>`;

// A4 π0.5 异构共训
const animCotrain = `
<div class="anim">
<svg viewBox="0 0 640 240" role="img" aria-label="异构共训动画">
  <defs><path id="f1" d="M170,60 C300,60 330,95 430,110"/><path id="f2" d="M170,105 C300,105 340,112 430,118"/><path id="f3" d="M170,150 C300,150 340,128 430,126"/><path id="f4" d="M170,195 C300,195 330,140 430,134"/></defs>
  ${[ ['多本体真机演示', 46], ['网络多模态数据', 91], ['语义标注（检测/指代）', 136], ['高层子任务标注', 181] ].map(([label, y], i) => `
    <rect x="20" y="${y}" width="150" height="34" rx="9" fill="#f0eee6" stroke="#d9d3c5"/>
    <text x="95" y="${y + 22}" text-anchor="middle" font-size="13" fill="#1f1e1d">${label}</text>
    <use href="#f${i + 1}" stroke="#c96442" stroke-width="2" fill="none" stroke-dasharray="7 8">
      <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.6s" repeatCount="indefinite"/>
    </use>`).join('')}
  <rect x="430" y="86" width="170" height="76" rx="14" fill="#ffffff" stroke="#c96442" stroke-width="2"/>
  <text x="515" y="118" text-anchor="middle" font-size="15" fill="#1f1e1d">VLA 共训</text>
  <text x="515" y="142" text-anchor="middle" font-size="12" fill="#6e6b64">动作 + 文本 + 检测 + 指代</text>
  <text x="60" y="232" font-size="12.5" fill="#87847e">混合训练让一个模型既会“做”，也懂任务的语义结构与高层步骤</text>
</svg></div>`;

// A5 π*0.6 RECAP 循环
const animRecap = `
<div class="anim">
<svg viewBox="0 0 640 250" role="img" aria-label="RECAP 循环动画">
  <defs>
    <path id="rc1" d="M250,70 C350,45 460,55 545,95" fill="none"/>
    <path id="rc2" d="M555,125 C520,190 420,215 330,200" fill="none"/>
    <path id="rc3" d="M300,185 C210,175 140,130 135,85" fill="none"/>
  </defs>
  ${[['演示数据', 90, 210], ['纠正（教练）', 95, 470], ['自主经验', 190, 300]].map(([t, y, x], i) => `
    <circle cx="${x}" cy="${y}" r="44" fill="#ffffff" stroke="${['#71855c', '#a1732c', '#c96442'][i]}" stroke-width="2.4"/>
    <text x="${x}" y="${y - 2}" text-anchor="middle" font-size="13.5" fill="#1f1e1d">${t.split('（')[0]}</text>
    <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="11" fill="#6e6b64">${t.includes('（') ? t.split('（')[1].replace('）', '') : ''}</text>`).join('')}
  <use href="#rc1" stroke="#71855c" stroke-width="2.2" fill="none" stroke-dasharray="8 7"><animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.5s" repeatCount="indefinite"/></use>
  <use href="#rc2" stroke="#a1732c" stroke-width="2.2" fill="none" stroke-dasharray="8 7"><animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.5s" repeatCount="indefinite"/></use>
  <use href="#rc3" stroke="#c96442" stroke-width="2.2" fill="none" stroke-dasharray="8 7"><animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.5s" repeatCount="indefinite"/></use>
  <circle r="5" fill="#1f1e1d"><animateMotion dur="4.5s" repeatCount="indefinite" path="M250,70 C350,45 460,55 545,95 C520,190 420,215 330,200 C210,175 140,130 135,85 C160,55 210,58 250,70"/></circle>
  <text x="320" y="242" text-anchor="middle" font-size="12.5" fill="#87847e">价值函数估计回报，优势（advantage）作为条件反哺策略：好动作被强化，差动作被规避</text>
</svg></div>`;

// A6 π0.7 条件化转向
const animSteer = `
<div class="anim">
<svg viewBox="0 0 640 250" role="img" aria-label="条件化转向动画">
  <rect x="20" y="30" width="180" height="30" rx="9" fill="#f0eee6" stroke="#d9d3c5"/><text x="110" y="50" text-anchor="middle" font-size="13" fill="#1f1e1d">语言指令（做什么）</text>
  <rect x="230" y="30" width="180" height="30" rx="9" fill="#f0eee6" stroke="#c96442"/><text x="320" y="50" text-anchor="middle" font-size="13" fill="#1f1e1d">子目标图像（做成什么样）</text>
  <rect x="440" y="30" width="180" height="30" rx="9" fill="#f0eee6" stroke="#a1732c"/><text x="530" y="50" text-anchor="middle" font-size="13" fill="#1f1e1d">元数据（多快/多好）</text>
  ${[ [110, '#c96442', 'M150,120 C260,140 380,120 560,95'], [320, '#71855c', 'M150,125 C260,110 400,160 560,140'], [530, '#a1732c', 'M150,130 C280,180 420,175 560,185'] ].map(([x, c, d], i) => `
    <path d="${d}" stroke="${c}" stroke-width="2.6" fill="none" stroke-dasharray="480" stroke-dashoffset="480">
      <animate attributeName="stroke-dashoffset" from="480" to="0" begin="${i * 0.7}s" dur="1.8s" repeatCount="indefinite"/>
    </path>`).join('')}
  <rect x="20" y="105" width="110" height="40" rx="10" fill="#ffffff" stroke="#d9d3c5"/><text x="75" y="130" text-anchor="middle" font-size="12.5" fill="#6e6b64">同一观测</text>
  <text x="596" y="96" font-size="11.5" fill="#c96442">策略 A</text>
  <text x="596" y="145" font-size="11.5" fill="#71855c">策略 B</text>
  <text x="596" y="190" font-size="11.5" fill="#a1732c">策略 C</text>
  <text x="60" y="240" font-size="12.5" fill="#87847e">提示里多给“怎么做”的信息，同一个模型就能被精确转向：异构数据不再互相打架</text>
</svg></div>`;

/* ---------- 页面 ---------- */

export const pages = [
{
  file: 'index', short: '总览', title: 'VLA 模型图解 · 从 Diffusion Policy 到 π0.7',
  body: `
<p class="kicker">VLA METHODS, VISUALLY</p>
<h1>从 Diffusion Policy 到 π0.7：VLA 方法图解</h1>
<p>一份面向研究者的中文图解笔记：沿着“动作怎么生成、数据怎么用、泛化从哪来”三条线，拆解六个代表性模型——<b>Diffusion Policy（2023）→ SmolVLA（2025）→ π0（2024）→ π0.5（2025）→ π*0.6（2025）→ π0.7（2026）</b>。所有论文图与官方动画均已标注出处；条目中的机制动画（✳ 标记）是本站自制的 SVG，可放心引用。</p>
<div class="note">阅读方式：每页固定结构——问题 → 方法 → 关键设计 → 结果 → 研究者视角的注记（为什么这样设计、还留了什么坑）。想对比先看<a href="#compare">时间线与谱系表</a>。</div>
<h2 id="timeline">时间线</h2>
<ul class="timeline">
  <li><span class="yr">2023 · RSS　</span><b>Diffusion Policy</b>：把“动作生成”变成图像式去噪——动作分布的多模态表达第一次在真机上大规模立住。</li>
  <li><span class="yr">2024 · π0　</span><b>Physical Intelligence</b>：VLM 主干 + flow matching 动作专家，把互联网语义先验接到 50 Hz 灵巧操作。</li>
  <li><span class="yr">2025 · π0.5　</span>：异构数据共训（网络多模态 + 多本体），高层子任务生成，泛化到没见过的家庭环境。</li>
  <li><span class="yr">2025 · SmolVLA　</span><b>Hugging Face</b>：450M 的“小而全”，消费级 GPU 可训、MacBook 可跑，异步推理把延迟藏进执行里。</li>
  <li><span class="yr">2025 · π*0.6　</span>：RECAP 后训练（演示 + 纠正 + 自主经验），RL 让 VLA 从“偶尔成功”到“全天可靠”。</li>
  <li><span class="yr">2026 · π0.7　</span>：多样化上下文条件——提示里给“怎么做”（子目标图、元数据、策略），一个通用模型开箱即专家。</li>
</ul>
<h2 id="compare">谱系对比表</h2>
<table>
<tr><th>模型</th><th>年份</th><th>参数量</th><th>动作头</th><th>训练范式</th><th>开源</th></tr>
<tr><td><a href="./diffusion-policy.html">Diffusion Policy</a></td><td>2023</td><td>CNN/Transformer 版数亿级</td><td>DDPM 去噪</td><td>模仿学习（行为克隆）</td><td><span class="badge b-oss">开源</span></td></tr>
<tr><td><a href="./pi0.html">π0</a></td><td>2024</td><td>3.3B（PaliGemma 3B + 专家 300M）</td><td>Flow Matching</td><td>大规模异构预训练 + 微调</td><td><span class="badge b-oss">openpi</span></td></tr>
<tr><td><a href="./pi05.html">π0.5</a></td><td>2025</td><td>与 π0 同量级</td><td>Flow Matching</td><td>异构共训（含网络多模态数据）</td><td><span class="badge b-oss">openpi</span></td></tr>
<tr><td><a href="./smolvla.html">SmolVLA</a></td><td>2025</td><td>450M</td><td>Flow Matching（层跳过/异步推理）</td><td>社区数据（LeRobot 生态）</td><td><span class="badge b-oss">开源</span></td></tr>
<tr><td><a href="./pistar06.html">π*0.6</a></td><td>2025</td><td>π0.6 基座</td><td>Flow Matching + 优势条件</td><td>RECAP：演示 + 纠正 + 自主经验</td><td>未开源</td></tr>
<tr><td><a href="./pi07.html">π0.7</a></td><td>2026</td><td>π0.6 量级</td><td>Flow Matching + 多模态提示条件</td><td>多样化上下文条件训练</td><td>未开源</td></tr>
</table>
<h2>三条研究主线</h2>
<ol>
<li><b>动作表示</b>：离散 token（RT-2/OpenVLA 一系）→ 回归 → CVAE（ACT）→ 扩散（Diffusion Policy）→ flow matching（π0 及之后）。生成式的连续分布表达，是高频灵巧操作的地基。</li>
<li><b>数据复用</b>：单任务演示 → 异构共训（π0.5）→ 社区数据（SmolVLA）→ 自主经验回收（π*0.6）→ 低质量数据经元数据“消毒”后可用（π0.7）。</li>
<li><b>泛化来源</b>：从“见多识广”（数据规模）走向“条件化”（π0.7 在提示里显式给策略），泛化开始像 LLM 一样可组合。</li>
</ol>
`
},
{
  file: 'diffusion-policy', short: 'Diffusion Policy', kicker: '2023 · RSS · Columbia & TRI',
  title: 'Diffusion Policy：把动作生成变成去噪', prev: 'index', next: 'pi0',
  body: `
<p class="kicker">2023 · RSS · CHI ET AL.</p>
<h1>Diffusion Policy</h1>
<p>问题起点是模仿学习里一个经典尴尬：<b>同一个观测往往有多条正确动作轨迹</b>（绕左边抓和绕右边抓都对），而行为克隆默认用 MSE 回归——模型学出的是这些轨迹的“均值”，均值可能落在两条可行轨迹之间，物理上不可执行。Diffusion Policy 的答案是：把动作生成当成图像生成那样做扩散去噪，让模型<b>表达完整的多模态动作分布</b>，而不是一个点估计。</p>
${FIG('dp_teaser.png', '<b>图 · Diffusion Policy 真机任务总览</b>（图片来源：Chi et al., <i>Diffusion Policy</i>, arXiv:2303.04137，版权归原作者）')}
<h2>方法</h2>
<p>把策略记为 $\pi(a|o)$：训练时对真值动作逐步加噪（前向过程），学习一个噪声预测网络 $\epsilon_\theta$ 反向去噪；推理时从纯噪声出发，迭代 T 步得到动作。论文给了两种网络形态：<b>CNN 版</b>（时序卷积 + FiLM 条件化，固定视界）与 <b>Transformer 版</b>（因果注意力 + <b>滚动视界控制</b> receding horizon：预测未来 Tp=16 步、只执行前 To=8 步，然后重新观测再预测——闭环性由此而来）。</p>
${animDiffusion}
${FIG('dp_policy_input_output.png', '<b>图 · 策略输入输出与两种网络形态</b>（图片来源：Chi et al., arXiv:2303.04137，版权归原作者）')}
<h2>关键设计</h2>
<ul>
<li><b>动作块（action chunk）</b>：一次去噪输出一整段未来动作而非单步，时间上联合建模，天然平滑、抗观测噪声。</li>
<li><b>滚动视界</b>：执行一半就重规划，兼顾 chunk 的平滑与闭环响应。</li>
<li><b>分布表达</b>：DDPM 的随机性 + 迭代去噪，可以覆盖多模态分布——这是相对回归/CVAE 的核心优势（也是本站动画里三条轨迹的由来）。</li>
</ul>
<h2>结果</h2>
<p>15 个真机任务平均成功率 <b>60.7%</b>，相较此前 SOTA（44.6%）大幅提升；在双臂、稠密物体整理等任务上验证了多模态表达的实际价值。代码开源（real-robot-suite，后进入 LeRobot 生态）。</p>
<h2>研究者注记</h2>
<blockquote>①扩散的迭代去噪带来推理延迟，后续所有工作（π0 的 flow matching、SmolVLA 的层跳过）都在回答“怎么少走几步还能保住分布表达”。②Diffusion Policy 证明了“动作分布表达”重要，但它只是模仿学习——错误会复合（π*0.6 页面专门讲这个坑）。③它把“策略=生成模型”这个视角立住了，VLA 时代所有主流动作头都是它的后裔。</blockquote>
<p><b>参考</b>：Chi et al., <i>Diffusion Policy: Visuomotor Policy Learning via Action Diffusion</i>, RSS 2023（<a href="https://arxiv.org/abs/2303.04137" target="_blank" rel="noopener">arXiv:2303.04137</a> · <a href="https://www.diffusion-policy.cs.columbia.edu/" target="_blank" rel="noopener">项目页</a>）</p>
`
},
{
  file: 'pi0', short: 'π0', kicker: '2024 · PHYSICAL INTELLIGENCE',
  title: 'π0：VLM 主干 + Flow Matching 动作专家', prev: 'diffusion-policy', next: 'pi05',
  body: `
<p class="kicker">2024 · PHYSICAL INTELLIGENCE</p>
<h1>π0</h1>
<p>π0 要回答的问题是：<b>互联网级的语义知识，能不能直接接到 50 Hz 的灵巧操作上？</b>它的架构成了后来大部分 VLA（含 SmolVLA）的模板：一个预训练 VLM 主干负责“看懂”，一个小得多的动作专家负责“动手”。</p>
${FIG('pi0_overview.png', '<b>图 · π0 架构总览</b>：预训练 VLM（PaliGemma 3B）+ 独立动作专家（约 300M，从头初始化），合计 3.3B；图像/文本 token 走 VLM 权重，机器人状态与带噪动作 token 走动作专家权重（图片来源：Physical Intelligence, <i>π0</i>, arXiv:2410.24164，版权归原作者）')}
<h2>方法</h2>
<p>动作专家用 <b>flow matching</b> 训练：把噪声与真值动作沿直线路径插值，网络回归速度场，推理时从噪声沿直线 Euler 积分数步得到动作块。相比扩散的多步随机去噪，flow matching 步数可调、路径直、确定性采样，天然适配高频控制——π0 用它做到了 <b>50 Hz</b> 的动作输出（叠衣服级别的灵巧任务）。</p>
${animFlow}
<h2>数据与结果</h2>
<p>预训练混合了自有灵巧操作数据与开源机器人数据，总量超过 <b>10,000 小时</b>；微调后覆盖叠衣服、收桌子、装盒子等高难度灵巧任务。2025 年以 <b>openpi</b> 项目开源，是社区目前最重要的 VLA 基座之一。</p>
${FIG('pi0_teaser.png', '<b>图 · π0 任务演示集锦</b>（图片来源：arXiv:2410.24164，版权归原作者）')}
<h2>研究者注记</h2>
<blockquote>①“大 VLM + 小动作专家”的配比是刻意的：语义知识在主干，动作专家只学“怎么动”，两者用分块注意力在同一个序列里交互——不是级联两个模型。②π0 仍是模仿学习范式，数据外的错误会复合；它的后续（π0.5 泛化、π*0.6 可靠性、π0.7 条件化）各自补一块短板。③动作频率 ≠ 推理频率：50 Hz 是动作点的时间参数化，模型重规划频率远低于此。</blockquote>
<p><b>参考</b>：Black et al., <i>π0: A Vision-Language-Action Flow Model for General Robot Control</i>（<a href="https://arxiv.org/abs/2410.24164" target="_blank" rel="noopener">arXiv:2410.24164</a> · <a href="https://www.physicalintelligence.company/blog/pi0" target="_blank" rel="noopener">官方博客</a> · <a href="https://github.com/Physical-Intelligence/openpi" target="_blank" rel="noopener">openpi</a>）</p>
`
},
{
  file: 'pi05', short: 'π0.5', kicker: '2025 · PHYSICAL INTELLIGENCE',
  title: 'π0.5：异构共训与开放世界泛化', prev: 'pi0', next: 'smolvla',
  body: `
<p class="kicker">2025 · PHYSICAL INTELLIGENCE</p>
<h1>π0.5</h1>
<p>π0.5 的目标不是新技能，而是<b>泛化到全新环境</b>：在训练时从没见过的家庭里整理厨房、收拾卧室。方法主轴是<b>异构数据共训（co-training）</b>——因为 VLA 源自 VLM，训练样本可以是动作、图像、文本、检测框的任意组合。</p>
${animCotrain}
<h2>共训都混了什么</h2>
<p>官方博客把提示/标注形态画成了四类，正对应本站下载的四张官方图：</p>
${FIG('pi05_verbal.jpg', '<b>图 1 · 语言指令条件</b>（图片来源：Physical Intelligence 官方博客 <i>π0.5</i>，版权归原作者）', 'duo')}
${FIG('pi05_subtask.jpg', '<b>图 2 · 高层子任务命令</b>：模型先生成“做什么阶段”的语义命令，再执行（图片来源同上）', 'duo')}
${FIG('pi05_detection.jpg', '<b>图 3 · 物体检测/指代标注</b>（图片来源同上）', 'duo')}
${FIG('pi05_web.jpg', '<b>图 4 · 网络多模态数据</b>：把互联网图文任务混进机器人训练（图片来源同上）', 'duo')}
<h2>为什么共训有效</h2>
<p>共训教会模型三件事：<b>怎么动</b>（多本体真机数据）、<b>任务的语义结构</b>（收拾厨房意味着哪些物体该去哪）、<b>高层步骤</b>（铺床分几步）。高层子任务生成分两阶段推理：先出语义子目标文本，再生成连续动作——长程任务被切成短程可执行段。</p>
<h2>结果与研究者注记</h2>
<blockquote>①评测在完全没见过的家庭里做（airbnb 等），任务从“把盘子放进水槽”到“用海绵擦溅洒”，失败常见但展现出类人的灵活应变——这是“泛化”第一次成为 VLA 的主指标。②共训的思路后来被 π0.7 推到极致：数据五花八门没问题，只要提示里的条件能“消毒”。③四类条件图值得反复看：它们就是提示工程在机器人里的形态。</blockquote>
<p><b>参考</b>：Physical Intelligence, <i>π0.5: a Vision-Language-Action Model with Open-World Generalization</i>（<a href="https://arxiv.org/abs/2504.16054" target="_blank" rel="noopener">arXiv:2504.16054</a> · <a href="https://www.pi.website/blog/pi05" target="_blank" rel="noopener">官方博客</a>）</p>
`
},
{
  file: 'smolvla', short: 'SmolVLA', kicker: '2025 · HUGGING FACE',
  title: 'SmolVLA：450M 的社区级 VLA', prev: 'pi05', next: 'pistar06',
  body: `
<p class="kicker">2025 · HUGGING FACE · LERObot 生态</p>
<h1>SmolVLA</h1>
<p>当 PI 把模型越做越大时，Hugging Face 反向操作：<b>450M 参数</b>的 VLA，消费级 GPU 可训、浏览器/MacBook 可跑，训练数据来自 LeRobot 社区数据集。它证明了一件事：如果架构和推理调度够聪明，VLA 不必是奢侈品。</p>
${FIG('smolvla_arch.png', '<b>图 · SmolVLA 架构</b>：SmolVLM2（SigLIP 视觉编码器 + SmolLM2 语言模型）作为 VLM 主干，动作专家以 flow matching 目标训练，生成动作块（图片来源：Shukor et al., <i>SmolVLA</i>, arXiv:2506.01844，版权归原作者）')}
<h2>效率三件套</h2>
<ol>
<li><b>视觉 token 削减</b>：砍掉图像 token 数量，让小模型的重心放在动作上。</li>
<li><b>层跳过（layer skipping）</b>：推理时跳过 VLM 的部分上层——小任务上深层语义冗余，换来明显加速。</li>
<li><b>交错注意力</b>：动作专家里 cross-attention 与 self-attention 交错，让动作 token 高效利用 VLM 特征。</li>
</ol>
${animAsync}
${FIG('smolvla_async.png', '<b>图 · 异步推理</b>：执行当前动作块的同时，最新观测已发给 Policy Server 计算下一块——官方口径：响应快 30%、任务吞吐 2×（图片来源：arXiv:2506.01844，版权归原作者）')}
<h2>结果与研究者注记</h2>
<p>在 LIBERO / Meta-World 仿真与 SO-100/SO-101 真机任务上验证，跨本体（单臂、双臂、移动底盘）训练后相互增益；配套 LeRobot 集成使其成为社区复现门槛最低的 VLA。</p>
<blockquote>①异步推理是“系统工程换性能”的典范——模型没变，把推理延迟藏进执行时间里（对比本站 π0 页的 flow matching 动画：块与块之间的空闲就是它吃掉的）。②它和 π0 共享 flow matching 动作头，说明该范式已足够成熟、可以下沉到 450M。③社区数据的噪声与相机多样性是它泛化的本钱——也是 π0.7 “元数据消毒”思路的潜在受益者。</blockquote>
<p><b>参考</b>：Shukor et al., <i>SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics</i>（<a href="https://arxiv.org/abs/2506.01844" target="_blank" rel="noopener">arXiv:2506.01844</a> · <a href="https://huggingface.co/blog/smolvla" target="_blank" rel="noopener">HF 博客</a> · <a href="https://github.com/huggingface/lerobot" target="_blank" rel="noopener">LeRobot</a>）</p>
`
},
{
  file: 'pistar06', short: 'π*0.6', kicker: '2025 · PHYSICAL INTELLIGENCE',
  title: 'π*0.6：RECAP——用 RL 把 VLA 磨到全天可靠', prev: 'smolvla', next: 'pi07',
  body: `
<p class="kicker">2025 · PHYSICAL INTELLIGENCE · RL 后训练</p>
<h1>π*0.6 与 RECAP</h1>
<p>模仿学习的阿喀琉斯之踵：<b>小错误会复合</b>。VLA 在真机上犯一个小错，环境就进入训练分布外的状态，接着犯更大的错——LLM 输出错了可以重来，机器人错了物理世界不等人。所以 VLA“偶尔成功容易，持续可靠很难”。π*0.6 用一套叫 <b>RECAP</b>（RL with Experience & Corrections via Advantage-conditioned Policies）的后训练方法解决这个问题。</p>
${animRecap}
<h2>RECAP 三步</h2>
<ol>
<li><b>演示（demonstrations）</b>：人类遥操数据打底，教会任务骨架。</li>
<li><b>纠正（corrections）</b>：在策略跑偏时由操作者“接手拉回”，这些纠正段是高价值数据——它们包含从错误状态回到正轨的配对。</li>
<li><b>自主经验（autonomous experience）</b>：让当前策略大量自主尝试；训一个<b>价值函数</b>估计各段动作的回报，把<b>优势（advantage）作为条件</b>喂回策略——好动作被相对强化，坏动作被显式规避。</li>
</ol>
${VID('pistar06_coffee.mp4', '<b>视频 · RECAP 训练后的咖啡制作</b>（视频来源：Physical Intelligence 官方博客 <i>π*0.6</i>，版权归原作者）')}
<h2>结果</h2>
<ul>
<li>最难的几个任务吞吐量 <b>提升 2 倍以上</b>，失败率至少减半；</li>
<li>咖啡制作从早晨 5:30 连续跑到晚上 11:30；新家里叠 50 件没见过的衣物数小时不中断；真实工厂里装配并贴标 59 个巧克力包装盒。</li>
</ul>
<h2>研究者注记</h2>
<blockquote>①优势作为“条件”而非只作权重——策略学会按优势水平调整行为，这是 RECAP 名字里 Advantage-conditioned 的含义。②纠正数据的使用方式值得抄：不是混进演示里，而是按“偏离状态→恢复动作”的时机对齐监督（本站面试题库卷二 C18 亦讨论此点）。③自主经验要有标签才有用——价值函数就是那个标签的来源。</blockquote>
<p><b>参考</b>：Physical Intelligence, <i>π*0.6: a VLA That Learns from Experience and Corrections</i>（<a href="https://www.pi.website/blog/pistar06" target="_blank" rel="noopener">官方博客</a>）</p>
`
},
{
  file: 'pi07', short: 'π0.7', kicker: '2026 · PHYSICAL INTELLIGENCE',
  title: 'π0.7：可转向的通用主义模型', prev: 'pistar06', next: 'index',
  body: `
<p class="kicker">2026 · PHYSICAL INTELLIGENCE · STEERABLE GENERALIST</p>
<h1>π0.7</h1>
<p>π0.7（2026 年 4 月）的关键词是 <b>diverse context conditioning</b>：过去 VLA 的提示只有“做什么”（语言指令），π0.7 把<b>“怎么做”也写进提示</b>——子目标图像、任务表现的元数据（快慢、质量高低）、策略描述，全部作为多模态条件参与训练。泛化逻辑由此改变：数据五花八门不再是噪声，而是被条件区分开的<b>不同策略</b>。</p>
${animSteer}
<h2>提示里都有什么</h2>
<p>官方博客的示例子目标图（subgoal）与当前观测（current）成对出现——子目标定义“物体该被摆成什么样”的精确空间布局：</p>
${FIG('pi07_subgoal_1.png', '<b>图 · 子目标图像（期望终态）</b>（图片来源：Physical Intelligence 官方博客 <i>π0.7</i>，版权归原作者）', 'duo')}
${FIG('pi07_current_1.png', '<b>图 · 当前观测（起始状态）</b>：模型的条件 = 语言 + 子目标 + 元数据（图片来源同上）', 'duo')}
${FIG('pi07_subgoal_3.png', '<b>图 · 另一组子目标示例</b>（图片来源同上）', 'duo')}
${FIG('pi07_current_3.png', '<b>图 · 对应当前观测</b>（图片来源同上）', 'duo')}
<h2>三个涌现能力</h2>
<ol>
<li><b>开箱即专家</b>：把 π*0.6 用 RECAP 产出的自主经验带策略元数据并入训练后，同一个 π0.7 在叠衣、咖啡、装盒上达到甚至超过专门 RL 微调的专家模型——不再需要“一个任务一个特化模型”。</li>
<li><b>技能组合</b>：像 LLM 组合概念一样组合技能——使用训练里没见过的厨房电器、完成多阶段任务。</li>
<li><b>零样本跨本体</b>：对训练中欠 represented 的双臂 UR5e 平台，零样本完成衬衫折叠（下方官方视频）。</li>
</ol>
${VID('pi07_shirt_fold.mp4', '<b>视频 · 零样本跨本体衬衫折叠（双臂 UR5e）</b>（视频来源：Physical Intelligence 官方博客 <i>π0.7</i>，版权归原作者）')}
${VID('pi07_coaching.mp4', '<b>视频 · “粗纠正”转向示例</b>：提示中的策略信息改变执行风格（视频来源同上）')}
<h2>研究者注记</h2>
<blockquote>①π0.7 的深层主张：泛化不靠“更多同质数据”，靠“条件化消化异质数据”——低质量演示标注上“低质量/低速”元数据就能入库，数据护城河被重新定义。②测试时的子目标可以由<b>轻量世界模型合成</b>——世界模型在这里不是路线之争，而是提示生成器。③对比 π*0.6：RECAP 靠 RL 建立可靠性，π0.7 靠条件化把可靠性变成通用能力的一部分；两条线在 π0.7 汇合。④开放问题：子目标图谁来给？测试时世界模型合成的保真度，就是新的能力上界。</blockquote>
<p><b>参考</b>：Physical Intelligence, <i>π0.7: a Steerable Generalist Robotic Foundation Model with Emergent Capabilities</i>（<a href="https://www.pi.website/blog/pi07" target="_blank" rel="noopener">官方博客</a>，2026-04）</p>
`
},
{
  file: 'credits', short: 'Credits', title: 'Credits 与版权说明',
  body: `
<p class="kicker">ASSETS & LICENSES</p>
<h1>Credits</h1>
<p>本站<b>文字与自制 SVG 动画</b>由本仓库独立撰写，以 MIT 协议提供。以下论文图、官方图与视频的版权归原作者所有，此处仅作研究性引用并逐条署名；引用方式为下载副本嵌入并注明出处。</p>
<table>
<tr><th>资产</th><th>来源</th><th>版权</th></tr>
<tr><td>dp_teaser.png, dp_policy_input_output.png</td><td>arXiv:2303.04137（Diffusion Policy, Chi et al., RSS 2023）</td><td>© 论文作者</td></tr>
<tr><td>pi0_overview.png, pi0_teaser.png</td><td>arXiv:2410.24164（π0, Physical Intelligence）</td><td>© Physical Intelligence</td></tr>
<tr><td>smolvla_arch.png, smolvla_async.png, smolvla_tasks.png</td><td>arXiv:2506.01844（SmolVLA, Hugging Face）</td><td>© 论文作者</td></tr>
<tr><td>pi05_verbal/subtask/detection/web.jpg</td><td>PI 官方博客《π0.5》（pi.website/blog/pi05）</td><td>© Physical Intelligence</td></tr>
<tr><td>pistar06_coffee.mp4</td><td>PI 官方博客《π*0.6》（pi.website/blog/pistar06）</td><td>© Physical Intelligence</td></tr>
<tr><td>pi07_subgoal/current_*.png, pi07_coaching.mp4, pi07_shirt_fold.mp4</td><td>PI 官方博客《π0.7》（pi.website/blog/pi07）</td><td>© Physical Intelligence</td></tr>
<tr><td>smolvla_hero.gif, smolvla_demo2.gif（如使用）</td><td>Hugging Face 博客《SmolVLA》</td><td>© Hugging Face</td></tr>
</table>
<p>如你是权利人并希望移除某项资产，请开 issue，我们会立即处理。</p>
`
}
];
