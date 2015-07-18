/*
  products controller
 */

var app = require('../../server'); // circular dependency to read app.locals
var products = require('../../lib/semantics-client').createClient();
var Product = require('../models/Product');
var Category = require('../models/Category');
var log = app.locals.bunyan.createLogger({name: 'productsController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');
var cache = app.locals.cache.createClient();
var awsClient = require('../../lib/aws-client').createClient();


// Search Products
module.exports.searchProducts = function(req, res) {
  if (!req.query.query) {
    log.info('No query to search for products');
    return res.status(400).send(app.locals.errors.code400);
  }
  Product.search(req.query.query, function(err, products) {
    if (err) {
      log.warn('Error getting products', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(products);
  });
}

// @POST /products
module.exports.postProducts = function(req, res) {
  if (_.isEmpty(req.body)) {
    log.info('Empty or invalid request body');
    return res.status(400).send(app.locals.errors.code400);
  }
  if (!req.body.categoryId) {
    log.info('Product creation needs categoryId');
    return res.status(400).send(app.locals.errors.code400);
  }
  // TODO: Validate schema?
  var newProduct = new Product(req.body);
  newProduct.save(function(err, product) {
    if (err) {
      log.warn('Unable to save product', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(product.toObject());
  });
}

module.exports.getProduct = function(req, res) {
  if (!req.params.product_id || !validator.isUUID(req.params.product_id)) {
    log.info('Invalid or no product id received');
    return res.status(400).send(app.locals.errors.code400);
  }
  Product.findById(req.params.product_id, function(err, product) {
    if (err) {
      log.warn('Error from database finding product', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(product)) {
      log.info('Product not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    // decorate the data with category information 
    Category.findById(product.get('categoryId'), function(err, category) {
      if (err) {
        log.warn('Error from database finding category', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      if (validator.isNull(category)) {
        log.info('Category not found');
        return res.status(404).send(app.locals.errors.code404);
      }
      var result =  product.toObject();
      result.category = category.toObject();
      return res.status(200).send(result);
    });
  });  
}

module.exports.putProduct = function(req, res) {
  if (_.isEmpty(req.body)) {
    log.info('Empty or invalid request body');
    return res.status(400).send(app.locals.errors.code400);
  }
  // TODO: Validate schema?
  Product.findById(req.params.product_id, function(err, product) {
    if (err) {
      log.warn('Error from database finding product', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(product)) {
      log.info('Product not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    if (req.body.name) {
      product.set('name', req.body.name);
    }
    if (req.body.description) {
      product.set('description', req.body.description);
    }
    if (req.body.price) {
      product.set('price', req.body.price);
    }
    if (req.body.image) {
      product.set('image', req.body.image);
    }
    product.save(function(err, product) {
      if (err) {
        log.warn('Error saving product', err);
        return res.status(500).send(app.locals.errors.code500);
      }
      return res.status(200).send(product.toObject());
    });
  });  
}

module.exports.deleteProduct = function(req, res) {
  if (!req.params.product_id || !validator.isUUID(req.params.product_id)) {
    log.info('Invalid or no product id received');
    return res.status(400).send(app.locals.errors.code400);
  }
  Product.removeById(req.params.product_id, function(err, product) {
    if (err) {
      log.warn('Error from database finding product', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(product)) {
      log.info('Product not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    return res.sendStatus(204);    
  });   
}

// @POST /products/:product_id/photo upload a new photo for the product
module.exports.postProductPhoto = function postProductPhoto(req, res) {
  if (!req.params.product_id || !validator.isUUID(req.params.product_id)) {
    return res.status(400).send(app.locals.errors.code400);
  }
  Product.findById(req.params.product_id, function(err, product) {
    if (err) {
      log.warn('Error from database', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(product)) {
      log.info('Product not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    if (req.headers['content-type'] !== 'image/png') {
      log.info('Unsupported content type received');
      return res.status(400).send(app.locals.errors.code400);
    }
    var key = product.get('productId');
    var length = req.headers['content-length'];
    var photoBuffer = new Buffer('');
    req.on('data', function(chunk) {
      photoBuffer = Buffer.concat([photoBuffer, chunk]);
    });
    req.on('end', function() {
      awsClient.upload(key, photoBuffer, length, function(err, data) {
        if (err) {
          // in case of an error, set the photo back to default
          product.setDefaultPhotoById(key, function(error) {
            if (error) {
              log.warn('Error from database');
            }
            log.warn('Error from S3, reset product photo to default', err);
          });
        }
        log.info('Image uploaded successfully');
      });
      var photoUrl = app.locals.config.aws.s3.s3url + key;
      product.set('image', photoUrl);
      product.save(function(err) {
        if (err) {
          log.warn('Error from database', err);
          return res.status(500).send(app.locals.errors.code500);
        }
        return res.status(200).send(product.toObject());
      });
    });
  });  
}