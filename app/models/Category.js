/*
 Category Model
 */

var app = require('../../server');
var mongoose = require('mongoose');
var validator = require('validator');
var async = require('async');

var category = {
  categoryId: {type: String, unique: true},
  created: {type: Number},
  updated: {type: Number},
  name: {type: String},
  xCoord: {type: Number},
  yCoord: {type: Number},
  beaconName: {type: String},
  beaconId: {type: String},
  majorNumber: {type: Number},
  minorNumber: {type: Number}
}
var CategorySchema = new mongoose.Schema(category, {strict: false, autoIndex: true});

CategorySchema.pre('save', function(next) {
  var self = this;
  if (!self.categoryId) {
    self.categoryId  = app.locals.utils.uuid();
  }
  if (!self.created) {
    self.created = app.locals.utils.timestamp();
  }
  if (!self.beaconId) {
    self.beaconId = app.locals.utils.uuid();
  }
  self.updated = app.locals.utils.timestamp();
  next();
});

// Needed for udpating categories from a json file
CategorySchema.statics.emptyCollection = function(cb) {
  this.remove({}, function(err) {
    if (err) return cb(err);
    cb(null);
  });
}

CategorySchema.statics.findAll = function(cb) {
  this.find({}, function(err, categories) {
    if (err) return cb(err);
    var results = [];
    function transform(elem, callback) {
      results.push(elem.toObject());
      callback(null);
    }
    async.each(categories, transform, function(err) {
      if (err) return cb(err);
      cb(null, results);
    });
  });
}

CategorySchema.statics.findById = function(categoryId, cb) {
  this.findOne({categoryId: categoryId}, function(err, category) {
    if (err) return cb(err);
    cb(null, category);
  });
}

CategorySchema.statics.removeById = function(categoryId, cb) {
  this.remove({categoryId: categoryId}, function(err, category) {
    if (err) return cb(err);
    cb(null, category);
  });
}

CategorySchema.statics.findByBeaconId = function(beaconId, cb) {
  this.find({beaconId: beaconId}, function(err, categories) {
    if (err) return cb(err);
    var results = [];
    function transform(elem, callback) {
      results.push(elem.toObject());
      callback(null);
    }
    async.each(categories, transform, function(err) {
      if (err) return cb(err);
      cb(null, results);
    });
  });
}

// specify transform schema opton
if (!CategorySchema.options.toObject) CategorySchema.options.toObject = {};
CategorySchema.options.toObject.transform = app.locals.utils.transform();

// export category model
module.exports = mongoose.model('Category', CategorySchema);