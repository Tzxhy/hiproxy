/**
 * @file Custom plugin loader
 * @author zdying
 */

'use strice';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
// var directives = require('../directives');
// var routers = require('../routers');
var pluginPrefix = 'hiproxy-plugin-';
var cache = {};

module.exports = {
  getInstalledPlugins: function (root) {
    root = root || childProcess.execSync('npm root -g').toString().trim();

    if (cache[root]) {
      return Promise.resolve(cache[root]);
    }

    return new Promise(function (resolve, reject) {
      fs.readdir(root, function (err, files) {
        var plugins = [];
        /* istanbul ignore if */
        if (err) {
          console.error('plugin root dir read error: ', err.message);
          reject(plugins);
        } else {
          files.forEach(function (file) {
            var fullPath = path.join(root, file);
            try {
              if (file.indexOf(pluginPrefix) === 0 && fs.statSync(fullPath).isDirectory()) {
                plugins.push(fullPath);
              }
            } catch (err) {
              /* istanbul ignore next */
              console.error('get file state error', err);
              // log && log.detail(err);
            }
          });
        }

        cache[root] = plugins;

        resolve(plugins);
      });
    });
  },

  loadPlugins: function (pluginFiles, args) {
    if (!Array.isArray(pluginFiles)) {
      pluginFiles = [pluginFiles];
    }

    pluginFiles.forEach(function (pluginFile) {
      try {
        var plugin = require(pluginFile);

        // console.log('Plugin file:', pluginFile);
        // console.log('Plugin info:', plugin);

        // 添加Commands
        var commands = plugin.commands || [];
        var canAddCommand = args && typeof args.command === 'function';
        canAddCommand && commands.forEach(function (command) {
          args.command(command);
        });

        // 添加directives
        var customDirectives = plugin.directives || [];
        customDirectives.forEach(function (directive) {
          require('../directives').addDirective(directive);
        });

        // 添加router
        var routes = plugin.routes;
        require('../routers').addRoute(routes);
      } catch (err) {
        /* istanbul ignore next */
        console.error('Plugin load error: ', pluginFile, err.message);
        // log.detail(err);
      }
    });
  }
};
