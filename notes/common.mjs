import { media } from '../media.mjs';

export const a = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
export const sources = {
  dp: 'https://arxiv.org/html/2303.04137v4',
  pi0: 'https://arxiv.org/html/2410.24164v3',
  pi05: 'https://arxiv.org/html/2504.16054v1',
  smol: 'https://arxiv.org/html/2506.01844v1',
  recap: 'https://arxiv.org/html/2511.14759v2',
  pi07: 'https://www.pi.website/download/pi07.pdf',
  ddpm: 'https://arxiv.org/html/2006.11239v2',
  ddim: 'https://arxiv.org/html/2010.02502v4',
  flow: 'https://arxiv.org/abs/2210.02747',
  fast: 'https://www.pi.website/research/fast',
  ki: 'https://www.pi.website/download/pi05_KI.pdf',
  statistics: 'https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm'
};
const dpRoot = 'https://github.com/real-stanford/diffusion_policy/blob/5ba07ac6661db573af695b419a7947ecb704690f/';
const piRoot = 'https://github.com/Physical-Intelligence/openpi/blob/215abfb217dbac7d5f1273282331b9b1866c0479/';
const smolRoot = 'https://github.com/huggingface/lerobot/blob/9f45b7b37cc4b33f8ecdb503aa4d209370bd528d/';
export const code = {
  dpUnet: dpRoot + 'diffusion_policy/model/diffusion/conditional_unet1d.py',
  dpPolicy: dpRoot + 'diffusion_policy/policy/diffusion_unet_hybrid_image_policy.py',
  piModel: piRoot + 'src/openpi/models/pi0.py',
  piTransforms: piRoot + 'src/openpi/transforms.py',
  smolModel: smolRoot + 'src/lerobot/policies/smolvla/modeling_smolvla.py'
};
const escape = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
export function figure(file, caption) {
  const item = media[file];
  if (!item || !file.match(/\.(png|jpg|webp)$/)) throw new Error(`Unknown paper figure: ${file}`);
  return `<figure><img src="./assets/${file}" alt="${escape(item.alt)}" loading="lazy" decoding="async"><figcaption><b>原图回看。</b> ${caption}<br>来源：${a(item.source, item.label)} · © ${item.owner}。沿用原文件，未重绘。</figcaption></figure>`;
}
