import { Decimal } from "./decimal";
import { Escrow, parseIov, Wallet } from "./format";

export function relative(nominator: Decimal, denominator: Decimal): string {
  const rel = nominator.toFloatApproximation() / denominator.toFloatApproximation();
  return rel.toFixed(8);
}

export function percentage(nominator: Decimal, denominator: Decimal): string {
  const rel = (nominator.toFloatApproximation() / denominator.toFloatApproximation()) * 100;
  return rel.toFixed(1) + "%";
}

function isWallet(data: Escrow | Wallet): data is Wallet {
  return typeof (data as Wallet).coins !== "undefined";
}

export function supplyInContainerss(containers: readonly (Escrow | Wallet)[]): Decimal {
  const amounts = containers.map(container => {
    if (isWallet(container)) {
      if (container.coins.length !== 1) throw new Error("Unexpected number of coins in wallet");
      return parseIov(container.coins[0]);
    } else {
      if (container.amount.length !== 1) throw new Error("Unexpected number of amounts in escrow");
      return parseIov(container.amount[0]);
    }
  });
  return amounts.reduce((current, added) => current.plus(added), Decimal.fromAtomics("0", 9));
}
