/*
  offer controller
 */

var app = require('../../server'); // circular dependency to read app.locals
var Offer = require('../models/Offer');
var Product = require('../models/Product');
var Category = require('../models/Category');
var log = app.locals.bunyan.createLogger({name: 'offerController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');
var cache = app.locals.cache.createClient();

// @POST /offers
module.exports.postOffers = function(req, res) {
  if (_.isEmpty(req.body)) {
    log.info('Empty or invalid request body');
    return res.status(400).send(app.locals.errors.code400);
  }
  if (!req.body.productId) {
    log.info('Offer creation needs productId');
    return res.status(400).send(app.locals.errors.code400);
  }
  Product.ifExists(req.body.productId, function(err, exists) {
    if (err) {
      log.warn('Error from database finding product', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (!exists) {
      log.info('Product not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    // TODO: Validate schema?
    var newOffer = new Offer(req.body);
    newOffer.save(function(err, offer) {
      if (err) {
        log.warn('Unable to save offer', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      return res.status(200).send(offer.toObject());
    });
  });
}

module.exports.getOffer = function(req, res) {
  if (!req.params.offer_id || !validator.isUUID(req.params.offer_id)) {
    log.info('Invalid or no offer id received');
    return res.status(400).send(app.locals.errors.code400);
  }
  Offer.findById(req.params.offer_id, function(err, offer) {
    if (err) {
      log.warn('Error from database finding offer', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(offer)) {
      log.info('Offer not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    // extract product id for finding the product
    var productId = offer.get('productId');
    Product.findById(productId, function(err, product) {
      if (err) {
        log.warn('Error from database finding product', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      if (validator.isNull(product)) {
        log.info('Product not found');
        return res.status(404).send(app.locals.errors.code404);
      }
      // extract category id for finding category
      var categoryId = product.get('categoryId');
      Category.findById(categoryId, function(err, category) {
        if (err) {
          log.warn('Error from database finding category', err);
          return res.status(500).send(app.locals.errors.code500);
        }
        if (validator.isNull(category)) {
          log.info('Category not found');
          return res.status(404).send(app.locals.errors.code404);
        }
        var result = offer.toObject();
        result.product = product.toObject();
        result.category = category.toObject();
        // decorate offer data with discount and time remaining
        if (result.product.price && result.offerPrice) {
          result.discount = app.locals.utils.percentage(result.product.price, result.offerPrice);
        }
        if (result.endDate) {
          result.timeRemaining = app.locals.utils.timeDifference(result.endDate);
        }
        return res.status(200).send(result);
      });
    });
  });
}

function getOffer(offerId, cb) {
  Offer.findById(offerId, function(err, offer) {
    if (err) {
      log.warn('Error from database finding offer', err);
      return cb(err);
    }
    if (validator.isNull(offer)) {
      log.info('Offer not found');
      return cb(null, null);
    }
    // extract product id for finding the product
    var productId = offer.get('productId');
    Product.findById(productId, function(err, product) {
      if (err) {
        log.warn('Error from database finding product', err);
        return cb(err);
      }
      if (validator.isNull(product)) {
        log.info('Product not found');
        return cb(null, null);
      }
      // extract category id for finding category
      var categoryId = product.get('categoryId');
      Category.findById(categoryId, function(err, category) {
        if (err) {
          log.warn('Error from database finding category', err);
          return cb(err);
        }
        if (validator.isNull(category)) {
          log.info('Category not found');
          return cb(null, null);
        }
        var result = offer.toObject();
        result.product = product.toObject();
        result.category = category.toObject();
        // decorate offer data with discount and time remaining
        if (result.product.price && result.offerPrice) {
          result.discount = app.locals.utils.percentage(result.product.price, result.offerPrice);
        }
        if (result.endDate) {
          result.timeRemaining = app.locals.utils.timeDifference(result.endDate);
        }
        return cb(null, result);
      });
    });
  });  
}

module.exports.getOffers = function(req, res) {
  Offer.findAll(function(err, offers) {
    if (err) {
      log.warn('Error from database finding offers', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    var result = [];
    function appendToResult(elem, callback) {
      getOffer(elem.offerId, function(err, offer) {
        if (err) {
          callback(err);
        }
        if (!validator.isNull(offer)) {
          result.push(offer);
        }
        callback(null);
      });
    }
    async.each(offers, appendToResult, function(err) {
      if (err) {
        log.info('Error from get offer: ', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      return res.status(200).send(result);
    });
  });  
}