/*
  controller for users api's
 */

var app = require('../../server'); // circular dependency to read app.locals
var User = require('../models/User');
var log = app.locals.bunyan.createLogger({name: 'userController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');
var cache = app.locals.cache.createClient();
var mailer = require('../../lib/mailer-client');

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
      log.warn('Error from database finding user', err);
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
  newUser.accessToken = app.locals.utils.uuid();
  newUser.save(function(err, user) {
    if (err) {
      log.warn('Unable to save object in Mongo', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    user = user.toObject();
    // store use in cache
    var valueForAccessToken = app.locals.utils.valueForAccessToken(user.userId, user.email);
    cache.set(user.accessToken, valueForAccessToken, function(err, resp) {
      if (err) {
        log.warn('Unable to cache objects', err);
      }
    });
    var verifyEmailLink = app.locals.utils.verifyEmailLink(user.userId);
    // TODO: Have functions for each type of e-mails, fixtures
    var mailText = 'Welcome dear ' + app.locals.utils.capitalizeFirstLetter(user.name.first)  + '\n' +
                    'Verify your email by clicking at ' + verifyEmailLink;
    mailer.email(user.email, mailText, 'welcome', function(err, resp) {
      if (err) {
        log.warn('Unable to send mail', err);
      }
    });    
    return res.status(200).send(user);
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
      log.warn('Error from database finding user', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(user)) {
      log.info('User not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    return res.status(200).send(user);
  });
}

// @GET Verify user's email
module.exports.verifyEmail = function(req, res) {
  if (!req.params.user_id || !validator.isUUID(req.params.user_id)) {
    return res.status(400).send(app.locals.errors.code400);
  }
  User.findByIdForModify(req.params.user_id, function(err, user) {
    if (err) {
      log.warn('Error from database finding user', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(user)) {
      log.info('User not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    if (user.get('verified')) {
      log.info('User already verified');
      return res.status(200).send({message: 'Your e-mail has already been verified.'});
    }
    user.set('verified', true);
    user.save(function(err) {
      if (err) {
        log.warn('Error from database saving user', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      var mailText = 'Thank you for verifying your e-mail ' + app.locals.utils.capitalizeFirstLetter(user.get('name.first'));
      mailer.email(user.get('email'), mailText, 'verifiedEmail', function(err, resp) {
        if (err) {
          log.warn('Unable to send mail', err);
        }
      });
      return res.status(200).send({message: 'Your e-mail has been verified'});
    })
  });  
}

// @PUT /users/:user_id change information of a user
module.exports.putUser = function putUser(req, res) {
  if (!req.params.user_id || !validator.isUUID(req.params.user_id)) {
    return res.status(400).send(app.locals.errors.code400);
  }
  // a user can only change his name
  if (!req.body.name) {
    log.info('User can only change name');
    return res.status(400).send(app.locals.errors.code400);
  }
  User.findByIdForModify(req.params.user_id, function(err, user) {
    if (err) {
      log.warn('Error from database');
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(user)) {
      log.info('User not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    user.set('name.first', req.body.name.first);
    if (req.body.name.last) {
      user.set('name.last', req.body.name.last);
    }
    user.save(function(err) {
      if (err) {
        log.warn('Error from database');
        return res.status(500).send(app.locals.errors.code500);
      }
      return res.status(200).send(user.toObject());
    });
  });
}

// @PUT /users/:user_id/password change a users password
module.exports.putUserPassword = function putUserPassword(req, res) {
  if (!req.params.user_id || !validator.isUUID(req.params.user_id)) {
    return res.status(400).send(app.locals.errors.code400);
  }
  if (!req.body.password) {
    log.info('User can only change password');
    return res.status(400).send(app.locals.errors.code400);
  }
  User.findByIdForModify(req.params.user_id, function(err, user) {
    if (err) {
      log.warn('Error from database');
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(user)) {
      log.info('User not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    user.set('password', req.body.password);
    user.save(function(err) {
      if (err) {
        log.warn('Error from database');
        return res.status(500).send(app.locals.errors.code500);
      }
      return res.status(200).send(user.toObject());
    });
  });  

}

// @DELETE /users/:user_id delete a user
module.exports.deleteUser = function deleteUser(req, res) {
  if (!req.params.user_id || !validator.isUUID(req.params.user_id) || !req.body.code) {
    return res.status(400).send(app.locals.errors.code400);
  }
  User.removeById(req.params.user_id, function(err, user) {
    if (err) {
      log.warn('Error from database');
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(user)) {
      log.info('User not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    return res.sendStatus(204);
  });
}

