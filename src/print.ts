export function printlnStdout(txt: string): void {
  process.stdout.write(txt + "\n");
}

export function printlnStderr(txt: string): void {
  process.stderr.write(txt + "\n");
}
