/*
 *  utilities for application
 */

var uuid = require('node-uuid');
var randomstring = require('randomstring');
var url = require('url');

module.exports = function(app) {
  var utils = {}
  utils.uuid = function() {
    return uuid.v4();
  }
  utils.timestamp = function() {
    return Date.now()/1000;
  }
  utils.timeDifference = function(enddate) {
    var diff = enddate - Date.now()/1000;
    return diff > 0 ? Math.round(diff) : 0;
  }
  utils.percentage = function(productPrice, offerPrice) {
    return String(Math.round((productPrice - offerPrice)/productPrice * 100)) + '%';
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
  // access token saves userId:email:loginTime
  utils.valueForAccessToken = function (userId, email) {
    return userId + ':' + email + ':' + utils.timestamp();
  }
  utils.randomstring = function() {
    return randomstring.generate(app.locals.config.app.passwordLength);
  }
  utils.verifyEmailLink = function(userId) {
    return url.format(app.locals.config.app.domain  + app.locals.config.app.baseurl + '/users/' + userId + '/verify');
  }
  utils.capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  app.locals.utils = utils;
  return;
 }