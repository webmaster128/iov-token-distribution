import { Decimal } from "@iov/encoding";

export function add(a: Decimal, b: Decimal): Decimal {
  const abi = BigInt(a.atomics);
  const bbi = BigInt(b.atomics);
  return Decimal.fromAtomics((abi + bbi).toString(10), 9);
}

export function numericApproximation(decimal: Decimal): number {
  const out = Number(decimal.toString());
  if (Number.isNaN(out)) throw new Error("Conversion to number failed");
  return out;
}

export function relative(nominator: Decimal, denominator: Decimal): string {
  const rel = numericApproximation(nominator) / numericApproximation(denominator);
  return `${(rel * 100).toFixed(3)}%`;
}
