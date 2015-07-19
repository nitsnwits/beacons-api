/*
  Offer Model
 */

var app = require('../../server');
var mongoose = require('mongoose');
var validator = require('validator');
var async = require('async');

var offer = {
  offerId: {type: String, unique: true},
  created: {type: Number},
  updated: {type: Number},
  productId: {type: String},
  offerPrice: {type: Number},
  startDate: {type: Number},
  endDate: {type: Number}
}
var OfferSchema = new mongoose.Schema(offer, {strict: false, autoIndex: true});

OfferSchema.pre('save', function(next) {
  var self = this;
  if (!self.offerId) {
    self.offerId = app.locals.utils.uuid();
  }
  if (!self.created) {
    self.created = app.locals.utils.timestamp();
  }  
  self.updated = app.locals.utils.timestamp();
  next();  
});

OfferSchema.statics.findById = function(offerId, cb) {
  this.findOne({offerId: offerId}, function(err, offer) {
    if (err) return cb(err);
    cb(null, offer);
  });
}

OfferSchema.statics.removeById = function(offerId, cb) {
  this.remove({offerId: offerId}, function(err, offer) {
    if (err) return cb(err);
    cb(null, offer);
  });  
}

OfferSchema.statics.findAll = function(cb) {
  this.find({}, function(err, offers) {
    if (err) return cb(err);
    var results = [];
    function transform(elem, callback) {
      results.push(elem.toObject());
      callback(null);
    }
    async.each(offers, transform, function(err) {
      if (err) return cb(err);
      cb(null, results);
    });
  });
}

// specify transform schema option
if (!OfferSchema.options.toObject) OfferSchema.options.toObject = {};
OfferSchema.options.toObject.transform = app.locals.utils.transform();

// export product Model
module.exports  = mongoose.model('Offer', OfferSchema);