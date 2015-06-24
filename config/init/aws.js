/*
  aws initialization
 */

var aws = require('aws-sdk');
var app = require('../../server');
var fs = require('fs');
var awsConfig = JSON.parse(fs.readFileSync(__dirname + '/../rootkey.csv'));
var log = app.locals.bunyan.createLogger({name: 'aws'});

module.exports = function(app) {
  var s3url = app.locals.config.aws.s3.baseurl + '/' + app.locals.config.aws.s3.bucketName + '/';
  app.locals.config.aws.s3.s3url = s3url;
  aws.config.update(awsConfig);
  var awsParams = {
    params: {
      Bucket: app.locals.config.aws.s3.bucketName,
      ACL: app.locals.config.aws.s3.acl
    }
  }
  var s3bucket = new aws.S3(awsParams);
  s3bucket.createBucket(function (err, data) {
    if (err) {
      log.error('Error loading S3', err);
      return;
    }
    log.info('Successfully loaded S3');
    app.locals.config.aws.s3.s3bucket = s3bucket;
    return;
  });
}