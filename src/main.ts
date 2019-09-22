/* eslint-disable no-console */
import fs from "fs";

import { Decimal } from "./decimal";
import { relative } from "./math";

type Amount = string | { whole?: number; fractional?: number; ticker: string };

interface Wallet {
  readonly address: string;
  readonly coins: readonly Amount[];
}

interface Escrow {
  readonly "//name": string;
  readonly arbiter: string;
  readonly destination: string;
  readonly source: string;
  readonly timeout: string;
  readonly amount: readonly Amount[];
}

interface Genesis {
  readonly app_state: {
    readonly cash: readonly Wallet[];
    readonly escrow: readonly Escrow[];
  };
}

async function getFile(path: string): Promise<Genesis> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function(err: any, data: any) {
      if (err) reject(err);
      else resolve(JSON.parse(data.toString()));
    });
  });
}

function parseIov(input: Amount): Decimal {
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

async function main(args: readonly string[]): Promise<void> {
  const doc = await getFile(args[0]);

  const wallets = doc.app_state.cash;
  console.log("Wallets:", wallets.length);
  const escrows = doc.app_state.escrow;
  console.log("Escrows:", escrows.length);

  const coinsFromWallets = wallets.map(wallet => {
    if (wallet.coins.length !== 1) throw new Error("Unexpected number of coins in wallet");
    return parseIov(wallet.coins[0]);
  });

  const coinsFromEscrows = escrows.map(escrow => {
    if (escrow.amount.length !== 1) throw new Error("Unexpected number of amounts in escrow");
    return parseIov(escrow.amount[0]);
  });

  const allCoins = [...coinsFromWallets, ...coinsFromEscrows];

  const total = allCoins.reduce((current, added) => {
    return current.plus(added);
  }, Decimal.fromAtomics("0", 9));
  console.log("Total supply", total.toString());

  for (const wallet of wallets) {
    if (wallet.coins.length !== 1) throw new Error("Unexpected number of coins in wallet");
    // console.log(wallet.coins[0]);
    const iovCoins = parseIov(wallet.coins[0]);
    const part = relative(iovCoins, total);
    console.log("wallet", wallet.address, iovCoins.toString(), part);
  }

  for (const escrow of escrows) {
    if (escrow.amount.length !== 1) throw new Error("Unexpected number of coins in wallet");
    // console.log(wallet.coins[0]);
    const iovCoins = parseIov(escrow.amount[0]);
    const part = relative(iovCoins, total);
    console.log("escrow", escrow.source, iovCoins.toString(), part);
  }
}

main(process.argv.slice(2)).then(
  () => process.exit(0),
  error => {
    console.error(error);
    process.exit(1);
  },
);
