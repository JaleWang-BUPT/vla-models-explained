// Research notes with paper figures and official demonstrations.
// Presentation tokens, typography and layout remain in the original build.mjs.
import { media } from './media.mjs';
import { withResearchNotes } from './research-notes.mjs';

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const LINK = (url, label) => '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + label + '</a>';
const SOURCE = src => {
  const m = media[src];
  if (!m) throw new Error('Unregistered media: ' + src);
  return '来源：' + LINK(m.source, m.label) + ' · © ' + m.owner +
    (m.original ? ' · ' + LINK(m.original, '原始文件') : '') +
    (m.transformation ? '<br>' + m.transformation : '');
};
const IMG = src => '<img src="./assets/' + src + '" loading="lazy" decoding="async" alt="' + esc(media[src].alt) + '">';
const FIG = (src, cap) => '<figure>' + IMG(src) + '<figcaption>' + cap + '<br>' + SOURCE(src) + '</figcaption></figure>';
const PAIR = (a, b, cap) => '<figure class="duo">' + IMG(a) + IMG(b) + '<figcaption>' + cap + '<br>' + SOURCE(a) + '</figcaption></figure>';
const VID = (src, cap) => '<figure><video controls playsinline loop preload="metadata" poster="./assets/' +
  src.replace(/\.mp4$/, '-poster.jpg') + '" aria-label="' + esc(media[src].alt) + '"><source src="./assets/' +
  src + '" type="video/mp4">浏览器不支持此视频，请' + LINK('./assets/' + src, '打开媒体文件') +
  '。</video><figcaption>' + cap + '<br>' + SOURCE(src) +
  '<br>点击播放，可暂停、拖动进度或全屏；本站不自动播放，也不额外加速。</figcaption></figure>';
const creditRows = Object.entries(media).map(([file, m]) => '<tr><td>' + file + '</td><td>' +
  LINK(m.source, m.label) + (m.original ? '<br>' + LINK(m.original, '原始文件') : '') +
  '</td><td>© ' + m.owner + '<br>' + (m.transformation || '沿用原图或官方媒体副本；未重绘内容。') + '</td></tr>').join('\n');

