/*
  aws functionalities abstraction
 */

var app = require('../../../server');

function Client() {
  this.s3bucket = app.locals.config.aws.s3.s3bucket;
}

Client.prototype.upload = function upload(key, data, cb) {
  var params = {
    Bucket: app.locals.config.aws.s3.bucketName, 
    Key: key, Body: data
  };
  app.locals.config.aws.s3.s3bucket.upload(params, function callback(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
}

Client.prototype.get = function get(key, cb) {
  var params = {
    Key: key
  }
  app.locals.config.aws.s3.s3bucket.getObject(key, function callback(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
}

Client.prototype.delete = function delete(key, cb) {
  var params = {
    Key: key
  }
  app.locals.config.aws.s3.s3bucket.deleteObject(key, function callback(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
}

module.exports.createClient = function createClient() {
  return new Client();
}