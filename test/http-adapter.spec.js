import { assert } from 'chai';
import HttpAdapter from '../src/http-adapter';
import sinon from 'sinon';
import fakeweb from 'node-fakeweb';

function str2Uint8Array (str) {
  return new Uint8Array(str.split('').map((ch) => ch.charCodeAt(0)));
}

function _expectError (msgPrefix, asyncFunc) {
  return asyncFunc().then(() => {
    throw new Error('Should have raised an error.');
  }, (err) => {
    if (err.message.indexOf(msgPrefix) !== 0) {
      throw new Error(`Unexpected error message: ${err.message}`);
    }
  });
}

describe('off-chain-data-adapter-http.HttpAdapter', () => {
  describe('download', () => {
    it('should throw an error upon invalid URL', async () => {
      return _expectError('Invalid url:', () =>
        new HttpAdapter().download('nonsensical url'));
    });

    it('should throw an error upon invalid URL scheme', async () => {
      return _expectError('Invalid url scheme:', () =>
        new HttpAdapter().download('torrent://hou'));
    });

    it('should download data from the provided url', async () => {
      fakeweb.registerUri({
        uri: 'https://example.com/data',
        body: str2Uint8Array('{"key": "value"}'),
        contentType: 'application/json',
      });
      let data = await new HttpAdapter().download('https://example.com/data');
      assert.deepEqual(data, { key: 'value' });
    });

    it('should return error upon ill-formatted data', async () => {
      fakeweb.registerUri({
        uri: 'https://example.com/ill-formatted',
        body: str2Uint8Array('ill-formatted json'),
        contentType: 'application/json',
      });
      return _expectError('Unexpected token', () =>
        new HttpAdapter().download('https://example.com/ill-formatted')
      );
    });

    it('should return error upon 404', async () => {
      fakeweb.registerUri({
        uri: 'https://example.com/404',
        body: str2Uint8Array('not found'),
        statusCode: 404,
      });
      return _expectError('Error 404', () =>
        new HttpAdapter().download('https://example.com/404')
      );
    });

    it('should return error when the server is unavailable', async () => {
      fakeweb.registerUri({
        uri: 'https://example.com/unavailable',
        body: str2Uint8Array('not found'),
        statusCode: 404,
        exception: true,
      });
      return _expectError('connect ECONNREFUSED', () =>
        new HttpAdapter().download('https://example.com/unavailable')
      );
    });
  });

  describe('upload', () => {
    it('should throw an error when no uploader was provided', async () => {
      return _expectError('Cannot perform upload', () =>
        new HttpAdapter().upload({ key: 'value' }));
    });

    it('should call the provided uploader, if present', async () => {
      let uploader = sinon.stub(),
        adapter = new HttpAdapter({ uploader: uploader });
      await adapter.upload({ key: 'value' });
      assert(uploader.calledOnce);
      assert.deepEqual(uploader.getCall(0).args, [{ key: 'value' }]);
    });
  });

  describe('update', () => {
    it('should throw an error when no updater was provided', async () => {
      return _expectError('Cannot perform update', () =>
        new HttpAdapter().update('https://holario.com/data', { key: 'value' }));
    });

    it('should call the provided updater, if present', async () => {
      let updater = sinon.stub(),
        adapter = new HttpAdapter({ updater: updater });
      await adapter.update('https://holario.com/data', { key: 'value' });
      assert(updater.calledOnce);
      assert.deepEqual(updater.getCall(0).args, ['https://holario.com/data', { key: 'value' }]);
    });

    it('should throw an error upon invalid URL ', async () => {
      let updater = sinon.stub(),
        adapter = new HttpAdapter({ updater: updater });
      return _expectError('Invalid url:', () =>
        adapter.update('nonsensical url', { key: 'value' }));
    });

    it('should throw an error upon invalid URL scheme', async () => {
      let updater = sinon.stub(),
        adapter = new HttpAdapter({ updater: updater });
      return _expectError('Invalid url scheme:', () =>
        adapter.update('torrent://hou', { key: 'value' }));
    });
  });
});
