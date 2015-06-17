/*
  abstraction and factory for redis
 */

var redis = require('redis');
var app = require('../../../server');

function Client() {
  this.client = redis.createClient();
  if (app.locals.config.cache.openshift) {
    this.client.auth(app.locals.config.cache.openshift);
  }
}

Client.prototype.set = function set(key, value, cb) {
  this.client.set(key, value, function(err, resp) {
    if (err) return cb(err);
    cb(null, resp);
  });
}

Client.prototype.get = function get(key, cb) {
  this.client.get(key, function(err, resp) {
    if (err) return cb(err);
    if (resp == 0) {
      return cb(null, false);
    }
    cb(null, true, resp);
  });
}

Client.prototype.setResetPasswordKey = function (key, value, cb) {
  var expiry = app.locals.config.server.resetPasswordLinkExpiry;
  var self = this;
  self.client.set(key, value, function(err, resp) {
    if (err) return cb(err);
    self.client.expire(key, expiry);
    cb(null, resp);
  });
}

Client.prototype.close = function() {
  this.client.quit();
}


module.exports.createClient = function() {
  return new Client();
}
