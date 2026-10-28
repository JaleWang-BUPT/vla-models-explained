# VLA 模型图解 · From Diffusion Policy to π0.7

✳ **在线阅读**：[https://jalewang-bupt.github.io/vla-models-explained/](https://jalewang-bupt.github.io/vla-models-explained/)

一份面向研究者的中文图解笔记，沿“动作怎么生成、数据怎么用、泛化从哪来、可靠性怎么验证”四条线阅读六个方法章节。Diffusion Policy 是基础视觉运动策略，不含原生语言条件；π0.6 与 π*0.6 在同页区分讲解。保留原有 Claude 风格，只修订媒体和方法表述。

| 页面 | 模型 | 一句话 |
|---|---|---|
| [Diffusion Policy](https://jalewang-bupt.github.io/vla-models-explained/diffusion-policy.html) | 2023 · RSS | 条件去噪、多模态动作与滚动视界 |
| [π0](https://jalewang-bupt.github.io/vla-models-explained/pi0.html) | 2024 · PI | VLM 与 flow matching 专家；区分动作频率和调用频率 |
| [π0.5](https://jalewang-bupt.github.io/vla-models-explained/pi05.html) | 2025 · PI | 异构共训、FAST/连续动作训练与语义子任务 |
| [SmolVLA](https://jalewang-bupt.github.io/vla-models-explained/smolvla.html) | 2025 · HF | 450M配置、社区数据与可对齐的异步执行队列 |
| [π0.6 / π*0.6](https://jalewang-bupt.github.io/vla-models-explained/pistar06.html) | 2025 · PI | 基座、价值估计与 RECAP 优势条件化 |
| [π0.7](https://jalewang-bupt.github.io/vla-models-explained/pi07.html) | 2026 · PI | 观测记忆、多样上下文、独立世界模型与组合泛化边界 |

每页固定结构：**问题 → 方法 → 关键设计 → 结果 → 研究者注记**。

## 素材说明

- **16张论文/项目图、9段官方动态素材**：逐条在图注与 [Credits](https://jalewang-bupt.github.io/vla-models-explained/credits.html) 中链接来源。替换了可能误导的自绘运动路径，不把物理演示冒充模型内部采样。
- **原生视频控件**：可暂停、拖动与全屏，默认不自动播放。SmolVLA官方GIF等时长转码以提供播放控制；海报帧来自对应视频。论文图保持原样，π0.7架构图从原PDF裁取，未重绘。
- **可追溯记录**：[media-provenance.json](media-provenance.json) 保存URL、SHA-256和处理说明。早期沿用图片未记录的精确下载URL不补造；公开项目许可证不自动给第三方媒体重新授权。

## 本地构建

```bash
node build.mjs   # content.mjs → docs/
node --test tests/site.test.mjs  # 来源、素材、页面链接与原样式校验
# 预览：任意静态服务器指向 docs/
```

要求 Node ≥ 18，无任何第三方依赖。

## 许可

代码与本站原创文字：MIT。引用的论文图与官方媒体：版权归各自权利人（见 Credits），不在本站MIT授权范围内。
