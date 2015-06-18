/*
	application routes
 */

var userController = require('../../app/controllers/users');
var authController = require('../../app/controllers/auth');

module.exports = function(app) {
	var baseurl = app.locals.config.app.baseurl;

	// middleware - load and verify user from the token
	// app.all(baseurl + '/users/*', authController.verifyAccessToken);
	

	// Deliver angular app for web backend
	app.get('/', userController.getRoot);
	
	// API Routes: 
	
	// Auth
	app.post(baseurl + '/auth', authController.postAuth);
	app.post(baseurl + '/reset/password', authController.postResetPassword);
	app.get(baseurl + '/reset/password/:key', authController.resetPassword);
	
	// Users routes
	app.post(baseurl + '/users', userController.verifyUser, userController.postUser);
	app.get(baseurl + '/users/:user_id', authController.verifyAccessToken, userController.getUser);
	app.get(baseurl + '/users/:user_id/verify', userController.verifyEmail);
	//app.delete(baseurl + '/users/:user_id', userController.deleteUser);
}
