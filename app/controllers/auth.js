/*
  controller for auth api's
 */

var app = require('../../server'); // circular dependency to read app.locals
var User = require('../models/User');
var log = app.locals.bunyan.createLogger({name: 'authController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');
var url = require('url');
var cache = app.locals.cache.createClient();
var mailer = require('../../lib/mailer-client');

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
      return res.status(401).send(app.locals.errors.code401);
    }
    // if is match, update cache
    var valueForAccessToken = app.locals.utils.valueForAccessToken(user.userId, user.email);
    cache.set(user.accessToken, valueForAccessToken, function(err, resp) {
      if (err) {
        log.warn('Unable to cache objects', err);
      }
    });
    return res.status(200).send(user);
  });
}

module.exports.verifyAccessToken = function(req, res, next) {
  if (!req.headers.authorization) {
    log.info('No access token received');
    return res.status(401).send(app.locals.errors.code401);
  }
  cache.get(req.headers.authorization, function(err, exists, resp) {
    if (err) {
      log.warn('Unable to read from cache', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (!exists) {
      log.info('Non existing access token received');
      return res.status(401).send(app.local.errors.code401);
    }
    var cacheInfo = resp.split(':');
    req.userId = cacheInfo[0];
    req.email = cacheInfo[1];
    req.loginTime = cacheInfo[2];
    next();
  });
}

module.exports.postResetPassword = function(req, res) {
  if (!req.body.email) {
    log.info('No email received to reset password');
    return res.status(400).send(app.locals.errors.code400);
  }
  User.findByEmail(req.body.email, function(err, user) {
    if (err) {
      log.warn('Error reading from database', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(user)) {
      log.info('User not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    if (!user.verified) {
      log.info('User email not verified');
      return res.status(200).send(user);
    }
    // send a link to user if user is verified
    var resetPasswordKey = app.locals.utils.uuid();
    cache.setResetPasswordKey(resetPasswordKey, user.userId, function(err, resp) {
      if (err) {
        log.warn('Unable to cache objects', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      var resetPasswordLink = url.format(app.locals.config.app.domain  + app.locals.config.app.baseurl + '/reset/password/' + resetPasswordKey);
      mailer.email(user.email, resetPasswordLink, 'resetPassword', function(err, resp) {
        if (err) {
          log.info('Unable to send mail', err);
        }
      });
      return res.status(200).send({url: resetPasswordLink});
    });
  });
}

module.exports.resetPassword = function(req, res) {
  if (!req.params.key) {
    log.info('No reset password key received');
    return res.status(400).send(app.locals.errors.code400);
  }
  var cache = app.locals.cache.createClient();
  cache.get(req.params.key, function(err, exists, resp) {
    if (err) {
      log.warn('Unable to read cache', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (!exists) {
      log.info('Bad reset password key');
      return res.status(401).send(app.locals.errors.code401);
    }
    User.findByIdForModify(resp, function(err, user) {
      if (err) {
        log.warn('Unable to read database', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      if (validator.isNull(user)) {
        log.info('User not found');
        return res.status(404).send(app.locals.errors.code404);
      }
      var newPassword = app.locals.utils.randomstring();
      user.set('password', newPassword);
      user.save(function(err) {
        if (err) {
          log.warn('Error saving into database', err);
          return res.status(500).send(app.locals.errors.code500);
        }
        mailer.email(user.email, newPassword, 'newPassword', function(err, resp) {
          if (err) {
            log.info('Unable to send mail', err);
          }
        });      
        return res.status(200).send({message: 'Your new password has been e-mailed to you.'});        
      });
    });
  });
}