# Stats for IOV token distribution

1. Clone this repo and cd into it
2. `yarn install`
3. Download a version of the IOV genesis file (e.g. from https://gist.github.com/webmaster128/78a46829ece98c01755bbecf1be4af71)
4. Run `./node_modules/.bin/ts-node src/main.ts genesis.json`
5. Export CSV: `./node_modules/.bin/ts-node src/main.ts genesis.json > out.csv`
