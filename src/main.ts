import fs from "fs";

import { Genesis, parseIov } from "./format";
import { relative, supplyInContainerss } from "./math";
import { printlnStderr, printlnStdout } from "./print";

async function getFile(path: string): Promise<Genesis> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function(err: any, data: any) {
      if (err) reject(err);
      else resolve(JSON.parse(data.toString()));
    });
  });
}

async function main(args: readonly string[]): Promise<void> {
  const doc = await getFile(args[0]);

  const wallets = doc.app_state.cash;
  printlnStderr(`Wallets: ${wallets.length}`);
  const escrows = doc.app_state.escrow;
  printlnStderr(`Escrows: ${escrows.length}`);

  const filteredWallets = wallets.filter(
    wallet => wallet["//name"] !== "IOV SAS pending deals pocket; close deal or burn",
  );
  const filteredEscrows = escrows.filter(escrow => escrow["//name"] !== "guarantee fund");

  const supply = {
    inWallets: supplyInContainerss([...wallets]),
    inEscrows: supplyInContainerss([...escrows]),
    subtotal: supplyInContainerss([...filteredWallets, ...filteredEscrows]),
    total: supplyInContainerss([...wallets, ...escrows]),
  };

  printlnStderr(`Supply in wallets: ${supply.inWallets.toString()}`);
  printlnStderr(`Supply in escrows: ${supply.inEscrows.toString()}`);
  printlnStderr(`Subtotal supply: ${supply.subtotal.toString()}`);
  printlnStderr(`Total supply: ${supply.total.toString()}`);

  for (const wallet of wallets) {
    if (wallet.coins.length !== 1) throw new Error("Unexpected number of coins in wallet");
    // console.log(wallet.coins[0]);
    const iovCoins = parseIov(wallet.coins[0]);
    const part = relative(iovCoins, supply.subtotal);
    printlnStdout(`wallet;${wallet.address};${iovCoins.toString()};${part};`);
  }

  for (const escrow of escrows) {
    if (escrow.amount.length !== 1) throw new Error("Unexpected number of coins in wallet");
    // console.log(wallet.coins[0]);
    const iovCoins = parseIov(escrow.amount[0]);
    const part = relative(iovCoins, supply.subtotal);
    printlnStdout(`escrow;${escrow.source} -> ${escrow.destination};${iovCoins.toString()};${part};`);
  }
}

main(process.argv.slice(2)).then(
  () => process.exit(0),
  error => {
    console.error(error);
    process.exit(1);
  },
);
