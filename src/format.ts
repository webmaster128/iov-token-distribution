import { Decimal } from "./decimal";

export type Amount =
  | string
  | { readonly whole?: number; readonly fractional?: number; readonly ticker: string };

export interface Wallet {
  readonly "//id"?: string;
  readonly "//name"?: string;
  readonly address: string;
  readonly coins: readonly Amount[];
}

export interface Escrow {
  readonly "//name": string;
  readonly arbiter: string;
  readonly destination: string;
  readonly source: string;
  readonly timeout: string;
  readonly amount: readonly Amount[];
}

export interface Genesis {
  readonly app_state: {
    readonly cash: readonly Wallet[];
    readonly escrow: readonly Escrow[];
  };
}

export function parseIov(input: Amount): Decimal {
  if (typeof input === "string") {
    const match = input.match(/^([0-9.]+) IOV$/);
    if (!match) throw new Error("Got unexpected amount format");
    return Decimal.fromUserInput(match[1], 9);
  } else {
    const whole = input.whole || 0;
    const fractional = input.fractional || 0;
    return Decimal.fromUserInput(`${whole}.${fractional.toFixed(0).padStart(9, "0")}`, 9);
  }
}
