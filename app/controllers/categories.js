/*
  categories controller
 */

var app = require('../../server');
var Category = require('../models/Category');
var log = app.locals.bunyan.createLogger({name: 'categoryController'});
var validator = require('validator');
var async = require('async');
var _ = require('underscore');
var cache = app.locals.cache.createClient();

module.exports.getCategories = function (req, res) {
  Category.findAll(function(err, categories) {
    if (err) {
      log.warn('Unable to retrieve categories', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(categories);
  });
}

module.exports.postCategories = function (req, res) {
  if (!req.body.name || _.isEmpty(req.body)) {
    log.info('Empty or invalid request body');
    return res.status(400).send(app.locals.errors.code400);
  }
  var newCategory = new Category(req.body);
  newCategory.save(function(err, category) {
    if (err) {
      log.warn('Unable to save category', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(category.toObject());
  });
}

module.exports.getCategory = function (req, res) {
  if (!req.params.category_id || !validator.isUUID(req.params.category_id)) {
    log.info('Invalid or no category id received');
    return res.status(400).send(app.locals.errors.code400);
  }
  Category.findById(req.params.category_id, function(err, category) {
    if (err) {
      log.warn('Error from database finding category', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(category)) {
      log.info('Category not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    return res.status(200).send(category.toObject());    
  });
}

module.exports.putCategory = function (req, res) {
  if (!req.body.name || _.isEmpty(req.body)) {
    log.info('Invalid request body received', req.body);
    return res.status(400).send(app.locals.errors.code400);
  }
  Category.findById(req.params.category_id, function(err, category) {
    if (err) {
      log.warn('Error from database finding category', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(category)) {
      log.info('Category not found');
      return res.status(404).send(app.locals.errors.code404);      
    }
    category.set('name', req.body.name);
    category.save(function(err, category) {
      if (err) {
        log.warn('Error saving category', err);
        return res.status(500).send(app.locals.errors.code500);   
      }
      return res.status(200).send(category.toObject());
    });
  });
}

module.exports.deleteCategory = function (req, res) {
  if (!req.params.category_id || !validator.isUUID(req.params.category_id)) {
    log.info('Invalid or no category id received');
    return res.status(400).send(app.locals.errors.code400);
  }
  Category.removeById(req.params.category_id, function(err, category) {
    if (err) {
      log.warn('Error from database removing category', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    if (validator.isNull(category)) {
      log.info('Category not found');
      return res.status(404).send(app.locals.errors.code404);
    }
    return res.sendStatus(204);
  });  
}