/*

	Store all the errors handled here
	salesman app

*/

module.exports = function(app, env) {
	//http status codes and errors
	var errorMessages = {};

	//400 Bad request
	errorMessages.code400 = {
		"status": "error",
		"errorCode": 400,
		"errorMessage": "Bad Request"
	}

	//404 Not found
	errorMessages.code404 = {
		"status": "error",
		"errorCode": 404,
		"errorMessage": "Not Found"
	}

	//500 Internal server error
	errorMessages.code500 = {
		"status": "error",
		"errorCode": 500,
		"errorMessage": "Internal Server Error"
	}

	//set the export to env
	env.errorMessages = errorMessages;

}
