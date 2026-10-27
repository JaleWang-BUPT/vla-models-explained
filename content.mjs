// 站点内容：每个条目是一个页面 { file, title, short, kicker, body, prev, next }
// 正文为原创中文研究笔记（精读级）；引用图片/视频的版权归原作者，图注逐条标注。

const FIG = (src, cap, cls = '') =>
  `<figure${cls ? ` class="${cls}"` : ''}><img src="./assets/${src}" loading="lazy" alt=""><figcaption>${cap}</figcaption></figure>`;

const VID = (src, cap) =>
  `<figure><video src="./assets/${src}" controls playsinline preload="metadata"></video><figcaption>${cap}</figcaption></figure>`;

/* ---------- 自制 SVG 动画（SMIL，无 JS 依赖） ---------- */

// A1 Diffusion Policy：从噪声去噪出多模态动作分布
const animDiffusion = `
<div class="anim">
<svg viewBox="0 0 640 260" role="img" aria-label="扩散策略去噪动画">
  <path id="dp1" d="M60,210 C200,180 320,220 580,150" fill="none"/>
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
  <text x="40" y="34" font-size="15" fill="#6e6b64">噪声 z₁ ∼ N(0, I)</text>
  <text x="470" y="34" font-size="15" fill="#6e6b64">动作块（50 Hz，未来 t 步）</text>
  ${[ [90,180,520,90], [90,140,520,150], [90,100,520,60] ].map(([x1,y1,x2,y2]) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e5e1d8" stroke-width="2"/>`).join('')}
  ${[ [90,180,520,90], [90,140,520,150], [90,100,520,60] ].map(([x1,y1,x2,y2],i) =>
    `<circle r="4.6" fill="${['#c96442','#71855c','#a1732c'][i]}"><animateMotion dur="2.6s" begin="${i*0.5}s" repeatCount="indefinite" path="M${x1},${y1} L${x2},${y2}"/></circle>`).join('')}
  <g fill="#87847e">${[ [90,180],[90,140],[90,100] ].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>
  <g>${[ [520,90],[520,150],[520,60] ].map(([x,y],i) => `<rect x="${x}" y="${y-9}" width="46" height="18" rx="4" fill="${['#c96442','#71855c','#a1732c'][i]}" opacity="0.25"/><rect x="${x}" y="${y-9}" width="46" height="18" rx="4" fill="none" stroke="${['#c96442','#71855c','#a1732c'][i]}" stroke-width="1.6"/>`).join('')}</g>
  <text x="60" y="218" font-size="12.5" fill="#87847e">训练：回归直线速度场 v ≈ a − z₁　推理：从噪声出发沿直线 Euler 积分数步</text>
</svg></div>`;

// A3 SmolVLA：异步推理
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
  ${[['演示', 'Demo', 90, 210], ['纠正', 'Coach', 95, 470], ['自主经验', 'Explore', 190, 300]].map(([t, e, y, x], i) => `
    <circle cx="${x}" cy="${y}" r="44" fill="#ffffff" stroke="${['#71855c', '#a1732c', '#c96442'][i]}" stroke-width="2.4"/>
    <text x="${x}" y="${y - 2}" text-anchor="middle" font-size="13.5" fill="#1f1e1d">${t}</text>
    <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="11" fill="#6e6b64">${e}</text>`).join('')}
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
  ${[ ['#c96442', 'M150,120 C260,140 380,120 560,95'], ['#71855c', 'M150,125 C260,110 400,160 560,140'], ['#a1732c', 'M150,130 C280,180 420,175 560,185'] ].map(([c, d], i) => `
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
<h1>从 Diffusion Policy 到 π0.7：VLA 方法精读图解</h1>
<p>一份面向研究者的中文精读笔记，沿“<b>动作怎么生成、数据怎么用、泛化从哪来、可靠性怎么建</b>”四条线拆解六个代表性模型：<b>Diffusion Policy（2023）→ π0（2024）→ π0.5（2025）→ SmolVLA（2025）→ π*0.6（2025）→ π0.7（2026）</b>。每页固定结构：问题 → 方法精读（含公式与架构细节）→ 训练与实现 → 结果与消融 → 研究者注记。所有论文图与官方动画逐条署名；机制动画（✳）为本站自制的 SVG/SMIL，零 JS、可自由复用。</p>
<div class="note">这六个模型恰好构成一条完整的因果链：DP 立住“动作=生成模型”→ π0 把它接进 VLM 与 50Hz 控制 → π0.5 解决场景泛化 → SmolVLA 证明范式可小型化 → π*0.6 用 RL 补可靠性 → π0.7 把前面所有数据源用“条件化”统一起来。读的时候建议对照每页的“研究者注记”。</div>
<h2 id="timeline">时间线</h2>
<ul class="timeline">
  <li><span class="yr">2023 · RSS　</span><b>Diffusion Policy</b>：把动作生成变成去噪。多模态动作分布的表达第一次在真机上立住，15 个任务平均成功率 60.7%（此前 SOTA 44.6%）。</li>
  <li><span class="yr">2024 · π0　</span><b>Physical Intelligence</b>：PaliGemma 3B + 300M flow matching 动作专家，7 构型 68 任务 + OXE 全集预训练，把语义先验接到 50Hz 灵巧操作。</li>
  <li><span class="yr">2025 · π0.5　</span>：异构共训（网络多模态 + 多本体 + 语义标注），推理先出子任务再出动作，泛化到训练时没见过的家庭。</li>
  <li><span class="yr">2025 · SmolVLA　</span><b>Hugging Face</b>：450M、481 个社区数据集 22.9K episodes 预训练，消费级 GPU 可训；异步推理响应快 30%、吞吐 2×。</li>
  <li><span class="yr">2025 · π*0.6　</span>：RECAP 后训练（演示 + 纠正 + 自主经验 + 优势条件化），最难任务吞吐翻倍、失败率减半，咖啡做到全天连续。</li>
  <li><span class="yr">2026 · π0.7　</span>：多样化上下文条件——提示里给“怎么做”（子目标图/元数据/策略），同一模型开箱达到专家特化水平，零样本跨本体叠衬衫。</li>
</ul>
<h2 id="compare">谱系对比表</h2>
<table>
<tr><th>模型</th><th>年份</th><th>参数量</th><th>动作头</th><th>训练范式</th><th>开源</th></tr>
<tr><td><a href="./diffusion-policy.html">Diffusion Policy</a></td><td>2023</td><td>数亿级（CNN/Transformer 两版）</td><td>DDPM 去噪（DDIM 可少步）</td><td>行为克隆（含动作 chunk + 滚动视界）</td><td><span class="badge b-oss">开源</span></td></tr>
<tr><td><a href="./pi0.html">π0</a></td><td>2024</td><td>3.3B（PaliGemma 3B + 专家 300M）</td><td>Flow Matching（H=50 动作块）</td><td>Transfusion 式多目标预训练 + 微调</td><td><span class="badge b-oss">openpi</span></td></tr>
<tr><td><a href="./pi05.html">π0.5</a></td><td>2025</td><td>与 π0 同量级</td><td>Flow Matching + 两阶段推理</td><td>异构共训（含网络多模态与语义标注）</td><td><span class="badge b-oss">openpi</span></td></tr>
<tr><td><a href="./smolvla.html">SmolVLA</a></td><td>2025</td><td>450M</td><td>Flow Matching（n=50，层跳过）</td><td>社区数据（481 集 / 22.9K episodes）</td><td><span class="badge b-oss">开源</span></td></tr>
<tr><td><a href="./pistar06.html">π*0.6</a></td><td>2025</td><td>π0.6 基座</td><td>Flow Matching + 优势条件化</td><td>RECAP：演示 + 纠正 + 自主经验</td><td>未开源</td></tr>
<tr><td><a href="./pi07.html">π0.7</a></td><td>2026</td><td>π0.6 量级</td><td>Flow Matching + 多模态提示条件</td><td>多样化上下文条件训练</td><td>未开源</td></tr>
</table>
<h2>四条研究主线</h2>
<ol>
<li><b>动作表示</b>：离散 token（RT-2/OpenVLA 一系）→ 回归 → CVAE（ACT）→ 扩散（Diffusion Policy）→ flow matching（π0 及之后全部）。判据有三：分布表达力（多模态）、推理步数可调（延迟换精度）、对高频连续控制的适配（50Hz 级动作点）。</li>
<li><b>数据复用</b>：单任务演示 → 异构共训（π0.5：网络数据 + 语义标注）→ 社区数据（SmolVLA：10.6M 帧）→ 自主经验回收（π*0.6：价值函数当标签）→ 低质量数据经元数据“消毒”后入库（π0.7）。</li>
<li><b>泛化来源</b>：π0.5 靠“见多”（地点规模曲线持续上升）→ π0.7 靠“条件化”（把数据差异显式写进提示），组合泛化开始像 LLM。</li>
<li><b>可靠性</b>：模仿学习的小错误会复合（π*0.6 页的 Portafilter 案例）→ 价值函数给经验打标签 → 优势条件化让策略“优于训练数据”。</li>
</ol>
`
},
{
  file: 'diffusion-policy', short: 'Diffusion Policy', kicker: '2023 · RSS · COLUMBIA & TRI',
  title: 'Diffusion Policy：把动作生成变成去噪（精读）', prev: 'index', next: 'pi0',
  body: `
<p class="kicker">2023 · RSS · CHI ET AL.（COLUMBIA / TRI）</p>
<h1>Diffusion Policy 精读</h1>
<h2>1. 问题：模仿学习的两个顽疾</h2>
<p><b>多模态</b>：同一个观测下往往存在多条正确动作轨迹（从左绕和从右绕抓同一个杯子都对）。行为克隆若用 MSE 回归，模型学的是所有可行轨迹的<b>条件均值</b>——均值大概率落在两条可行轨迹之间，物理上不可执行。此前的解法（动作分类离散化、GMM 拟合、CVAE）各有各的表达瓶颈。</p>
<p><b>误差复合</b>：闭环执行时，一步小偏差把机器人带进训练分布没覆盖的状态，下一步偏差更大。单步预测的策略没有“对未来一段时间的联合规划”，误差在时间上自由累积。</p>
<h2>2. 方法精读</h2>
<h3>2.1 把 DDPM 搬到动作空间</h3>
<p>前向过程对真值动作序列逐步加噪：$x^k = \\sqrt{\\alpha_k}\,x^{k-1} + \\sqrt{1-\\alpha_k}\,\\epsilon^{k-1}$，$k=1..T$；网络 $\\epsilon_\\theta(x^k, k, o)$ 以观测 $o$ 为条件预测噪声。一个漂亮的视角是论文把去噪解释为<b>学习率调度下的梯度下降</b>：$\\epsilon_\\theta$ 实际上是能量函数 $E(x)$ 的梯度场，$\\sigma_k^2/\\alpha_k^{k-1}$ 就是步长——噪声调度 = 优化器调度，这解释了为什么去噪能“收敛”到分布里的高质量样本。</p>
<p>推理从纯噪声 $x^T$ 起步迭代 T 步；由于每步都要重算 $\\epsilon_\\theta$，作者用 <b>DDIM</b> 解耦训练与推理的迭代数——训练走完整链（100 步量级），推理可以少步（项目实现里 DDIM 10 步）来满足闭环控制的实时性。</p>
<h3>2.2 两个关键工程决策</h3>
<ul>
<li><b>滚动视界控制（receding horizon）</b>：预测未来 Tp 步、只执行前 To 步就重新观测再预测。Transformer 版取 Tp=16、To=8——chunk 提供时间一致性与平滑，滚动提供闭环性。这是后来 action chunk 一切玩法（ACT、π0 的 H=50）的原型。</li>
<li><b>视觉条件化只算一次</b>：去噪迭代 T 步中观测特征不变，因此<b>视觉编码只做一次</b>、被全部去噪步共享——推理成本大头被砍掉，这是扩散策略能实时的基础之一。</li>
</ul>
<h3>2.3 两种网络形态</h3>
<p><b>CNN 版</b>：FiLM 条件化的时序卷积（一维时间 U-Net），适合低维状态输入、固定视界；<b>Transformer 版</b>：时序扩散 transformer，用 min-SNR 加权损失缓解 CNN 版的“过平滑”（over-smoothing）效应，在高频动作变化与速度控制任务上明显更好——即本站动画里“能走到尖锐拐点”的能力。两版共享的视觉前端：<b>ResNet-18（不用 ImageNet 预训练）+ spatial softmax 池化（保留空间结构）+ GroupNorm 替换 BatchNorm</b>——GroupNorm 与权重 EMA 的组合是扩散训练稳定性的隐藏前提。</p>
${FIG('dp_policy_input_output.png', '<b>图 · 策略输入输出与 CNN/Transformer 两种形态</b>（图片来源：Chi et al., <i>Diffusion Policy</i>, arXiv:2303.04137，版权归原作者）')}
${animDiffusion}
<h2>3. 结果与消融</h2>
<p>15 个真机任务（Push-T、倒水、6-DoF 插入、双臂整理等）平均成功率 <b>60.7%</b>，此前 SOTA 44.6%。消融层面值得记住的三件事：①在<b>多模态任务</b>（如 Push-T 要从两侧推）上，DP 学出双峰分布而回归头塌到均值；②<b>动作 chunk</b> 消融中滚动视界优于固定开环执行；③<b>视觉编码不预训练</b>反而更好——扩散目标本身提供了足够的学习信号，把表示学习的负担从“预训练”转移到了“策略训练”内部。</p>
${FIG('dp_teaser.png', '<b>图 · 真机任务集锦</b>（图片来源：arXiv:2303.04137，版权归原作者）')}
<h2>4. 研究者注记</h2>
<blockquote>①推理成本是扩散动作头的原罪：T 步去噪 × 每步全网络前向。DP 用“视觉只编码一次 + DDIM 少步”压成本，π0 换成直线路径的 flow matching 把步数压到个位数——这是理解后续所有动作头演化的主线。②DP 仍是纯 BC：它表达了多模态，但没有解决“错了会复合”——π*0.6 页面会讲这个坑怎么用 RL 填。③复现入口：<a href="https://github.com/real-stanford/diffusion_policy" target="_blank" rel="noopener">real-stanford/diffusion_policy</a> 与 LeRobot 的 <code>diffusion</code> 策略实现；超参口径以官方仓库为准。</blockquote>
<p><b>参考</b>：Chi et al., <i>Diffusion Policy: Visuomotor Policy Learning via Action Diffusion</i>, RSS 2023（<a href="https://arxiv.org/abs/2303.04137" target="_blank" rel="noopener">arXiv:2303.04137</a> · <a href="https://www.diffusion-policy.cs.columbia.edu/" target="_blank" rel="noopener">项目页</a>）</p>
`
},
{
  file: 'pi0', short: 'π0', kicker: '2024 · PHYSICAL INTELLIGENCE',
  title: 'π0：VLM 主干 + Flow Matching 动作专家（精读）', prev: 'diffusion-policy', next: 'pi05',
  body: `
<p class="kicker">2024 · PHYSICAL INTELLIGENCE</p>
<h1>π0 精读</h1>
<h2>1. 问题：语义与高频控制之间的鸿沟</h2>
<p>2024 年的 VLA（RT-2、OpenVLA 一系）把动作离散成 token 自回归生成——这在语义层面优雅，但在<b>高频灵巧操作</b>上撞墙：离散化有精度损失、逐 token 串行解码慢、自回归的逐点生成难以表达连续轨迹的多模态分布。π0 的判断是：动作应该<b>连续生成</b>，而且要用 DP 已经验证过的“生成式分布表达”，但推理步数要压到高频可用——答案是 <b>flow matching</b>。</p>
<h2>2. 架构精读</h2>
<h3>2.1 双权重块 + 同一序列</h3>
<p>π0 = <b>PaliGemma 3B</b>（SigLIP 视觉编码器 + Gemma 语言模型，互联网级预训练）+ <b>动作专家约 300M</b>（从头初始化），合计 <b>3.3B</b>。关键在交互方式：图像/语言 token 走 VLM 权重，机器人状态与带噪动作 token 走动作专家权重，但<b>所有 token 在同一序列里做联合 attention</b>——论文明确说这是“两个混合元素的 mixture of experts”式设计。动作专家不是接在 VLM 后面的另一个模型，而是同一次前向里并行工作的独立权重块。</p>
<h3>2.2 Flow matching 动作块（H=50）</h3>
<p>动作块记 $\\mathbf{A}^\\tau_t = [\\mathbf{a}^\\tau_t, ..., \\mathbf{a}^\\tau_{t+H-1}]$，动作地平线 <b>H=50</b>（任务口径 50Hz，约 1 秒的未来动作）。训练时把带噪动作 token 与时间步 $\\tau$ 一起塞进序列，只对 H 个动作位置的输出计算流匹配损失：回归直线速度场 $\\mathbf{v}_\\theta$；推理从噪声沿直线 Euler 积分数步。预训练是 <b>Transfusion 式多目标</b>：机器人数据走 flow matching 损失，图文数据保留语言建模目标——语义能力不掉，动作能力照学。</p>
${animFlow}
${FIG('pi0_overview.png', '<b>图 · π0 架构总览</b>：VLM 主干 + 动作专家 + flow matching 数据流（图片来源：Physical Intelligence, <i>π0</i>, arXiv:2410.24164，版权归原作者）')}
<h2>3. 训练与数据</h2>
<p>预训练混合 = <b>自有灵巧操作数据（7 种机器人构型、68 个任务）+ 完整 OXE 数据集（22 种机器人）</b>，总量超过 <b>10,000 小时</b>；再按任务微调。论文强调流匹配给的“高精度 + 多模态建模”正是高频灵巧任务（叠衣服）此前自回归 VLA 做不了的原因。</p>
${FIG('pi0_teaser.png', '<b>图 · π0 覆盖的任务谱</b>（图片来源：arXiv:2410.24164，版权归原作者）')}
<h2>4. 结果与消融</h2>
<p>三组对照值得记住：①<b>π0-small</b>：470M 的无 VLM 初始化消融版——证明“互联网预训练的主干”本身是性能来源，不是参数量的堆砌；②与 <b>OpenVLA / Octo</b> 的“对齐训练量”对比（160k steps，OpenVLA 还额外试了只在目标本体数据上训练的版本），π0 全面占优；③微调效率：叠衣服、收桌子、装盒子等任务上少量演示即可适配。2025 年开源 <a href="https://github.com/Physical-Intelligence/openpi" target="_blank" rel="noopener">openpi</a>（JAX/PyTorch 双实现），成为社区最重要的 VLA 基座。</p>
<h2>5. 研究者注记</h2>
<blockquote>①动作频率 ≠ 推理频率：50Hz 是动作块内动作点的时间参数化，模型重规划频率低得多——块间衔接（RTC/ensembling）是独立的工程问题。②“VLM + 小动作专家 + 分块注意力”是一个可复用骨架：SmolVLA 换成 SmolVLM2 照用，π0.5/π0.6/π0.7 沿用。③flow matching vs 扩散的取舍（直线路径、步数可调、确定性采样）在 DP 页的去噪动画语境下理解最直观：π0 本质上把“扩散的随机游走”换成了“直线流”。</blockquote>
<p><b>参考</b>：Black et al., <i>π0: A Vision-Language-Action Flow Model for General Robot Control</i>（<a href="https://arxiv.org/abs/2410.24164" target="_blank" rel="noopener">arXiv:2410.24164</a> · <a href="https://www.physicalintelligence.company/blog/pi0" target="_blank" rel="noopener">官方博客</a> · <a href="https://github.com/Physical-Intelligence/openpi" target="_blank" rel="noopener">openpi</a>）</p>
`
},
{
  file: 'pi05', short: 'π0.5', kicker: '2025 · PHYSICAL INTELLIGENCE',
  title: 'π0.5：异构共训与开放世界泛化（精读）', prev: 'pi0', next: 'smolvla',
  body: `
<p class="kicker">2025 · PHYSICAL INTELLIGENCE</p>
<h1>π0.5 精读</h1>
<h2>1. 问题：场景级泛化</h2>
<p>π0 时代（含同期所有 VLA）的评测环境都与训练环境高度相似；商业机器人因此只敢进工厂和仓库。π0.5 把目标定为<b>在从未见过的家庭里完成长程任务</b>——收拾厨房（关柜门、把物品放进水槽）、收拾卧室（捡起地上所有衣服）——并且明确声明：目标不是新技能或更高灵巧度，而是<b>泛化本身</b>。</p>
<h2>2. 方法精读：共训 + 混合多模态样本</h2>
<p>π0.5 的核心观察：VLA 继承自 VLM，而 VLM 的训练样本本来就是“图像、文本、框、动作的任意组合”。于是 π0.5 的训练样本是<b>混合多模态（hybrid multimodal）</b>的：一条样本可以同时含图像观测、语言命令、物体检测、语义子任务预测与底层动作——不同来源的数据不再需要严格的同构对齐，因为它们共享同一个序列接口。共训配方对应四类形态（官方图）：</p>
${animCotrain}
${FIG('pi05_verbal.jpg', '<b>图 1 · 语言指令条件</b>（图片来源：Physical Intelligence 官方博客 <i>π0.5</i>，版权归原作者）', 'duo')}
${FIG('pi05_subtask.jpg', '<b>图 2 · 高层子任务命令</b>（图片来源同上）', 'duo')}
${FIG('pi05_detection.jpg', '<b>图 3 · 物体检测/指代标注</b>（图片来源同上）', 'duo')}
${FIG('pi05_web.jpg', '<b>图 4 · 网络多模态数据</b>：图文任务混入机器人训练（图片来源同上）', 'duo')}
<h3>2.1 两阶段推理</h3>
<p>推理时模型<b>先推断高层子任务（语义命令），再以子任务为条件预测连续动作</b>——动作解码仍是 flow matching（继承 π0）。这个分层让长程任务（铺床 = 拉平枕套 → 铺平 → 摆正）有了显式的阶段结构，也是后来 π0.7 “语言教练”能力的雏形。</p>
<h3>2.2 实现细节里值得抄的三处</h3>
<ul>
<li>所有动作数据<b>按数据集各自的 1%/99% 分位归一化到 $[-1,1]$</b>；动作维度取全体数据集的最大维，低维本体 padding——跨本体数据的统一接口做法。</li>
<li>语义命令以特定标记（如 <code>' > '</code>）追加到文本提示里，让“子任务预测”与“语言跟随”在同一模板下共存。</li>
<li>评测用<b>部分得分</b>（partial credit）评分细则：把一半盘子放进水槽记约 50%——长程任务的成功率统计必须有这类协议，否则数字没有意义。</li>
</ul>
<h2>3. 结果与消融</h2>
<p>评测在多个<b>训练时完全没见过的家庭</b>进行（收厨房、收卧室等长程任务），π0.5 能持续完成任务、展现类人的应变。三个系统性结论：①<b>泛化随训练地点数稳步上升</b>（语言跟随实验里，随训练场景增加，对已见/未见物体类别的成功率都持续提高）——场景多样性是可积累的资产；②<b>共训配方消融</b>（V-C 节）逐一验证了语义预测、web 数据等成分的边际贡献；③<b>高层推理消融</b>（V-E 节）：去掉子任务预测，长程任务的阶段衔接明显变差。</p>
<h2>4. 研究者注记</h2>
<blockquote>①π0.5 把“数据工程”变成“接口工程”：难点不在收集更多数据，而在让异质数据共享同一个序列模板。②子任务先行的两阶段推理是分层策略的最小实现——不引入额外模型，只是让 VLM 部分先说一句话。③它仍然只解决“见过类似技能在新场景执行”；π0.7 的组合泛化（没见过的电器）是下一层。</blockquote>
<p><b>参考</b>：Physical Intelligence, <i>π0.5: a Vision-Language-Action Model with Open-World Generalization</i>（<a href="https://arxiv.org/abs/2504.16054" target="_blank" rel="noopener">arXiv:2504.16054</a> · <a href="https://www.pi.website/blog/pi05" target="_blank" rel="noopener">官方博客</a>）</p>
`
},
{
  file: 'smolvla', short: 'SmolVLA', kicker: '2025 · HUGGING FACE',
  title: 'SmolVLA：450M 的社区级 VLA（精读）', prev: 'pi05', next: 'pistar06',
  body: `
<p class="kicker">2025 · HUGGING FACE · LEROBOT 生态</p>
<h1>SmolVLA 精读</h1>
<h2>1. 问题：VLA 的资源墙</h2>
<p>OpenVLA（7B）、RT-2-X 等验证了开放 VLA 的可行性，但训练要 A100 集群、部署要大显存、依赖昂贵本体——学术实验室与爱好者被挡在门外。SmolVLA 的命题：<b>单张消费级 GPU 可训、CPU/消费 GPU 可部署</b>的 VLA，性能仍要有竞争力。答案分两半：架构上“小而精”，推理调度上“异步”。</p>
<h2>2. 架构精读</h2>
<h3>2.1 SmolVLM2 主干 + 交错注意力动作专家</h3>
<p>VLM 主干用 <b>SmolVLM2</b>（SigLIP 视觉编码器 + SmolLM2 语言模型，针对多图输入优化）；动作专家以 <b>flow matching</b> 目标训练，输出 <b>n=50</b> 的动作块——π0 式动作头直接下沉。专家的注意力块是<b>交错排列</b>的：cross-attention（读 VLM 特征，金色块）与 self-attention（动作 token 之间，浅黄块）交替，让 50 个动作 token 在小参数量下仍充分吃到视觉语义。</p>
${FIG('smolvla_arch.png', '<b>图 · SmolVLA 架构</b>（图片来源：Shukor et al., <i>SmolVLA</i>, arXiv:2506.01844，版权归原作者）')}
<h3>2.2 三个效率设计与一个反直觉消融</h3>
<ul>
<li><b>视觉 token 削减</b>：图像统一缩放到 512×512（与 VLM 输入口径一致），视觉 token 压到最少必要量。</li>
<li><b>层跳过（layer skipping）</b>：推理时跳过 VLM 的部分上层。消融的关键结论：<b>“用 500M 的 VLM 但跳层”优于“直接换 256M 的更小 VLM”</b>——深度比宽度值钱，跳层是免费的宽度缩减。</li>
<li><b>交错 cross/self-attention</b>：见上，cross 层比 self 层便宜。</li>
<li>训练用 AdamW（$\\beta_1=0.9, \\beta_2=0.95$）。</li>
</ul>
<h3>2.3 数据：社区规模化</h3>
<p>预训练完全来自 LeRobot 社区数据集：<b>481 个数据集、22.9K episodes、10.6M 帧</b>——比其他 SOTA 的预训练集小至少一个数量级。配套工作是把社区数据里混乱的相机视角<b>标准化</b>（统一内外参约定），否则跨数据集训练无从谈起。这个“小一个数量级也能打”的结果，是社区数据路线的第一次系统性正名。</p>
${FIG('smolvla_tasks.png', '<b>图 · 训练/评测任务谱</b>（图片来源：arXiv:2506.01844，版权归原作者）')}
<h2>3. 异步推理栈（精读）</h2>
<p>同步执行下，GPU 推理期间机器人干等——chunk 越长空闲越明显。SmolVLA 的异步栈把“感知与预测”从“执行”中解耦：机器人执行第 k 块时，最新观测已发往 <b>Policy Server</b>（可托管在远端 GPU）计算第 k+1 块。两个工程细节：①<b>早触发（early trigger）</b>：当动作队列长度降到阈值就发起推理，而不是等队列耗尽；②<b>陈旧块丢弃</b>：推理返回时若已过时则整块作废，不污染执行。官方口径：<b>响应快 30%、任务吞吐 2×</b>。</p>
${animAsync}
${FIG('smolvla_async.png', '<b>图 · 异步推理时序</b>（图片来源：arXiv:2506.01844，版权归原作者）')}
<h2>4. 结果与研究者注记</h2>
<p>LIBERO 与 Meta-World 上以多任务设置训练，<b>胜过 Octo、OpenVLA 与 diffusion policy 基线</b>；真机在低成本 SO-100/SO-101 上验证，并展示跨本体共训的相互增益。</p>
<blockquote>①SmolVLA 与 π0 共享 flow matching 动作头，但把“规模叙事”换成“系统叙事”：层跳过、交错注意力、异步栈每一项都是系统工程，累积起来就是 2× 的实际吞吐——研究里容易被低估的这类贡献。②“跳层优于缩模型”的消融值得推广到所有 VLM+动作头的架构：主干深度在小数据动作学习里是冗余的。③社区数据（10.6M 帧）+ 标准化 = 可持续的预训练池，π0.7 的元数据“消毒”思路是它的自然延伸。</blockquote>
<p><b>参考</b>：Shukor et al., <i>SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics</i>（<a href="https://arxiv.org/abs/2506.01844" target="_blank" rel="noopener">arXiv:2506.01844</a> · <a href="https://huggingface.co/blog/smolvla" target="_blank" rel="noopener">HF 博客</a> · <a href="https://github.com/huggingface/lerobot" target="_blank" rel="noopener">LeRobot</a>）</p>
`
},
{
  file: 'pistar06', short: 'π*0.6', kicker: '2025 · PHYSICAL INTELLIGENCE',
  title: 'π*0.6：RECAP——用 RL 把 VLA 磨到全天可靠（精读）', prev: 'smolvla', next: 'pi07',
  body: `
<p class="kicker">2025 · PHYSICAL INTELLIGENCE · RL 后训练</p>
<h1>π*0.6 与 RECAP 精读</h1>
<h2>1. 问题：从“偶尔成功”到“持续可靠”的鸿沟</h2>
<p>模仿学习的失败模式有清晰的机制：<b>误差复合</b>。VLA 犯一个小错（比如以错误角度抓住咖啡机手柄），环境随即进入训练分布外的状态，下一步更容易犯错——而<b>真正的失败原因可能发生在几步之前</b>，监督学习只在“当时正确”的轨迹上训练，永远不会修正这种早期偏差。LLM 输出错了可以重来，机器人错了物理世界不等人：所以 VLA“偶尔成功容易，持续可靠很难”。π*0.6（π0.6 基座 + RECAP 后训练）给出了一套可复制的解法。</p>
${animRecap}
<h2>2. RECAP 精读（RL with Experience & Corrections via Advantage-conditioned Policies）</h2>
<h3>2.1 价值函数：给“坏经验”打标签</h3>
<p>自主经验数据的问题是<b>没有真值标签</b>——照抄自己的失败毫无意义。RECAP 训一个<b>价值函数</b>：预测“当前处境相对其他处境有多好”（博客用棋局类比：预测从当前盘面赢棋的概率）。有了它，就能对一段自主 rollout 做回溯归因——哪怕失败发生在最后一步，也能把“以错误角度抓 Portafilter”标记为错误。信用分配问题（早期错误、晚期暴露）由此被价值函数的回溯性质解决。</p>
<h3>2.2 优势条件化：策略优于训练数据</h3>
<p>“价值的相对变化”在 RL 里叫<b>优势（advantage）</b>。RECAP 的独特之处是把优势<b>作为条件输入策略</b>（advantage-conditioned），而不只是当加权系数：执行时直接要求 VLA “执行高优势动作”。这样学出的策略<b>可以优于产生它数据的平均质量</b>——数据里好坏混合，条件化让模型学会在推理时选择好的一端。</p>
<h3>2.3 三个数据来源，两种“坏数据”的好用法</h3>
<p>RECAP 训练数据 = <b>演示</b>（遥操作打底）+ <b>纠正</b>（专家在策略跑偏时接手拉回——含“如何修复错误/做得更好”的信息）+ <b>自主经验</b>（价值函数打标签）。博客强调的两个技巧：纠正数据教会“从错误恢复”，自主数据教会“不犯第一次错”——两种“坏经验”都被转化成训练信号。</p>
${VID('pistar06_coffee.mp4', '<b>视频 · RECAP 训练后的咖啡制作</b>（视频来源：Physical Intelligence 官方博客 <i>π*0.6</i>，版权归原作者）')}
<h2>3. 结果</h2>
<ul>
<li>最难任务的吞吐量 <b>翻倍以上</b>，失败率<b>至少减半</b>；</li>
<li>咖啡制作从 <b>5:30am 连续跑到 11:30pm</b>（全天商用时段）；</li>
<li><b>新家叠 50 件未见衣物</b>数小时不中断；真实工厂里装配并贴标 <b>59 个巧克力包装盒</b>；</li>
<li>三段未剪辑长视频全部公开（官方博客“Real-time versions”链接）。</li>
</ul>
<h2>4. 研究者注记</h2>
<blockquote>①RECAP 的可复用模板：价值函数 = 自主经验的标注器；优势条件化 = 让策略“高于数据分布”的旋钮；纠正数据 = 恢复行为的监督来源。三件事各自独立，可单独移植到任何 VLA 后训练管线。②注意数据闭环：RECAP 产生的自主经验 + 价值标注，就是 π0.7 页面里“带策略元数据并入通用训练”的那批数据——π*0.6 是特化模型，也是 π0.7 的数据工厂。③复现级细节官方未完全公开（价值模型结构、优势离散化方式），开源社区的对标实现可关注 openpi 的 RL 分支进展。</blockquote>
<p><b>参考</b>：Physical Intelligence, <i>π*0.6: a VLA That Learns from Experience and Corrections</i>（<a href="https://www.pi.website/blog/pistar06" target="_blank" rel="noopener">官方博客</a>）</p>
`
},
{
  file: 'pi07', short: 'π0.7', kicker: '2026 · PHYSICAL INTELLIGENCE',
  title: 'π0.7：可转向的通用主义模型（精读）', prev: 'pistar06', next: 'index',
  body: `
<p class="kicker">2026 · PHYSICAL INTELLIGENCE · STEERABLE GENERALIST</p>
<h1>π0.7 精读</h1>
<h2>1. 问题：组合泛化为什么在 VLA 里迟迟没出现</h2>
<p>LLM 的标志性能力是<b>重组</b>：会英译法 + 会输出 JSON，就能输出 JSON 格式的翻译。VLA 能理解丰富的语义概念，却一直做不到“把学过的技能组合起来解决新任务”——比如用一件训练时没见过的厨房电器。此前哪怕训练中见过的技能，想用好也都要按任务微调，“通用模型开箱即专家”停留在愿景。π0.7（2026-04）展示的正是这个愿景的第一批实证。</p>
<h2>2. 方法精读：多样化上下文条件</h2>
<p>核心论断：<b>naive 地混合多源数据不会带来好的泛化；泛化的关键是把“怎么做的差异”写进提示</b>。π0.7 的提示除语言指令外，还包括：</p>
<ul>
<li><b>子目标图像（subgoal images）</b>：定义“当前子步骤结束时物体该被摆成什么样”的精确空间布局；</li>
<li><b>元数据（metadata）</b>：episode 的期望时长（做得多快）、质量标注（好/差）——次优的自主评测数据标注上“低质量/低速”后<b>就能入库而不会教坏模型</b>；</li>
<li><b>策略描述</b>：文本化的执行策略。</li>
</ul>
<p>测试时模型接受标准语言指令，但也接受期望策略信息、甚至由<b>轻量世界模型合成的视觉子目标</b>——世界模型在这里的角色是“提示生成器”，为没有真值子目标的任务提供视觉条件。</p>
${animSteer}
<h2>3. 数据侧：把 π*0.6 的经验变成通用训练数据</h2>
<p>训练数据横跨<b>多机器人、人类数据、以及各策略跑出的自主 episode</b>。关键的缝合技巧：把 π*0.6 经 RECAP 产生的自主经验<b>带策略元数据</b>并入 π0.7 训练——同一批“特化模型的经验”就这样变成“通用模型的通识”。</p>
${FIG('pi07_subgoal_1.png', '<b>图 · 子目标图像（期望终态）</b>（图片来源：Physical Intelligence 官方博客 <i>π0.7</i>，版权归原作者）', 'duo')}
${FIG('pi07_current_1.png', '<b>图 · 当前观测（起始状态）</b>：条件 = 语言 + 子目标 + 元数据（图片来源同上）', 'duo')}
${FIG('pi07_subgoal_3.png', '<b>图 · 另一组子目标示例</b>（图片来源同上）', 'duo')}
${FIG('pi07_current_3.png', '<b>图 · 对应当前观测</b>（图片来源同上）', 'duo')}
<h2>4. 三个涌现能力与数字</h2>
<h3>4.1 开箱即专家</h3>
<p>在叠衣（T-Shirts & Shorts / Diverse-Hardest Item 两档难度）、咖啡制作、装盒任务组上，单个 π0.7 的吞吐（按专家特化模型归一化）达到<b>持平或更高</b>，成功率相当——即“通用模型 ≥ 特化模型”，这是“开箱即专家”主张的直接证据。</p>
<h3>4.2 语言教练（language coaching）</h3>
<p>面对没见过的厨房电器（空气炸锅），机器人收到的是<b>逐步语言命令</b>——和指导第一次用电器的人一样。之后把高层策略微调成“自动生成语言子任务”的版本，<b>无需任何额外遥操作</b>，任务的全自主执行显著改善——机器人实际上“从语言教练那里学会了任务”。页面可视化里还能看到世界模型合成的子目标图逐步变化。</p>
${VID('pi07_coaching.mp4', '<b>视频 · 空气炸锅任务的语言教练与子目标可视化</b>（视频来源：Physical Intelligence 官方博客 <i>π0.7</i>，版权归原作者）')}
<h3>4.3 零样本跨本体</h3>
<p>训练集中最欠 represented 的本体之一是<b>双臂 UR5e 系统</b>（两台 UR5e 工业臂 + Robotiq 平行夹爪）——臂重大惯量大、夹爪精度低、极难遥操作。π0.7 在这台机器人上零样本叠衣（无任何该本体的叠衣数据），成功率<b>与“首次在这台机器人上做该任务的人类专家遥操作者”持平</b>。</p>
${VID('pi07_shirt_fold.mp4', '<b>视频 · 零样本跨本体衬衫折叠（双臂 UR5e）</b>（视频来源同上）')}
<h2>5. 研究者注记</h2>
<blockquote>①π0.7 的深层主张是数据护城河的重新定义：泛化不靠“更多同质数据”，靠“条件化消化异质数据”——低质量数据从负资产变成（带标注的）资产，数据工程的重心从“采好数据”移到“把数据之间的差异写清楚”。②世界模型路线之争在这里被降维：世界模型不必是“另一个大模型路线”，它可以是 VLA 的子目标生成器——一条轻量的融合路径。③开放问题：子目标合成的保真度成为新上界；元数据标注从哪来（人工/自动评测）是数据管线的下一个瓶颈；RECAP 经验的“策略元数据”具体形式官方未完全公开。</blockquote>
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
<tr><td>pi05_verbal/subtask/detection/web.jpg</td><td>PI 官方博客《π0.5》（pi.website/blog/pi05）+ arXiv:2504.16054</td><td>© Physical Intelligence</td></tr>
<tr><td>pistar06_coffee.mp4</td><td>PI 官方博客《π*0.6》（pi.website/blog/pistar06）</td><td>© Physical Intelligence</td></tr>
<tr><td>pi07_subgoal/current_*.png, pi07_coaching.mp4, pi07_shirt_fold.mp4</td><td>PI 官方博客《π0.7》（pi.website/blog/pi07）</td><td>© Physical Intelligence</td></tr>
</table>
<p>如你是权利人并希望移除某项资产，请开 issue，我们会立即处理。</p>
`
}
];
