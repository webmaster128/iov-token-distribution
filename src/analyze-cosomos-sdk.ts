import fs from "fs";

import { printlnStdout } from "./print";

async function getFile(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function(err: any, data: any) {
      if (err) reject(err);
      else resolve(JSON.parse(data.toString()));
    });
  });
}

async function main(): Promise<void> {
  const doc = await getFile("files/genesis_mainnet-2.json");

  const accounts = doc.app_state.auth.accounts;
  printlnStdout(`Accounts: ${accounts.length}`);

  let sum = BigInt(0);

  for (const account of accounts) {
    const coins = account.value.coins;
    if (coins.length !== 1) throw new Error(`Unexpected number of coins: ${coins.length}`);
    const { amount, denom } = coins[0];
    if (denom !== "uiov") throw new Error(`Unexpected denom: ${denom}`);
    sum += BigInt(amount);
  }

  printlnStdout(`Total: ${sum}uiov (${sum / BigInt(1000000)} IOV)`);
}

main();
