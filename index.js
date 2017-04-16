/* eslint-disable global-require */

if (typeof window == 'undefined')
  module.exports = require('./lib/node.js');
else
  module.exports = require('./lib/browser.js');
