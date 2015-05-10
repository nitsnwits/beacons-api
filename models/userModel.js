/*
 *
 * Database functionalities for user objects
 *
 */

var env = require("../config/environment")
	, validator = require("validator")
	, _ = require("underscore")
	, logger = env.logger
;

function dbCreateUser(userObject, callback) {
	if (!userObject.userId) {
		var userId = {"userId": env.uuid()};
	}
	userObject = _.extend(userObject, userId);

	// Create object instance for mongoose
	var dbUserObject = new env.Users(userObject);

	// Because mongoose is an orm, we need to save the object instance
	dbUserObject.save(function(error, newUserObject) {
		if(error) {
			logger.error('Error from database creating a user.');
			return callback(error, null);
		}
		// Convert the mongoose doc to JSON object
		newUserObject = newUserObject.toObject();
		return callback(null, _.omit(newUserObject, ['_id', '__v']));
	});
}

function dbGetUser(userId, callback) {
	env.Users.findOne({ "userId": userId }, function(error, userObject) {
		// log error from database, if so
		if(error) {
			logger.error('Error from database: ' + error);
			return callback(error);
		}
		// check if a null object is received
		if(validator.isNull(userObject)) {
			logger.debug('Null object received from database, userId: ' + userId);
			return callback(null, null);
		}
		// Because mongo is an orm, it's doc needs to be converted to JS object
		userObject = userObject.toObject();
		//Return the information from database
		return callback(null, _.omit(userObject, ['_id', '__v']));
 	});
}

function dbLoginUser(username, password, callback) {
	var query = { "email": username, "password": password };
	env.Users.findOne(query, function(error, userObject) {
		// log error from database, if so
		if(error) {
			logger.error('Error from database: ' + error);
			return callback(error);
		}
		// check if a null object is received
		if(validator.isNull(userObject)) {
			logger.log('Null object received from database, userId: ' + username);
			return callback(null, null);
		}
		// Because mongo is an orm, it's doc needs to be converted to JS object
		userObject = userObject.toObject();
		//Return the information from database
		return callback(null, _.omit(userObject, ['_id', '__v']));
 	});
}

function removeUsers(callback) {
	env.Users.remove({}, function(error, numRemoved) {
		if(error) {
			logger.error('Error from database: ' + error);
			return callback(error);
		}
		return callback(null, numRemoved);
	});
}

// Export all functions for this module
moduleExports = {}
moduleExports.dbGetUser = dbGetUser;
moduleExports.dbCreateUser = dbCreateUser;
moduleExports.dbLoginUser = dbLoginUser;
moduleExports.removeUsers = removeUsers;

module.exports = moduleExports;