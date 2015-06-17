/*
  set up cache
 */

module.exports = function(app) {
  app.locals.cache = require('../../lib/redis-client');
}
