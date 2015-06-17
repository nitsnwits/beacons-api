/*
  controller for auth api's
 */

var app = require('../../server'); // circular dependency to read app.locals
var User = require('../models/User');
var log = app.locals.bunyan.createLogger({name: 'authController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');

module.exports.postAuth = function(req, res) {
  if (!req.body.email || !req.body.password) {
    log.info('Credentials not received');
    return res.status(400).send(app.locals.errors.code400);
  }
  User.comparePassword(req.body.email, req.body.password, function(err, isMatch, user) {
    if (err) {
      log.warn('Error from database reading user', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (!isMatch) {
        return res.status(403).send(app.locals.errors.code403);
      }
    return res.status(200).send(user);
  });
}