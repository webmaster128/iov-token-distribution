# Stats for IOV token distribution

1. Clone this repo and cd into it
2. `yarn install`
3. Download a version of the IOV genesis file (e.g. from https://gist.github.com/webmaster128/9a87d0967fe2caa95d84ee6288c648c2)
4. Run `./node_modules/.bin/ts-node src/main.ts genesis.json`
5. Export CSV: `./node_modules/.bin/ts-node src/main.ts genesis.json > out.csv`
