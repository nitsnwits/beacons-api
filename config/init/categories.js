/*
 manually update categories in the json
 */

var app = require('../../server');
var fs = require('fs');
var categories = JSON.parse(fs.readFileSync(__dirname + '/../../fixtures/categories.json'));
var async = require('async');
var Category = require('../../app/models/Category');
var log = app.locals.bunyan.createLogger({name: 'initCategories'});

// helper function to save a category
function saveCategory(category, cb) {
  var category = new Category(category);
  category.save(function(err) {
    if (err) {
      return cb(err);
    }
    cb(null);
  });
}

module.exports = function(app) {
  if (!app.locals.config.app.updateCategories || process.env.NODE_ENV === 'production') {
    log.info('Not updating categories in production mode or when overridden by config');
    return;
  }
  // empty the categories collection
  Category.emptyCollection(function(err) {
    if (err) {
      log.error('Unable to empty categories', err);
      return;
    }
    // save each category as read from file in parallel
    async.each(categories.categories, saveCategory, function(err) {
      if (err) {
        log.error('Error saving categories', err);
        return;
      }
      log.info('Successfully updated all categories');
    });
  });
}