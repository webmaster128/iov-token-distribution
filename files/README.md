# Genesis files

Genesis files for various public IOV networks.

## How to get a genesis file

There genesis file can be read via any RPC node in the network, e.g.

```
curl http://rpc.myrpcnode.example:46657/genesis | jq .result.genesis > genesis.json
```

The resulting files differ in the order of fields from the input genesis files (e.g. https://gist.github.com/webmaster128/9a87d0967fe2caa95d84ee6288c648c2), which is the reason for mismatching checksums.

# Download genesis for iov-mainnet-2

```
wget https://gist.github.com/davepuchyr/4fe7e002061c537ddb116fee7a2f8e47/raw/genesis.json -O genesis_mainnet-2.json
```
