var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_set_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'headers.rewrite');

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should set request header and send to remote server', function () {
    // proxy_set_header From Test_Case;
    // proxy_set_header Date 2018-03-30;
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('Test_Case', headers.from);
      assert.equal('2018-03-30', headers.date);
    });
  });

  it('should cover the values ​​of fields named host, age, authorization, content-length ...', function () {
    // proxy_set_header host test.hiproxy.org;
    // proxy_set_header host hiproxy.org;

    // proxy_set_header from test@hiproxy.org;
    // proxy_set_header from admin@hiproxy.org;
    return request({
      uri: 'http://hiproxy.org/over_written_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('admin@hiproxy.org', headers.from);
      assert.equal('hiproxy.org', headers.host);
    });
  });

  it('should make a Array when name is `set-cookie`', function () {
    // proxy_set_header set-cookie 'uname=zdying';
    // proxy_set_header set-cookie 'role=admin';
    return request({
      uri: 'http://hiproxy.org/array_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.deepEqual(['uname=zdying', 'role=admin'], headers['set-cookie']);
    });
  });

  it('should join the values with `, ` ​​of other fields', function () {
    // proxy_set_header UIDs zdying;
    // proxy_set_header UIDs hiproxy;
    return request({
      uri: 'http://hiproxy.org/join_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('zdying, hiproxy', headers.uids);
    });
  });
});
