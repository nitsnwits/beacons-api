/*
  read semantics config, sync before application starts
 */

var fs = require('fs');
var config = JSON.parse(fs.readFileSync(__dirname + '/../semanticsKeys.csv'));

module.exports = function(app) {
  app.locals.config.semantics.apiKey = config.api_key;
  app.locals.config.semantics.apiSecret = config.api_secret;
  return;
}