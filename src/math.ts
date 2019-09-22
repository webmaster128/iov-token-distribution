import { Decimal } from "./decimal";

export function relative(nominator: Decimal, denominator: Decimal): string {
  const rel = nominator.toFloatApproximation() / denominator.toFloatApproximation();
  return `${(rel * 100).toFixed(3)}%`;
}
