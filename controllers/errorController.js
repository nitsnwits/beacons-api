var _ = require('underscore')
  , fs = require('fs')
  , env = require('../config/environment')
  , logger = env.logger
  , byline = require('byline')
  , os  = require('os-utils')
;


module.exports.getErrors = function(req, res, next) {
  res.render('errors');
}

module.exports.getErrorsJson = function(req, res, next) {
  var stream = byline(fs.createReadStream(env.config.server.logfile, { encoding: 'utf8' }));
  var errorList = [];
  stream.on('data', function(line) {
    errorList.push(line + '-' + env.hostname);
  });
  stream.on('end', function() {
    res.send(errorList.reverse());
  });
}

module.exports.getCpu = function(req, res, next) {
  res.render('cpu');
}

module.exports.getCpuJson = function(req, res, next) {
  os.cpuUsage(function (usage) {
    os.cpuFree(function (free) {
      var stats = {
        cpuUsage: usage,
        cpuFree: free,
        freeMem: os.freememPercentage(),
        uptime: os.processUptime()
      }
      res.send(stats);      
    });
  });
}

