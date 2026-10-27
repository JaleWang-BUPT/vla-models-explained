# VLA 模型图解 · From Diffusion Policy to π0.7

✳ **在线阅读**：[https://jalewang-bupt.github.io/vla-models-explained/](https://jalewang-bupt.github.io/vla-models-explained/)

一份面向研究者的中文图解笔记，沿“动作怎么生成、数据怎么用、泛化从哪来”三条线拆解六个代表性 VLA 模型：

| 页面 | 模型 | 一句话 |
|---|---|---|
| [Diffusion Policy](https://jalewang-bupt.github.io/vla-models-explained/diffusion-policy) | 2023 · RSS | 把动作生成变成去噪，多模态动作分布第一次在真机立住 |
| [π0](https://jalewang-bupt.github.io/vla-models-explained/pi0) | 2024 · PI | VLM 主干 + flow matching 动作专家，50Hz 灵巧操作 |
| [π0.5](https://jalewang-bupt.github.io/vla-models-explained/pi05) | 2025 · PI | 异构数据共训，泛化到没见过的家庭 |
| [SmolVLA](https://jalewang-bupt.github.io/vla-models-explained/smolvla) | 2025 · HF | 450M、消费级 GPU 可训，异步推理教科书 |
| [π*0.6](https://jalewang-bupt.github.io/vla-models-explained/pistar06) | 2025 · PI | RECAP：演示+纠正+自主经验，RL 磨到全天可靠 |
| [π0.7](https://jalewang-bupt.github.io/vla-models-explained/pi07) | 2026 · PI | 多样化上下文条件，提示里给“怎么做”，开箱即专家 |

每页固定结构：**问题 → 方法 → 关键设计 → 结果 → 研究者注记**。

## 素材说明

- **论文图 / 官方图 / 官方视频**：来自各论文（arXiv HTML 版）与官方博客/项目页，逐条在图注与 [Credits](https://jalewang-bupt.github.io/vla-models-explained/credits) 中署名，版权归原作者；仅作研究性引用，侵权即删。
- **机制动画（✳）**：本站自制的纯 SVG/SMIL 动画（去噪、直线流、异步推理、共训、RECAP 循环、条件转向），零 JS、零依赖，可自由复用。

## 本地构建

```bash
node build.mjs   # content.mjs → docs/
# 预览：任意静态服务器指向 docs/
```

要求 Node ≥ 18，无任何第三方依赖。

## 许可

代码与文字：MIT。引用的论文图与官方媒体：版权归各自作者（见 Credits）。