export const pages = [
{
  file: "index",
  short: "总览",
  title: "VLA 模型图解 · 从 Diffusion Policy 到 π0.7",
  body: String.raw`
<p class="kicker">VLA METHODS, VISUALLY</p>
<h1>从 Diffusion Policy 到 π0.7：VLA 方法精读图解</h1>
<p>这份笔记沿“<b>动作怎么生成、数据怎么用、泛化从哪来、可靠性怎么验证</b>”四条线，阅读 Diffusion Policy、π0、π0.5、SmolVLA、π0.6 / π*0.6 与 π0.7。每页保留：问题 → 方法精读 → 训练与实现 → 结果 → 研究者注记。<b>Diffusion Policy 是视觉运动策略，不以语言条件作为原方法的组成部分</b>；这里把它作为连续动作生成的基础阅读，而不是将它追认为 VLA。</p>
<div class="note">这是按研究问题组织的阅读路线，不是“后一篇全面取代前一篇”的单线谱系。所有图与动态素材来自论文或作者公开项目；图注区分方法图、任务演示和实验结果。官方展示能帮助理解行为，但不能替代完整评测，也不能从机器人视频反推出模型内部的采样路径。</div>
<h2 id="timeline">时间线</h2>
<ul class="timeline">
<li><span class="yr">2023 · RSS　</span><b>Diffusion Policy</b>：条件去噪生成动作序列，再滚动执行。读它时区分“去噪时间”与“机器人执行时间”。</li>
<li><span class="yr">2024 · π0　</span><b>Physical Intelligence</b>：预训练VLM与独立动作专家通过注意力交互，用flow matching生成连续动作块；50Hz是动作点频率，不是每秒调用模型50次。</li>
<li><span class="yr">2025 · π0.5　</span>：异构数据共训练，结合FAST离散动作训练与连续动作专家，并联合学习高层语义子任务。</li>
<li><span class="yr">2025 · SmolVLA　</span><b>Hugging Face</b>：450M级模型、公开社区数据和异步执行栈；研究重点是资源、任务效果与控制时延的共同权衡。</li>
<li><span class="yr">2025 · π0.6 / π*0.6　</span>：先区分更强的基座与RECAP后训练。价值函数估计优势，优势标签条件化策略，自主经验与人工纠正共同进入训练。</li>
<li><span class="yr">2026 · π0.7　</span>：加入多样上下文、观测记忆和可选视觉子目标，研究通用策略如何复用异质数据、组合技能并接受语言指导。</li>
</ul>
<h2 id="compare">谱系对比表</h2>
<table>
<tr><th>模型</th><th>主要问题</th><th>动作生成</th><th>关键区别</th><th>研究入口</th></tr>
<tr><td><a href="./diffusion-policy.html">Diffusion Policy</a></td><td>多模态视觉动作分布</td><td>条件扩散 + 滚动视界</td><td>不含语言主干；CNN / Transformer两类实现</td><td><a href="https://github.com/real-stanford/diffusion_policy" target="_blank" rel="noopener">作者代码</a></td></tr>
<tr><td><a href="./pi0.html">π0</a></td><td>语义先验接入连续控制</td><td>Flow matching动作块</td><td>PaliGemma 3B + 约300M动作专家</td><td><a href="https://github.com/Physical-Intelligence/openpi" target="_blank" rel="noopener">openpi</a></td></tr>
<tr><td><a href="./pi05.html">π0.5</a></td><td>新家庭中的长程任务</td><td>高层子任务 + 连续动作</td><td>FAST / flow混合训练与异构共训</td><td><a href="https://arxiv.org/abs/2504.16054" target="_blank" rel="noopener">论文与公开实现</a></td></tr>
<tr><td><a href="./smolvla.html">SmolVLA</a></td><td>较低训练与部署成本</td><td>Flow matching，交错注意力</td><td>450M常用配置；可用异步推理栈</td><td><a href="https://huggingface.co/lerobot/smolvla_base" target="_blank" rel="noopener">公开权重</a></td></tr>
<tr><td><a href="./pistar06.html">π0.6 / π*0.6</a></td><td>更强基座 / 从部署经验改进</td><td>连续动作 + 优势条件化</td><td>Gemma3-4B系主干与约860M专家；星号指RECAP版本</td><td><a href="https://arxiv.org/abs/2511.14759" target="_blank" rel="noopener">论文与模型卡</a></td></tr>
<tr><td><a href="./pi07.html">π0.7</a></td><td>可转向的通用策略</td><td>多模态上下文条件化的flow matching</td><td>约5B动作策略；含MEM式记忆，世界模型另计</td><td><a href="https://www.pi.website/download/pi07.pdf" target="_blank" rel="noopener">论文与官方演示</a></td></tr>
</table>
<h2>四条研究主线</h2>
<ol>
<li><b>动作表示</b>：离散token、确定性回归、潜变量、扩散和flow是可比较的设计，不是严格的性能等级。比较时固定数据、动作空间、硬件与采样预算。</li>
<li><b>数据复用</b>：π0.5用不同监督目标连接异构样本；SmolVLA整理社区数据；RECAP给经验估计优势；π0.7显式描述行为质量与策略差异。这些机制并不自动让错误数据变成正确数据。</li>
<li><b>泛化</b>：新物体、新场景、新任务和新本体是不同测试。看清哪些组合未出现在训练中，是否提供子目标、语言教练或后续微调。</li>
<li><b>系统可靠性</b>：成功率、任务进度、吞吐、尾延迟和人工接管率各有含义。少步采样、异步调度和RL解决的瓶颈不同，需要分别消融。</li>
</ol>
<p>阅读建议：先看论文方法图，再播放旁边的官方演示，最后对照“研究者注记”列出准备改变的变量。素材与版本口径见 <a href="./credits.html">Credits</a>。</p>
`
},
{
  file: "diffusion-policy",
  short: "Diffusion Policy",
  kicker: "2023 · RSS · COLUMBIA & TRI",
  title: "Diffusion Policy：把动作生成变成去噪（精读）",
  prev: "index",
  next: "pi0",
  body: String.raw`
<p class="kicker">2023 · RSS · CHI ET AL.（COLUMBIA / TRI）</p>
<h1>Diffusion Policy 精读</h1>
<h2>1. 问题：同一观测，为什么不止一种正确动作？</h2>
<p>抓取、推动或绕行常有多条可行轨迹。<b>单个确定性MSE回归头</b>容易拟合条件均值，均值未必属于任何一条可行轨迹；这不是说所有行为克隆或所有回归模型都只能输出均值。Diffusion Policy学习观测条件下的动作分布，并一次生成未来一段动作。它仍是模仿学习：表达多模态，不等于自动解决分布偏移、失败恢复或安全控制。</p>
<h2>2. 方法精读</h2>
<h3>2.1 在动作空间中学习条件去噪</h3>
<p>令干净动作块为 $A^0$，观测特征为 $o$。常见噪声预测写法是 $A^k=\sqrt{\bar\alpha_k}A^0+\sqrt{1-\bar\alpha_k}\epsilon$，训练最小化 $\mathbb E\|\epsilon-\epsilon_\theta(A^k,k,o)\|^2$。推理从高斯噪声出发反向去噪，最后得到动作序列。这里的 $k$ 是<b>生成过程的噪声步</b>，不是机器人真实时间；视频中机械臂走出的曲线也不是这个高维去噪过程的投影。</p>
<p>网络输出与条件score存在参数化关系，可以用梯度场的视角理解；一般噪声预测网络不必显式来自一个可计算标量能量函数。DDPM与DDIM等采样器在随机性、步数与数值误差上不同，不能把所有扩散采样都叫必须走满训练步数的随机游走。</p>
${FIG("dp_policy_input_output.png", "<b>论文图 · 从观测条件到动作序列。</b> 对照输入、时间维与输出动作块阅读；CNN和Transformer是动作网络的两类结构，不是“视觉/状态输入”的硬分工。")}
<h3>2.2 预测视界、执行视界与重新观测</h3>
<p>先预测 $T_p$ 个动作，只执行 $T_a\le T_p$ 个，再采新观测重新生成。这就是receding horizon：动作块利用短期时间结构，重新观测提供反馈。还要区分观测历史长度 $T_o$，不要把它与执行步数混用。较长执行前缀节省调用，但反馈更旧；较短前缀响应更快，计算与块间衔接压力也更大。</p>
${VID("dp_receding_horizon.mp4", "<b>官方动态演示 · Push-T中的预测动作点与执行。</b> 重点观察彩色动作点、真实末端运动和下一次预测之间的关系；这不是本站绘制的去噪轨迹，也不是完整训练过程录像。")}
<h3>2.3 视觉条件与两种动作网络</h3>
<p>作者给出时序卷积U-Net与时序Transformer方案，分别用相应条件化结构接入观测。一次动作生成中的观测不变，可缓存视觉特征供多个去噪步使用。图像编码、空间特征提取、归一化、EMA与动作控制模式都会影响结果；减少去噪步数后，应重新测成功率和闭环时延，而不是只报告一次前向变快。</p>
<h2>3. 多模态的实证：不要把两种推动任务混在一起</h2>
<p><b>Push-T</b>是把T形块推到目标位姿；<b>Multimodal Block Pushing</b>使用不同的对象/目标组合检验多种行为模式。它们不是同一个基准。下面保留作者的对比图与官方仿真动画；这些分布与rollout比“画两条漂亮曲线”更接近论文的证据。</p>
${FIG("dp_multimodal_sim.png", "<b>作者项目图 · 多模态块推动的策略对比。</b> 阅读模式覆盖与单次rollout的一致性，不把平均轨迹当作实际执行轨迹。")}
${VID("dp_block_pushing.mp4", "<b>官方仿真动画 · Block Pushing。</b> 这是独立于真机Push-T的任务展示；展示片段不代表所有随机种子的成功率。")}
<h2>4. 结果与消融：先固定论文版本</h2>
<p>本页采用RSS 2023与官方项目页的口径：<b>12个任务、4类基准，作者报告平均相对改进46.9%</b>。这是相对既有方法的汇总比较，不是“提高46.9个百分点”，也不是任意任务的保证。后续IJRR版本扩展了实验，不应把不同版本的任务数、平均成功率和最优checkpoint混成同一结论。</p>
<h2>5. 局限与研究者注记</h2>
<blockquote>复现时先固定：动作是位置还是速度、观测/预测/执行视界、噪声调度、采样器和训练数据。若研究加速，报告采样步数—成功率—尾延迟曲线；若研究鲁棒性，单独设计扰动与恢复评测。DP本身不引入语言条件，也不能仅凭多模态表达能力推断长程规划或安全性。</blockquote>
<p><b>参考</b>：<a href="https://arxiv.org/abs/2303.04137v4" target="_blank" rel="noopener">RSS 2023论文版本</a> · <a href="https://diffusion-policy.cs.columbia.edu/" target="_blank" rel="noopener">官方项目与动态素材</a> · <a href="https://github.com/real-stanford/diffusion_policy" target="_blank" rel="noopener">作者实现</a>。</p>
`
},
{
  file: "pi0",
  short: "π0",
  kicker: "2024 · PHYSICAL INTELLIGENCE",
  title: "π0：VLM 主干 + Flow Matching 动作专家（精读）",
  prev: "diffusion-policy",
  next: "pi05",
  body: String.raw`
<p class="kicker">2024 · PHYSICAL INTELLIGENCE</p>
<h1>π0 精读</h1>
<h2>1. 问题：把语义先验接到连续动作</h2>
<p>π0研究的是：如何保留视觉语言预训练的知识，同时高效生成精细的连续动作块。原始OpenVLA等离散自回归方案有分桶和串行解码成本；这不代表自回归模型不能表达多模态，也不代表所有离散动作方法都不能输出chunk。π0选择<b>VLM权重 + 独立动作专家 + flow matching</b>，把视觉语义和连续动作分布放进一个有结构的注意力系统。</p>
<h2>2. 架构精读</h2>
<h3>2.1 两组权重，通过有掩码的注意力交互</h3>
<p>原始模型以约3B的PaliGemma为主干，配约300M动作专家。<b>图像/语言token走VLM权重，状态和带噪动作token走专家权重</b>；不同组通过attention接口交互，哪些token可见由mask决定，并非所有位置无条件双向可见。这种设计受Transfusion启发，但不是稀疏路由MoE的同义词，也不是简单在VLM最后接一个MLP。</p>
${FIG("pi0_overview.png", "<b>论文方法图 · π0的跨本体数据、视觉语言主干与动作专家。</b> 注意右侧动作专家的状态输入与噪声输入，以及视觉语言先验和机器人训练数据的来源区别。")}
<h3>2.2 Flow matching：训练配对直线，不等于推理轨迹必直</h3>
<p>沿原论文的时间方向，令噪声为 $\epsilon$、数据动作为 $A$，条件路径为 $A^\tau=(1-\tau)\epsilon+\tau A$，速度目标为 $A-\epsilon$。网络学习 $v_\theta(A^\tau,\tau,o)$，损失为 $\mathbb E\|v_\theta-(A-\epsilon)\|^2$。推理从 $\tau=0$ 的噪声积分到 $\tau=1$ 的动作，可用Euler更新 $A^{\tau+\Delta}=A^\tau+\Delta v_\theta(A^\tau,\tau,o)$。</p>
<p><b>直线说的是训练时选定的噪声—数据配对路径。</b> 学到的条件向量场仍随位置和时间变化，采样轨迹可以弯曲；生成空间中的路径也不是末端的物理运动路径。因此不再用“光点沿直线移动”来冒充π0推理。原论文采用偏向更噪时间段的采样分布；复现时还要核对代码是否用了相反的时间记号和相应积分符号。</p>
<h3>2.3 动作块与50Hz的正确含义</h3>
<p>原论文使用 $H=50$ 的动作块。若动作点以50Hz执行，它覆盖约1秒；这不意味着每次都开环执行满1秒，更不意味着模型推理为50Hz。重规划调用率、实际执行前缀和低层伺服频率应分别报告。RTC、重叠平均与异步调度是额外的执行设计，不能仅靠插值推导出闭环稳定。</p>
${VID("pi0_box_1x.mp4", "<b>官方视频 · 纸盒装配，源文件标为1×。</b> 观察连续动作和接触过程；这段演示不显示ODE内部采样，因此不能用它证明“积分沿直线”或测量模型调用频率。")}
<h2>3. 训练与数据</h2>
<p>本页采用论文v3口径：自采数据覆盖7种机器人构型、68项任务，并混合OXE数据；论文描述约10,000小时演示规模。官方博客采用的平台统计口径与论文并不完全相同，数字比较应先固定版本。<b>互联网视觉语言知识主要来自VLM初始化</b>，不要把π0的机器人训练阶段与π0.5显式混入web任务的共训配方混为一谈。</p>
${FIG("pi0_teaser.png", "<b>论文图 · 平台和任务示例。</b> 跨本体共享需要动作语义、单位、归一化和缺失维处理，不是单纯把向量补到同样长度。")}
<h2>4. 结果与消融</h2>
<p>阅读原论文VI节时分开看：预训练基座的直接任务表现、语言跟随、新技能微调，以及复杂多阶段任务。无VLM初始化的π0-small消融用于研究预训练先验的作用，但网络结构也有差别，不能解释成“参数越大必然更好”。同样，基座结果、任务后训练结果和后来的openpi基准checkpoint不可混用。</p>
<h2>5. 研究者注记</h2>
<blockquote>值得复用的是模块接口，而不是一个万能叙事：分别消融VLM先验、动作专家容量、生成步数与执行视界。Flow与diffusion可通过特定路径/参数化联系，不能按“直线/弯曲、确定/随机”普遍二分。实验记录里同时写动作Hz、调用延迟、重规划率与真实执行时间戳，才能定位加速到底改善了哪一层。</blockquote>
<p><b>参考</b>：<a href="https://arxiv.org/html/2410.24164v3" target="_blank" rel="noopener">π0论文v3（IV、V、附录B/D）</a> · <a href="https://www.pi.website/blog/pi0" target="_blank" rel="noopener">官方博客</a> · <a href="https://github.com/Physical-Intelligence/openpi" target="_blank" rel="noopener">openpi</a>。</p>
`
},
{
  file: "pi05",
  short: "π0.5",
  kicker: "2025 · PHYSICAL INTELLIGENCE",
  title: "π0.5：异构共训与开放世界泛化（精读）",
  prev: "pi0",
  next: "smolvla",
  body: String.raw`
<p class="kicker">2025 · PHYSICAL INTELLIGENCE</p>
<h1>π0.5 精读</h1>
<h2>1. 问题：换一个家庭，原来会的技能还能用吗？</h2>
<p>π0.5重点研究训练中未见家庭里的长程操作：任务需要的不仅是抓取动作，还包括识别物体用途、理解场景和选择下一子任务。这里的“开放世界泛化”有具体实验定义，不能直接翻译成任意陌生环境、任意新技能都能零样本成功。数据多样性、训练目标与高层决策共同构成方法，而不只是“把π0训练得更久”。</p>
<h2>2. 方法精读：异构数据与混合动作表示</h2>
<h3>2.1 不是每条样本都有完整动作标签</h3>
<p>配方连接跨机器人动作数据、不同环境的机器人数据、高层语义任务以及网络视觉语言任务。不同样本可监督不同输出：描述、检测/指代、语义子任务或低层动作。<b>没有机器人动作标签的web样本，不等于补一个零动作当监督</b>；需要在共同序列接口里明确每种样本的目标与loss mask。</p>
${PAIR("pi05_verbal.jpg", "pi05_subtask.jpg", "<b>官方训练样例 · 左：语言指令；右：语义子任务。</b> 它们说明条件与监督的形态，不证明每条训练样本同时具备所有模态。")}
${PAIR("pi05_detection.jpg", "pi05_web.jpg", "<b>官方训练样例 · 左：检测/指代；右：网络多模态任务。</b> 研究重点是如何共享表示，同时保留任务对应的监督边界。")}
<h3>2.2 FAST离散训练与连续动作专家</h3>
<p>原论文的重要设计是结合<b>FAST动作token预测</b>与<b>flow matching动作专家</b>。离散训练便于沿用token预测配方，连续专家用于较快地产生动作块；两种动作表示通过attention mask隔离，避免真值token向带噪动作分支泄漏。抽象地可写 $L=L_{\rm CE}+\alpha L_{\rm FM}$，但不能据此假定每个阶段、每种样本都同时计算两项。</p>
<p>论文IV节的分阶段方案先进行离散token预训练，再加入连续动作专家做后训练；具体公开checkpoint可能使用更新过的配方，复现应固定版本。<b>把π0.5只概括为“π0加web数据”会漏掉训练效率与动作表示这部分贡献。</b></p>
<h3>2.3 高层先选择子任务，低层再执行动作</h3>
<p>同一模型可先预测语义子任务 $\hat\ell_t$，再生成 $p(A_t\mid o_t,\ell,\hat\ell_t)$。例如总任务是清理厨房，当前子任务可能是拿起盘子。高层不是必须独立部署的另一个大模型，也不是先生成一串语言就自动获得长程规划保证；子任务更新频率、低层执行窗口和失败恢复仍需要设计。</p>
${VID("pi05_plate_1x.mp4", "<b>官方视频 · 擦干盘子并放上沥水架，源文件标为1×。</b> 观察抓取、工具使用和阶段衔接；该片是行为示例，完整泛化结论仍来自论文的未见家庭评测。")}
<h2>3. 结果与消融</h2>
<p>对照论文V节分别看新家庭任务进度、训练地点规模、各类共训数据消融与高层推理消融。地点更多与表现提高的曲线，不证明仅靠地点数量即可泛化；去掉web数据、跨本体数据或高层监督的效果也依任务而变。长程任务常用<b>部分进度评分</b>，其平均分不能直接写成整任务成功率。</p>
<h2>4. 训练与实现：最先核对的接口</h2>
<ul>
<li><b>动作归一化</b>：固定采用均值方差还是分位数、统计对应哪份数据；padding维与有效mask必须一致。</li>
<li><b>多模态监督</b>：记录FAST目标、高层子任务和连续专家分别在哪些样本/阶段启用，避免标签与attention泄漏。</li>
<li><b>部署协议</b>：写清高层是否自动产生、是否有人提供子任务、如何重新观测和判定失败。</li>
</ul>
<h2>5. 研究者注记</h2>
<blockquote>可研究的不是抽象的“更多数据”，而是迁移路径：哪类辅助任务改善哪种泛化？语义子任务带来的是语言理解、阶段切换还是更好的数据划分？用固定机器人数据和训练预算的消融拆开回答。相机视角、动作语义与监督模板都是接口条件，不应默认为跨数据集天然一致。</blockquote>
<p><b>参考</b>：<a href="https://arxiv.org/html/2504.16054v1" target="_blank" rel="noopener">π0.5论文v1（IV、V、附录）</a> · <a href="https://www.pi.website/blog/pi05" target="_blank" rel="noopener">官方博客与公开视频</a> · <a href="https://github.com/Physical-Intelligence/openpi" target="_blank" rel="noopener">公开实现</a>。</p>
`
},
{
  file: "smolvla",
  short: "SmolVLA",
  kicker: "2025 · HUGGING FACE",
  title: "SmolVLA：450M 的社区级 VLA（精读）",
  prev: "pi05",
  next: "pistar06",
  body: String.raw`
<p class="kicker">2025 · HUGGING FACE · LEROBOT 生态</p>
<h1>SmolVLA 精读</h1>
<h2>1. 问题：小模型能否支撑可复现的真机研究？</h2>
<p>SmolVLA同时考虑参数、公开数据和执行系统：以SmolVLM2为感知/语义主干，用flow matching专家产生动作，并在LeRobot中提供训练与异步执行。常用配置约450M。消费级设备可用是可复现性目标，不代表任意GPU、batch或相机数都能达到同一训练成本与控制率。</p>
<h2>2. 架构精读</h2>
<h3>2.1 VLM前缀与交错注意力动作专家</h3>
<p>图像、语言与投影后的机器人状态进入VLM前缀，动作专家以其特征为条件。专家交替使用读前缀的cross-attention和动作token间的causal self-attention，而不是把π0的注意力结构原样缩小。用 $A_t=(a_t,\ldots,a_{t+n-1})$ 表示n个动作，避免把两端都包含的下标误数成n+1；论文常用chunk配置为50步。</p>
${FIG("smolvla_arch.png", "<b>官方架构图 · 保留的VLM层与交错注意力专家。</b> 图中状态也参与前缀编码；cross-attention不是机器人每个控制步都重新跑一遍VLM的含义。")}
<h3>2.2 效率设计不是免费的性能保证</h3>
<p>模型保留VLM较早的部分层，并减少视觉token等开销。这是训练/模型配置上的截断，不是部署时可随意跳过任意已训练层。消融结果支持作者所测配置，但不能推广成“深度普遍冗余”或“跳层等同宽度缩减”。动作专家容量、状态放置和训练目标都有独立消融，比较时还应固定参数与训练预算。</p>
<h3>2.3 社区数据标准化的实际含义</h3>
<p>论文预训练采用481份社区数据集、约22.9K episodes和10.6M帧。工作包括清理任务标注、规范相机视角类别和数据接口；<b>视角类别规范不等于统一了所有机器人相机的内外参</b>。模拟基准的从VLM初始化实验、社区机器人预训练与真机任务微调，是需要区分的训练设置。</p>
<h2>3. 异步推理栈：等待发生在哪里？</h2>
<p>初始队列仍需等待第一块。之后按队列阈值请求新动作，在旧队列执行时并行推理；新块返回后，根据已经流逝的执行时间对齐、丢弃过期前缀并更新/聚合队列。不能把新块直接完整追加到末尾，否则动作可能对应旧观测。队列阈值太迟会耗尽，太早也可能增加无效推理；网络抖动和超时需要单独处理。</p>
${FIG("smolvla_async.png", "<b>论文时序图 · PolicyServer与RobotClient。</b> 依次看①初始请求，②执行若干动作后提交新观测，③返回时对齐并更新动作队列；不是“永不等待”的保证。")}
${VID("smolvla_official.mp4", "<b>官方四联动图 · 异步、同步、扰动与新物体。</b> 沿用官方对比内容，转为可暂停视频；各面板的任务/条件不完全相同，不能从这5秒循环独立估计泛化或加速比。")}
<h2>4. 结果：修正基准与列名，保留实验条件</h2>
<p>下表仅摘录<b>论文v1 Table 2的LIBERO</b>设置，列为Spatial / Object / Goal / Long。此处“机器人预训练”不是“是否异步”；SmolVLA这一组从VLM初始化，因此表中No也不意味着论文没有社区预训练模型。不同论文、后续checkpoint与异步真机实验不能拼成一个排行榜。</p>
<table>
<tr><th>LIBERO · 论文Table 2</th><th>机器人预训练</th><th>Spatial</th><th>Object</th><th>Goal</th><th>Long</th><th>平均(%)</th></tr>
<tr><td>π0 · VLM初始化</td><td>否</td><td>87</td><td>63</td><td>89</td><td>48</td><td>71.8</td></tr>
<tr><td>π0 · 机器人预训练</td><td>是</td><td>90</td><td>86</td><td>95</td><td>73</td><td>86.0</td></tr>
<tr><td>SmolVLA · 0.45B</td><td>否</td><td>90</td><td>96</td><td>92</td><td>71</td><td>87.3</td></tr>
</table>
<p>异步系统另见论文Figure 5：Pick-Place计时实验的平均完成用时为13.75s → 9.70s，减少约29.5%；固定时间实验平均完成方块数为1.8 → 3.8。三项真机任务的平均成功指标则为78.3 → 73.3。<b>更快不等于每项任务更准</b>，“约2×吞吐”也不是模型前向本身快了2×。</p>
<h2>5. 研究者注记</h2>
<blockquote>若研究运行时加速，至少同时记录模型耗时、观测年龄、队列长度、实际执行动作和任务结果。若研究小型化，分别消融VLM保留层、视觉token与专家宽度；若研究泛化，区分预训练与任务微调的数据。不要把“CPU能运行”与满足真机控制截止期划等号。</blockquote>
<p><b>参考</b>：<a href="https://arxiv.org/html/2506.01844v1" target="_blank" rel="noopener">SmolVLA论文v1（III、Table 2、Figure 5）</a> · <a href="https://huggingface.co/blog/smolvla" target="_blank" rel="noopener">官方博客</a> · <a href="https://github.com/huggingface/lerobot" target="_blank" rel="noopener">LeRobot实现</a>。</p>
`
},
{
  file: "pistar06",
  short: "π*0.6",
  kicker: "2025 · PHYSICAL INTELLIGENCE",
  title: "π0.6 与 π*0.6：基座、RECAP 与经验学习（精读）",
  prev: "smolvla",
  next: "pi07",
  body: String.raw`
<p class="kicker">2025 · PHYSICAL INTELLIGENCE · RL 后训练</p>
<h1>π0.6、π*0.6 与 RECAP 精读</h1>
<h2>1. 先分清基座与星号版本</h2>
<p><b>π0.6是基座，π*0.6是引入RECAP的版本</b>。模型卡描述：以Gemma3-4B初始化视觉语言主干，动作专家约860M，保留高层子任务与低层动作生成，并加入更丰富的条件。采用Knowledge Insulation训练时，动作专家的梯度不回传到主VLM；这与原π0的训练接口有区别。不能只把它理解为“π0.5改个版本号”或把星号等同更大的参数量。</p>
<p>复现入口先读模型卡，而不是从展示视频推断版本：它给出了动作专家、注意力与训练梯度路径。基座的预训练任务片段不等于RECAP后的全天运行记录。</p>
<h2>2. 问题：如何从自己遇到的错误中得到训练信号？</h2>
<p>策略偏差会改变后续观测分布，错误可能累积。专家接管能补恢复行为；自主rollout还能提供成功、失败与速度差异。困难在于如何使用这些不等质量的数据，而不只是无条件复制全部动作。模仿学习并非“永远不会修错”，RECAP的重点是把奖励反馈、价值估计与条件化训练组织成可扩展配方。</p>
${VID("pistar06_portafilter.mp4", "<b>官方失败案例 · 咖啡手柄操作。</b> 早期接触/抓取偏差可能在后续步骤暴露；视频说明诊断问题，不证明价值函数能唯一识别物理因果。")}
<h2>3. RECAP精读</h2>
<h3>3.1 用回报训练价值分布模型</h3>
<p>根据轨迹结果构造回报，训练一个多任务价值分布模型。论文把经验回报离散到201个bin，用交叉熵学习，再取期望恢复标量价值。它估计从当前处境到任务完成的前景与时间代价，<b>不是每个动作的真值正确标签，也不是反向扫描录像就能确定早期错误原因的因果模型</b>。</p>
<h3>3.2 从优势估计到输入条件</h3>
<p>用不折扣的n步形式示意：$\hat A_t=\sum_{j=0}^{N-1}r_{t+j}+V(o_{t+N})-V(o_t)$；终止时处理bootstrap。按任务阈值得到二值指示 $I_t=\mathbf1[\hat A_t>\epsilon_\ell]$，然后训练条件策略 $\pi_\theta(a_t\mid o_t,\ell,I_t)$，也保留无条件训练分支。推理时请求正优势条件；这是<b>优势条件化</b>，不是简单以优势给每条loss乘权重，也不等同PPO梯度更新。</p>
${FIG("pistar06_architecture.png", "<b>论文Fig. 3 · 独立价值模型与优势条件化VLA。</b> 对照二值标签、离散/连续训练目标及stop-gradient阅读；正条件能否带来改进仍依赖估计与数据覆盖。")}
<h3>3.3 离线预训练、任务微调与真机迭代</h3>
<p>流程是离线RL预训练 → 演示任务微调 → 部署并收集自主经验/专家接管 → 更新价值与策略，可重复迭代。论文把人工纠正按正优势处理，这是关于纠正质量的设计假设，不是所有人工接管天然最优。数据来源、奖励定义、优势阈值与条件dropout都有公开论文描述，不能再写成“论文完全没公开实现细节”；公开说明也不等于完整代码、数据与权重均已发布。</p>
${VID("pistar06_intervention.mp4", "<b>官方动态示例 · 专家实时接管与纠正。</b> 这属于遥操作纠正数据；与π0.7的语言教练不同，不应把两种人在环方式混为一谈。")}
<h2>4. 结果与边界</h2>
<p>论文在咖啡、衣物折叠与纸盒装配等任务比较成功率和吞吐；在部分困难任务上报告吞吐超过2×、失败率约减半，并展示长时间部署。论文描述一次约13小时的咖啡运行，短片并非该完整记录。应按具体任务、迭代轮次、人工反馈与统计协议阅读，不推广成“全天绝不失败”或已经证明部署安全。</p>
<h2>5. 研究者注记</h2>
<blockquote>做后训练研究时，先固定奖励/终止协议、价值校准与数据配比，再比较无条件模仿、只用人工纠正、优势条件化和其他RL提取方式。价值估计不准、正标签过稀或分布外动作都可能影响改进。应报告人工接管、场景复位与额外数据成本，而不仅是最终成功率。</blockquote>
<p><b>参考</b>：<a href="https://arxiv.org/html/2511.14759v2" target="_blank" rel="noopener">RECAP论文v2（IV、V、附录F）</a> · <a href="https://website.pi-asset.com/pi06star/PI06_model_card.pdf" target="_blank" rel="noopener">π0.6模型卡</a> · <a href="https://www.pi.website/blog/pistar06" target="_blank" rel="noopener">官方博客与演示</a>。</p>
`
},
{
  file: "pi07",
  short: "π0.7",
  kicker: "2026 · PHYSICAL INTELLIGENCE",
  title: "π0.7：可转向的通用主义模型（精读）",
  prev: "pistar06",
  next: "index",
  body: String.raw`
<p class="kicker">2026 · PHYSICAL INTELLIGENCE · STEERABLE GENERALIST</p>
<h1>π0.7 精读</h1>
<h2>1. 问题：不只描述“做什么”，还要说明“怎么做”</h2>
<p>π0.7把多样上下文作为利用异质数据的重要接口。训练数据来自多机器人、人类数据和自主经验，行为策略、质量与速度不同；直接混合可能产生冲突。提示显式说明任务、子任务和执行条件，有助于模型区分这些差异。<b>它不只是换了一段prompt</b>：论文同时描述了观测记忆、模型架构与训练数据配方，不能将所有收益单独归因于提示工程。</p>
<h2>2. 方法精读：策略、记忆与外部子目标</h2>
<h3>2.1 约5B动作策略与MEM式历史编码</h3>
<p>论文Fig. 2给出Gemma3-4B初始化的VLM、约860M动作专家，以及对历史观察做时空压缩的MEM式编码器，动作策略总量约5B。历史与当前观察帮助处理部分可观测性。高层语义策略输出下一子任务；可选的世界模型生成多视角子目标。<b>世界模型是另一个模块，不包含在约5B动作策略的参数口径里</b>；图中BAGEL来源模型标为14B，不宜不加解释地称作“一个很小的模型”。</p>
${FIG("pi07_architecture.png", "<b>论文Fig. 2原图 · 看清三个角色。</b> 上方是带记忆的动作策略；左下是高层语义策略或人类指令；右下是独立世界模型。视觉子目标是条件，不是已经验证可达、安全的动作计划。")}
<h3>2.2 多样上下文的四类信息</h3>
<ul>
<li><b>语言与子任务</b>：总目标之外说明当前步骤、策略或细粒度要求。</li>
<li><b>视觉子目标</b>：多视角近未来场景，为空间关系和操作结果补充视觉条件。</li>
<li><b>episode元数据</b>：描述质量、长度/速度等差异，让次优经验有可区分的条件。它不是自动消除坏数据影响的“消毒剂”。</li>
<li><b>控制模态</b>：标明关节或末端等控制接口，避免不同动作语义在训练中被误当成同一种量。</li>
</ul>
<p>训练会随机省略部分条件，使模型可以接受不同组合；这不意味着所有未知条件或错误子目标都能可靠处理。世界模型生成视觉条件，与动作策略执行后的真实观察更新，仍构成有误差的闭环。</p>
${PAIR("pi07_current_1.png", "pi07_subgoal_1.png", "<b>官方博客样例 · 当前观察（左）与视觉子目标（右）。</b> 子目标描述希望看到的状态，不应把两帧差直接当成机器人可执行轨迹。")}
${PAIR("pi07_current_3.png", "pi07_subgoal_3.png", "<b>另一组官方视觉条件样例。</b> 对照物体/手部空间关系阅读；单组图片不证明可达性或覆盖全部相机。")}
<h2>3. 数据与组合：怎样复用专家经验？</h2>
<p>作者把RECAP专家产生的经验连同策略/质量等元数据纳入通用训练，并结合更广的机器人与非机器人数据。模型学习在指定条件下生成动作，而不是对所有不同质量行为无条件求平均。数据多样性和条件化的作用需要通过消融区分；“可以使用次优数据”不等于无需清洗、评测或标注。</p>
<h2>4. 三类实验，三种“零样本”边界</h2>
<h3>4.1 已学任务上的通用模型与专家比较</h3>
<p>在作者所测的折衣、咖啡与装盒任务上，单个π0.7与相应RECAP特化策略达到相近的成功率和吞吐，部分任务更高。这说明该组任务上的经验能够整合，不是“任意任务通用模型都优于专家”，也不是所有任务都未见过训练数据。</p>
<h3>4.2 语言教练与之后的自主执行</h3>
<p>未见的长程任务不一定只给一句话就完成。空气炸锅示例包含零样本尝试、实时语言指导，以及使用指导轨迹中的子任务序列训练高层策略的后续实验。<b>实时教练不是完全自主，教练后训练也不是零额外数据</b>；作者强调的是不需要为这些新任务再收集低层遥操作动作。要区分人的语言反馈与RECAP的遥操作接管。</p>
${VID("pi07_coaching.mp4", "<b>官方视频 · 粗粒度语言教练。</b> 画面包含人类指令；这不是自动生成子目标的可视化，也不是无人干预的演示。视频自带1×标识，本站不再加速。")}
<h3>4.3 未见“本体×任务”组合的折叠迁移</h3>
<p>双臂UR5e实验没有该本体的衬衫折叠训练数据，但不表示模型从未见过UR5e或衣物折叠。论文报告π0.7成功率80%，对比首次在该平台折叠的人类专家约80.6%；还需结合试验协议与任务进度理解，不能等同普遍达到人类水平。下面采用官方带子目标叠加的片段，明确其条件设置。</p>
${VID("pi07_transfer_official.mp4", "<b>官方动态演示 · 双臂UR5e衬衫折叠与子目标叠加。</b> 零样本针对未见的本体—任务组合；子目标是方法提供的辅助条件，视频不是所有任务/所有本体的性能证明。")}
<h2>5. 研究者注记</h2>
<blockquote>可分别研究记忆、语义子任务、视觉子目标和质量条件。测试时固定是否允许语言教练、是否调用世界模型以及数据包含哪些本体—任务组合；成本比较要把外部模型的计算也计入。核心开放问题包括条件错误、子目标不可达、历史压缩丢失接触信息，以及低质量数据标注失准后的闭环表现。</blockquote>
<p><b>参考</b>：<a href="https://www.pi.website/download/pi07.pdf" target="_blank" rel="noopener">π0.7论文（Fig. 2、实验与附录）</a> · <a href="https://www.pi.website/blog/pi07" target="_blank" rel="noopener">官方博客，2026-04-16</a>。</p>
`
},
{
  file: "credits",
  short: "Credits",
  title: "Credits 与版权说明",
  body: String.raw`
<p class="kicker">ASSETS & LICENSES</p>
<h1>Credits</h1>
<p>本站文字为原创研究笔记。下列图片、动图和视频来自论文或作者公开项目，不把素材中的实验当作本站测量，也不把自绘轨迹冒充真实模型行为。<b>本次保留原有Claude风格，仅修改媒体与讲解内容</b>；论文图中的字体、颜色与标注保持原貌。</p>
<p>每个视频使用本地文件与原生播放控件，默认暂停；poster来自对应片段，不用其他模型的画面占位。官方GIF仅转码以支持暂停和拖动，不改播放速度。源文件已有的加速、拼接和条件以作者说明为准。</p>
<p>进阶长文就近重引已列出的架构/方法图，仍使用原文件和出处，不是新生成的模型示意图。教学推导、数值算例、统计区间与课题建议均不冒充论文新增实验或本站完成的真机测量。</p>
<table>
<tr><th>素材</th><th>原始出处</th><th>处理与归属</th></tr>
${creditRows}
</table>
<p>机器可读的来源、文件校验值与处理记录见 <a href="https://github.com/JaleWang-BUPT/vla-models-explained/blob/main/media-provenance.json" target="_blank" rel="noopener">media-provenance.json</a>。早期图片副本未保存原始下载地址时，标明对应论文/博客，不补造精确下载记录。</p>
<p>代码与本站原创文字使用MIT许可；引用媒体的版权归各自权利人，仓库代码许可证不自动覆盖这些媒体。若需移除某项引用，请在GitHub提交issue。</p>
`
}
].map(withResearchNotes);
