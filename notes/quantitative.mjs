// Small, deterministic teaching checks. Not robot control or model benchmarks.
export function scoreAmplification(alphaBar) {
  if (!Number.isFinite(alphaBar) || !(alphaBar > 0 && alphaBar < 1)) throw new RangeError('alphaBar must be in (0, 1)');
  return Math.sqrt((1 - alphaBar) / alphaBar);
}
export function ddimDeterministic(noisy, epsilon, alphaNow, alphaNext) {
  if (![noisy, epsilon, alphaNow, alphaNext].every(Number.isFinite) || !(alphaNow > 0 && alphaNow <= alphaNext && alphaNext <= 1)) throw new RangeError('invalid reverse-time alpha pair');
  const clean = (noisy - Math.sqrt(1 - alphaNow) * epsilon) / Math.sqrt(alphaNow);
  return { clean, next: Math.sqrt(alphaNext) * clean + Math.sqrt(1 - alphaNext) * epsilon };
}
export function wilsonInterval(successes, count, z = 1.96) {
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(successes) || successes < 0 || successes > count || !Number.isFinite(z) || !(z > 0)) throw new RangeError('invalid binomial sample');
  const p = successes / count;
  const denominator = 1 + z * z / count;
  const center = (p + z * z / (2 * count)) / denominator;
  const half = z * Math.sqrt(p * (1 - p) / count + z * z / (4 * count * count)) / denominator;
  return { lower: Math.max(0, center - half), upper: Math.min(1, center + half) };
}
export function orthonormalDct(values) {
  const n = values.length;
  if (!n || values.some(value => !Number.isFinite(value))) throw new RangeError('finite nonempty sequence required');
  return values.map((_, k) => {
    const scale = Math.sqrt((k === 0 ? 1 : 2) / n);
    return scale * values.reduce((total, value, j) => total + value * Math.cos(Math.PI * (j + 0.5) * k / n), 0);
  });
}
export function zeroFailureUpper(count, alpha = 0.05) {
  if (!Number.isInteger(count) || count < 1 || !Number.isFinite(alpha) || !(alpha > 0 && alpha < 1)) throw new RangeError('invalid count/confidence');
  return 1 - alpha ** (1 / count);
}
export function positiveFraction(values, threshold) {
  if (!values.length || !Number.isFinite(threshold) || values.some(value => !Number.isFinite(value))) throw new RangeError('finite nonempty advantages required');
  return values.filter(value => value > threshold).length / values.length;
}
export function cacheBudget(encodeMs, expertMs, steps, ioMs) {
  if (![encodeMs, expertMs, ioMs].every(value => Number.isFinite(value) && value >= 0) || !Number.isInteger(steps) || steps < 1) throw new RangeError('invalid timing budget');
  return { cached: encodeMs + steps * expertMs + ioMs, repeated: steps * (encodeMs + expertMs) + ioMs };
}
