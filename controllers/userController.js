/*
 *  http handlers for user objects
 */

var env = require("../config/environment")
	, validator = require("validator")
	, _ = require("underscore")
	, async = require('async')
	, logger = env.logger
	, crypto = require('crypto')
;

// encryption algorithm
var algo = 'md5';

//set datamodels based on datastoreMode
var userModel = require("../models/userModel");

module.exports.getRoot = function(req, res) {
	logger.log('GET Request for URL: / received.');
	res.render('../views/Landing.html');
}

module.exports.postUser = function(req, res) {
	// check if body is empty
	if (_.isEmpty(req.body)) {
		logger.log("Empty request body received in POST user.");
		return res.render('Errorpage');
	}
	
	logger.log("POST /user request received." + JSON.stringify(req.body));
	userModel.dbCreateUser(req.body, function(error, newUser) {
		if (error) {
			logger.log('Error from database in POST user. ' + error);
			return res.render('Errorpage');
		}
		if (validator.isNull(newUser)) {
			logger.log('Null object received from database in POST user. ');
			return res.render('Errorpage');
		}
		logger.log('POST /user response: ' + JSON.stringify(newUser));
		res.locals.userName = newUser.first_name;
		return res.render('Home');
	});
}

module.exports.getUser = function(req, res) {
	logger.log("GET /user request received userId=" + req.params.user_id);
	var userId = req.params.user_id;
	userModel.dbGetUser(userId, function(error, user) {
		if (error) {
			logger.log('Error from database: ' + error);
			return res.render('Errorpage');
		}
		if (validator.isNull(user)) {
			logger.log('Null object received in get User controller, userId: ' + userId);
			return res.render('Errorpage');

		}
		logger.log('GET /user response ' + JSON.stringify(user));
		return res.send(200, user);
	});
}

module.exports.postLogin = function(req, res) {
	logger.log("POST /login request received username=" + req.body.loginname);
	// logger.log('blah' + JSON.stringify(req.body));
	var username = req.body.loginname;
	var password = req.body.password;
	userModel.dbLoginUser(username, password, function(error, user) {
		if (error) {
			logger.log('Error from database: ' + error);
			return res.render('Errorpage');
		}
		if (validator.isNull(user)) {
			res.locals.errorMessage = "Sorry " + username + ". We did you find you in our database. Do you want to try again?";
			logger.log('Null object received in get User controller, userId: ' + username);
			return res.render('Errorpage');
		}
		if (user.email === username && user.password === password) {
			res.locals.userName = user.first_name;
			res.locals.businesses = user.businesses;
			res.render('Home');
			return;
		} else {
			res.locals.errorMessage = "Sorry " + username + ". We did not match any credentials. Do you want to try again?";
			res.render('Errorpage');
			return;
		}
	});
}
