import { Decimal } from "@cosmjs/math";
import fs from "fs";

import { Escrow, Genesis, parseIov, Wallet } from "./format";
import { percentage, relative, supplyInContainerss } from "./math";
import { printlnStderr, printlnStdout } from "./print";

async function getFile(path: string): Promise<Genesis> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, function(err: any, data: any) {
      if (err) reject(err);
      else resolve(JSON.parse(data.toString()));
    });
  });
}

function printCsvRow(
  type: string,
  section: "regular" | "extra",
  beneficiary: string,
  coins: Decimal,
  relativeToSubtotal: string,
  notes: string,
): void {
  printlnStdout(`${type};${section};${beneficiary};${coins.toString()};${relativeToSubtotal};"${notes}";`);
}

function isExtraWallet(wallet: Wallet): boolean {
  return wallet["//name"] === "IOV SAS pending deals pocket; close deal or burn";
}

function isExtraEscrow(escrow: Escrow): boolean {
  return escrow["//name"] === "guarantee fund";
}

async function main(args: readonly string[]): Promise<void> {
  const doc = await getFile(args[0]);

  const wallets = doc.app_state.cash;
  printlnStderr(`Wallets: ${wallets.length}`);
  const escrows = doc.app_state.escrow;
  printlnStderr(`Escrows: ${escrows.length}`);

  const regularWallets = wallets.filter(wallet => !isExtraWallet(wallet));
  const extraWallets = wallets.filter(wallet => isExtraWallet(wallet));
  const regularEscrows = escrows.filter(escrow => !isExtraEscrow(escrow));
  const extraEscrows = escrows.filter(escrow => isExtraEscrow(escrow));

  const supply = {
    inRegularWallets: supplyInContainerss([...regularWallets]),
    inRegularEscrows: supplyInContainerss([...regularEscrows]),
    inExtraWallets: supplyInContainerss([...extraWallets]),
    inExtraEscrows: supplyInContainerss([...extraEscrows]),
    subtotal: supplyInContainerss([...regularWallets, ...regularEscrows]),
    total: supplyInContainerss([...wallets, ...escrows]),
  };

  printlnStderr(``);
  printlnStderr(
    `Supply in regular wallets: ${supply.inRegularWallets.toString()} (${percentage(
      supply.inRegularWallets,
      supply.subtotal,
    )})`,
  );
  printlnStderr(
    `Supply in regular escrows: ${supply.inRegularEscrows.toString()} (${percentage(
      supply.inRegularEscrows,
      supply.subtotal,
    )})`,
  );
  printlnStderr(
    `Subtotal supply: ${supply.subtotal.toString()} (${percentage(supply.subtotal, supply.subtotal)})`,
  );

  printlnStderr(``);
  printlnStderr(
    `Supply in extra wallets: ${supply.inExtraWallets.toString()} (${percentage(
      supply.inExtraWallets,
      supply.subtotal,
    )})`,
  );
  printlnStderr(
    `Supply in extra escrows: ${supply.inExtraEscrows.toString()} (${percentage(
      supply.inExtraEscrows,
      supply.subtotal,
    )})`,
  );
  printlnStderr(`Total supply: ${supply.total.toString()} (${percentage(supply.total, supply.subtotal)})`);

  for (const wallet of wallets) {
    if (wallet.coins.length !== 1) throw new Error("Unexpected number of coins in wallet");
    // console.log(wallet.coins[0]);
    const iovCoins = parseIov(wallet.coins[0]);
    const part = relative(iovCoins, supply.subtotal);
    const notes = `ID: ${wallet["//id"]} Name: ${wallet["//name"]}`;
    const section = isExtraWallet(wallet) ? "extra" : "regular";
    printCsvRow("wallet", section, wallet.address, iovCoins, part, notes);
  }

  escrows.forEach((escrow, index) => {
    const { destination, source, timeout, amount } = escrow;
    if (amount.length !== 1) throw new Error("Unexpected number of coins in wallet");
    // console.log(wallet.coins[0]);
    const escrowId = index + 1;
    const iovCoins = parseIov(amount[0]);
    const part = relative(iovCoins, supply.subtotal);
    const notes = `#${escrowId} ${timeout} ${source} -> ${destination}`;
    const beneficiary = destination === "0000000000000000000000000000000000000000" ? source : destination;
    const section = isExtraEscrow(escrow) ? "extra" : "regular";
    printCsvRow("escrow", section, beneficiary, iovCoins, part, notes);
  });
}

main(process.argv.slice(2)).then(
  () => process.exit(0),
  error => {
    console.error(error);
    process.exit(1);
  },
);
