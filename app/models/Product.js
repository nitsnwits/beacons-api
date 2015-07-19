/*
  Product Model
 */

var app = require('../../server');
var mongoose = require('mongoose');
var validator = require('validator');
var async = require('async');
var defaultProductPhoto = app.locals.config.app.domain + app.locals.config.app.defaultProductPhoto;

var product = {
  productId: {type: String, unique: true},
  created: {type: Number},
  updated: {type: Number},
  name: {type: String},
  categoryId: {type: String},
  price: {type: Number},
  image: {type: String},
  description: {type: String},  
}
var ProductSchema = new mongoose.Schema(product, {strict: false, autoIndex: true});

ProductSchema.pre('save', function(next) {
  var self = this;
  if (!self.productId) {
    self.productId = app.locals.utils.uuid();
  }
  if (!self.created) {
    self.created = app.locals.utils.timestamp();
  }  
  self.updated = app.locals.utils.timestamp();
  next();
});

ProductSchema.statics.findById = function(productId, cb) {
  this.findOne({productId: productId}, function(err, product) {
    if (err) return cb(err);
    cb(null, product);
  });
}

ProductSchema.statics.ifExists = function(productId, cb) {
  this.findOne({productId: productId}, function(err, product) {
    if (err) return cb(err);
    if (validator.isNull(product)) return cb(null, false);
    return cb(null, true);
  });
}

ProductSchema.statics.removeById = function(productId, cb) {
  this.remove({productId: productId}, function(err, product) {
    if (err) return cb(err);
    cb(null, product);
  });  
}

ProductSchema.statics.search = function(query, cb) {
  var query = new RegExp(query, 'i');
  this.find({name: query}, function(err, products) {
    if (err) return cb(err);
    var results = [];
    function transform(product, callback) {
      results.push(product.toObject());
      callback(null);
    }
    async.each(products, transform, function(err) {
      if (err) return cb(err);
      cb(null, results);
    });
  });
}

ProductSchema.statics.setDefaultPhotoById = function(productId, cb) {
  this.findOne({productId: productId}, function(err, product) {
    if (err) return cb(err);
    if (validator.isNull(product)) return cb(null, null);
    product.set('image', defaultProductPhoto);
    product.save(function (err) {
      if (err) {
        return cb(err);
      }
      return cb(null, product.toObject());
    });
  });
}

ProductSchema.statics.findAll = function(cb) {
  this.find({}, function(err, products) {
    if (err) return cb(err);
    var results = [];
    function transform(elem, callback) {
      results.push(elem.toObject());
      callback(null);
    }
    async.each(products, transform, function(err) {
      if (err) return cb(err);
      cb(null, results);
    });
  });
}

// specify transform schema option
if (!ProductSchema.options.toObject) ProductSchema.options.toObject = {};
ProductSchema.options.toObject.transform = app.locals.utils.transform();

// export product Model
module.exports  = mongoose.model('Product', ProductSchema);