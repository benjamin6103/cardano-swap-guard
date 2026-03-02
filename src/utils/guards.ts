type GuardPolicy = {
  maxSlippage: number;
  minOutputLovelace: number;
  priceDeviationLimit: number;
  liquidityDepthThreshold: number;
};

type GuardInputs = {
  inputAmount: number;
  expectedOutput: number;
  currentPrice: number;
  avgPrice: number;
  liquidityDepth: number;
  slippage: number;
};

type GuardResult = {
  safe: boolean;
  reasons: string[];
};

const defaultPolicy: GuardPolicy = {
  maxSlippage: 1,
  minOutputLovelace: 1_000_000,
  priceDeviationLimit: 2,
  liquidityDepthThreshold: 100_000_000,
};

export const checkGuard = (
  inputs: GuardInputs,
  policy: GuardPolicy = defaultPolicy
): GuardResult => {
  const { expectedOutput, currentPrice, avgPrice, liquidityDepth, slippage } = inputs;
  const reasons: string[] = [];

  const deviation =
    avgPrice > 0 ? Math.abs(((currentPrice - avgPrice) / avgPrice) * 100) : 0;

  if (deviation > policy.priceDeviationLimit) {
    reasons.push(
      `Deviation ${deviation.toFixed(2)}% exceeds limit of ${
        policy.priceDeviationLimit
      }%.`
    );
  }

  if (slippage > policy.maxSlippage) {
    reasons.push(
      `Slippage ${slippage.toFixed(2)}% exceeds limit of ${policy.maxSlippage}%.`
    );
  }

  if (expectedOutput * 1_000_000 < policy.minOutputLovelace) {
    reasons.push('Expected output is below configured minimum.');
  }

  if (liquidityDepth < policy.liquidityDepthThreshold) {
    reasons.push('Liquidity depth is below safety threshold.');
  }

  if (reasons.length === 0) {
    reasons.push('All guard checks passed.');
  }

  return { safe: reasons.length === 1 && reasons[0].startsWith('All guard'), reasons };
};