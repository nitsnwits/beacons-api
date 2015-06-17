/*
 *  utilities for application
 */

var uuid = require('node-uuid');

module.exports = function(app) {
  var utils = {}
  utils.uuid = function() {
    return uuid.v4();
  }
  utils.timestamp = function() {
    return Date.now();
  }
  // delete mongoose internal fields
  utils.transform = function() {
    return function (doc, ret, options) {
      // remove the _id and __v of every document before returning the result
      delete ret._id;
      delete ret.__v;
      if (ret.password) {
        delete ret.password;
      }
    }
  }
  app.locals.utils = utils;
  return;
 }