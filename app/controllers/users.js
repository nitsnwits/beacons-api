/*
  controller for users api's
 */

var app = require('../../server'); // circular dependency to read app.locals
var User = require('../models/User');
var log = app.locals.bunyan.createLogger({name: 'userController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');

// TODO: fix root
module.exports.getRoot = function(req, res) {
  return res.render('Landing.html');
}

// Middleware verify user for creation
module.exports.verifyUser = function(req, res, next) {
  if (_.isEmpty(req.body)) {
    log.info('Empty request body');
    return res.status(400).send(app.locals.errors.code400);
  }
  User.findByEmail(req.body.email, function(err, user) {
    if (err) {
      log.info('Error from database finding user');
      return res.status(500).send(app.locals.errors.code500);
    }
    if (!validator.isNull(user)) {
      log.info('User already exists');
      return res.status(200).send(user);
    }
    next();
  });
}
 
// @POST user
module.exports.postUser = function(req, res) {
  var newUser = new User(req.body);
  newUser.save(function(err, user) {
    if (err) {
      log.info('Unable to save object in Mongo');
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(user.toObject());
  });
}

// @GET user
module.exports.getUser = function(req, res) {
  if (!req.params.user_id || !validator.isUUID(req.params.user_id)) {
    return res.status(400).send(app.locals.errors.code400);
  }
  // TODO: check req.user when user is loaded from cache
  User.findById(req.params.user_id, function(err, user) {
    if (err) {
      log.info('Error from database finding user');
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(user);
  });
}

