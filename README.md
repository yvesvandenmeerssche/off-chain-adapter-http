# Winding Tree Off Chain Data Adapter - HTTP(s).

HTTP adapter for off-chain data that can be used in Winding Tree [wt-js-libs](https://github.com/windingtree/wt-js-libs).

## Installation

```sh
npm install @windingtree/off-chain-adapter-http
# or
git clone https://github.com/windingtree/off-chain-adapter-http
nvm install
npm install
```

## Usage

```javascript
import WTLibs from '@windingtree/wt-js-libs';
import HttpAdapter from '@windingtree/off-chain-adapter-http';

const libs = WTLibs.createInstance({
  dataModelOptions: {
    provider: 'http://localhost:8545',
  },
  offChainDataOptions: {
    adapters: {
      'https': {
        options: {},
        create: (options) => {
          return new HttpAdapter(options);
        },
      },
    },
  },
});
```
