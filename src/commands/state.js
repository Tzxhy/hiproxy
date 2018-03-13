/**
 * @file command `list`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');

var dirtool = require('../helpers/dirTool');
var getLocalIP = require('../../src/helpers/getLocalIP');
var showImage = require('../helpers/showImage');

var hiproxyDir = dirtool.getHiproxyDir();

module.exports = {
  command: 'state',
  describe: 'Show all the servers state (Only works in daemon mode)',
  usage: 'state [option]',
  fn: function () {
    try {
      var infoFile = fs.openSync(path.join(hiproxyDir, 'hiproxy.json'), 'r');
      // var pidFile = fs.openSync(path.join(hiproxyDir, 'hiproxy.pid'), 'r');

      // var pid = fs.readFileSync(pidFile);
      var info = fs.readFileSync(infoFile);

      var infoObj = JSON.parse(info);
      var port = infoObj.port || 5525;
      var args = infoObj.args;
      var httpsPort = args.https ? args.middleManPort || 10010 : '';
      var ip = getLocalIP();
      // var tableData = {
      //   header: ['Service Name', 'Port', 'Address', 'State'],
      //   rows: [
      //     ['Proxy Server', port, 'http://127.0.0.1:' + port, 'Running'],
      //     ['HTTPS Server', httpsPort, 'http://127.0.0.1:' + httpsPort, 'Running'],
      //   ]
      // }

      // console.log(infoObj);

      showImage([
        '',
        '',
        // '  Process (pid): ' + pid,
        '    Proxy address: '.bold.green + (ip + ':' + port).underline,
        '    Https address: '.bold.magenta + (httpsPort ? (ip + ':' + httpsPort).underline : 'disabled'),
        '    Proxy file at: '.bold.yellow + ('http://' + ip + ':' + port + '/proxy.pac').underline,
        ''
      ]);
    } catch (e) {
      console.log();
      console.log('[Error] Command <state> will only work in daemon mode.');
      console.log();
    }
  }
};
