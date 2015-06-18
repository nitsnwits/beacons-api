/*
  e-mail client for forgot password stuff
 */

var nodemailer = require('nodemailer');
var app = require('../../../server');
var transporter = nodemailer.createTransport({
    service: app.locals.config.mailer.service,
    auth: {
        user: app.locals.config.mailer.email,
        pass: app.locals.config.mailer.password
    }
});

function taskToSubject(task) {
  var options = {
    verifyEmail: 'Verify your email',
    resetPassword: 'Reset your password',
    welcome: 'Warm welcome',
    verifiedEmail: 'Email Verified',
    newPassword: 'Your new password'
  }
  return options[task];
}

function createMail(to, text, task) {
  return {
      from: app.locals.config.mailer.email,
      to: to,
      subject: app.locals.config.app.name + ' - ' + taskToSubject(task),
      text: text
  };  
}

module.exports.email = function (to, text, task, cb) {
  transporter.sendMail(createMail(to, text, task), function(err, info) {
    if (err) return cb(err);
  });
}