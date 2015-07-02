/*
	application routes
 */

var userController = require('../../app/controllers/users');
var authController = require('../../app/controllers/auth');
var productController = require('../../app/controllers/products');
var categoryController = require('../../app/controllers/categories');

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
	app.post(baseurl + '/users/:user_id/photo', authController.verifyAccessToken, userController.postUserPhoto);

	// Product routes
	app.get(baseurl + '/products/search', authController.verifyAccessToken, productController.searchProducts);

	// Categories routes
	app.get(baseurl + '/categories', authController.verifyAccessToken, categoryController.getCategories);
	app.post(baseurl + '/categories', categoryController.postCategories);
	app.get(baseurl + '/categories/:category_id', authController.verifyAccessToken, categoryController.getCategory);
	app.put(baseurl + '/categories/:category_id', authController.verifyAccessToken, categoryController.putCategory);
	app.delete(baseurl + '/categories/:category_id', authController.verifyAccessToken, categoryController.deleteCategory);
}
