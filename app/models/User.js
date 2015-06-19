/*
    User model
 */
var app = require('../../server');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var validator = require('validator');

// Used to generate password hash
var SALT_WORK_FACTOR = 10;

// Define user model schema

// user object
var user = {
  email: {type: String, unique: true},
  created: {type: Number},
  updated: {type: Number},
  userId: {type: String},
  accessToken: {type: String},
  verified: {type: Boolean}
}
var UserSchema = new mongoose.Schema(user, {strict: false, autoIndex: true});
//UserSchema.set('toJSON', { virtuals: true });

// Middleware executed before save - hash the user's password
UserSchema.pre('save', function(next) {
  var self = this;

  // set user id
  if (!self.userId) {
    self.userId = app.locals.utils.uuid();
  }

  // set created time
  if (!self.created) {
    self.created = app.locals.utils.timestamp();
  }
  self.updated = app.locals.utils.timestamp();

  // only hash the password if it has been modified (or is new)
  if (!self.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(self.get('password'), salt, function(err, hash) {
      if (err) return next(err);

      // override the cleartext password with the hashed one
      self.set('password', hash);
      next();
    });
  });
});

// Test candidate password
UserSchema.statics.comparePassword = function(candidateEmail, candidatePassword, cb) {
  this.findOne({email: candidateEmail}, function(err, user) {
    if (err) return cb(err);
    if (validator.isNull(user)) return cb(null, null);
    bcrypt.compare(candidatePassword, user.get('password'), function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch, user.toObject());
    });
  });
};

// Find users by email
UserSchema.statics.findByEmail = function(email, cb) {
  this.findOne({email: email}, function(err, user) {
    if (err) return cb(err);
    if (validator.isNull(user)) return cb(null, null);
    return cb(null, user.toObject());
  });
}

// Find users by id
UserSchema.statics.findById = function(userId, cb) {
  this.findOne({userId: userId}, function(err, user) {
    if (err) return cb(err);
    if (validator.isNull(user)) return cb(null, null);
    return cb(null, user.toObject());
  }); 
}

// Find users by id, return doc to modify
UserSchema.statics.findByIdForModify = function(userId, cb) {
  this.findOne({userId: userId}, function(err, user) {
    if (err) return cb(err);
    if (validator.isNull(user)) return cb(null, null);
    return cb(null, user);
  }); 
}

// Remoe a doc by id, return the doc removed
UserSchema.statics.removeById = function(userId, cb) {
  this.findOne({userId: userId}).remove(function(err, user) {
    if (err) return cb(err);
    if (validator.isNull(user)) return cb(null, null);
    return cb(null, user);    
  })
}

// specify the transform schema option
if (!UserSchema.options.toObject) UserSchema.options.toObject = {};
UserSchema.options.toObject.transform = app.locals.utils.transform();

// Export user model
module.exports = mongoose.model('User', UserSchema);
