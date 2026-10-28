import { diffusionAdvanced } from './notes/diffusion.mjs';
import { pi0Advanced } from './notes/pi0.mjs';
import { pi05Advanced } from './notes/pi05.mjs';
import { smolAdvanced } from './notes/smolvla.mjs';
import { recapAdvanced } from './notes/recap.mjs';
import { pi07Advanced } from './notes/pi07.mjs';

export const advancedSections = {
  'diffusion-policy': diffusionAdvanced,
  pi0: pi0Advanced,
  pi05: pi05Advanced,
  smolvla: smolAdvanced,
  pistar06: recapAdvanced,
  pi07: pi07Advanced
};

export const advancedIntro = '<div class="note">进阶推导与研究实践（11–20节）：继续展开生成数学、数据与代码契约、失败诊断和可复现实验。通用推导、教学数值、研究方案与论文报告分别标明；没有在本站执行新的模型训练或真机实验。此处重引原论文/官方图以方便就近对照，不重绘素材。</div>';

export const advancedGuide = String.raw`
<h2 id="research-agenda">从精读到课题：六份可以继续执行的研究方案</h2>
<p>每篇第11–19节展开方法细节，第20节把它们收束成带假设、对照、指标、预算与交付物的课题。以下是待验证路线，不是本站已获得的新实验结论；先选择一个明确问题，不必同时实现整个谱系。</p>
<table>
<tr><th>研究入口</th><th>要隔离的问题</th><th>优先交付</th></tr>
<tr><td><a href="./diffusion-policy.html#dp-project-brief">DP：采样与视界</a></td><td>生成误差与陈旧反馈如何共同影响闭环</td><td>固定checkpoint、双因素配置、完整时延/任务曲线</td></tr>
<tr><td><a href="./pi0.html#pi0-project-brief">π0：少步与语义</a></td><td>少步采样损伤的是条件选择还是动作精度</td><td>分层指令、错误类型和积分/执行日志</td></tr>
<tr><td><a href="./pi05.html#pi05-project-brief">π0.5：知识迁移</a></td><td>辅助数据改善语义、阶段选择还是低层执行</td><td>有效监督账本、来源配比和对象/场景留出</td></tr>
<tr><td><a href="./smolvla.html#smol-project-brief">SmolVLA：异步归因</a></td><td>重叠计算与增加反馈分别贡献多少</td><td>匹配调用预算、请求时间线和异常队列审计</td></tr>
<tr><td><a href="./pistar06.html#recap-project-brief">RECAP：标签信息</a></td><td>真实优势估计比额外条件或新数据多带来什么</td><td>可复算标签、共享数据BC与受控标签对照</td></tr>
<tr><td><a href="./pi07.html#pi07-project-brief">π0.7：上下文分工</a></td><td>记忆、子目标与高层指导的贡献和交互</td><td>条件组合审计、泛化矩阵与全系统成本</td></tr>
</table>
<h3>开始训练前先完成四张清单</h3>
<ol>
<li><b>版本清单：</b> 论文版本、代码提交、checkpoint、数据与归一化统计的来源。</li>
<li><b>接口清单：</b> 图像/状态/动作的字段、时间、单位、mask、坐标与有效维；确认示范可往返还原。</li>
<li><b>评测清单：</b> 测试留出的是什么，允许哪些人类/外部模型条件，如何选择checkpoint与计算分母。</li>
<li><b>成本清单：</b> 训练和部署计算、额外数据、人工纠正/复位；把诊断oracle与真实部署分开。</li>
</ol>
<p>目前每篇20节：1–5节问题与证据，6–10节机制与接口，11–20节推导、代码阅读、诊断与课题。长文中的公式与算例有自动算术检查；这类检查不等于模型性能复现或真机安全验证。</p>
`;
