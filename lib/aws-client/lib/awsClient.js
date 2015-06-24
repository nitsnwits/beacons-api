/*
  aws functionalities abstraction
 */

var app = require('../../../server');
var _ = require('underscore');

function Client() {
  this.s3bucket = app.locals.config.aws.s3.s3bucket;
}

var s3object = {
  "Key": '',
  "Body": '',
  "ContentType": 'image/png',
  "ContentLength": '',
  "CacheControl": "max-age=" + 30*24*60*60
}

Client.prototype.upload = function upload(key, data, length, cb) {
  var params = _.extend(s3object, {});
  params.Key = key;
  params.Body = data;
  params.ContentLength = length;
  this.s3bucket.upload(params, function callback(err, data) {
    if (err) {
      console.log('err %j', err);
      return cb(err);
    }
    cb(null, data);
  });
}

Client.prototype.get = function get(key, cb) {
  var params = {
    Key: key
  }
  this.s3bucket.getObject(key, function callback(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
}

Client.prototype.delete = function del(key, cb) {
  var params = {
    Key: key
  }
  this.s3bucket.deleteObject(key, function callback(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
}

module.exports.createClient = function createClient() {
  return new Client();
}