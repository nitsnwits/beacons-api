/*
	application routes
 */

var userController = require('../../app/controllers/users');
var authController = require('../../app/controllers/auth');

module.exports = function(app) {
	var baseurl = app.locals.config.app.baseurl;

	// middleware - load and verify user from the token
	//app.all(baseurl + '/users/*', userController.loadUser);
	

	// Deliver angular app for web backend
	app.get('/', userController.getRoot);
	
	// API Routes: 
	
	// Auth
	app.post(baseurl + '/auth', authController.postAuth);
	
	// Users routes
	app.post(baseurl + '/users', userController.verifyUser, userController.postUser);
	app.get(baseurl + '/users/:user_id', userController.getUser);
}
