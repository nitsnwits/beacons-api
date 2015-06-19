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
	app.post(baseurl + '/auth/reset/password', authController.postResetPassword);
	app.get(baseurl + '/auth/reset/password/:key', authController.resetPassword);
	
	// Users routes
	app.post(baseurl + '/users', userController.verifyUser, userController.postUser);
	app.get(baseurl + '/users/:user_id', authController.verifyAccessToken, userController.getUser);
	app.put(baseurl + '/users/:user_id', authController.verifyAccessToken, userController.putUser);
	app.delete(baseurl + '/users/:user_id', authController.verifyAccessToken, userController.deleteUser);
	app.get(baseurl + '/users/:user_id/verify', userController.verifyEmail);
	app.put(baseurl + '/users/:user_id/password', authController.verifyAccessToken, userController.putUserPassword);
	
}
