# Winding Tree Off Chain Data Adapter - HTTP(s).

[![Greenkeeper badge](https://badges.greenkeeper.io/windingtree/off-chain-adapter-http.svg)](https://greenkeeper.io/)

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

In the most basic way, this adapter can be used purely for data
retrieval:

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

In case we need to extend it with the upload or update
capability, we need to provide the necessary functionality
from outside:

```javascript
import WTLibs from '@windingtree/wt-js-libs';
import HttpAdapter from '@windingtree/off-chain-adapter-http';

// As an example, we will create an uploader for AWS S3.
// (Update functionality could be implemented in a similar way.)
import AWS from 'aws-sdk';

function s3_uploader (data) {
  let s3 = new AWS.S3({apiVersion: '2006-03-01', region: 'eu-central-1'}),
      bucket = 'bucket',
      key = 'hotel.json',
      params = {
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(data)
      };

  return s3.putObject(params)
    .promise()
    .then(() => `https://${bucket}.s3.amazonaws.com/${key}`);
}

const libs = WTLibs.createInstance({
  dataModelOptions: {
    provider: 'http://localhost:8545',
  },
  offChainDataOptions: {
    adapters: {
      'https': {
        options: {uploader: s3_uploader},
        create: (options) => {
          return new HttpAdapter(options);
        },
      },
    },
  },
});
```
