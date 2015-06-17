/*
	generic error messages
 */
module.exports = function(app) {
	//http status codes and errors
	var errors = {};
	//400 Bad request
	errors.code400 = {
		'status': 'error',
		'errorCode': 400,
		'errorMessage': 'Bad Request'
	}
	// 401 Unauthorized
	errors.code401 = {
		'status': 'error',
		'errorCode': 401,
		'errorMessage': 'Unauthorized'		
	}
	//404 Not found
	errors.code404 = {
		'status': 'error',
		'errorCode': 404,
		'errorMessage': 'Not Found'
	}
	//500 Internal server error
	errors.code500 = {
		'status': 'error',
		'errorCode': 500,
		'errorMessage': 'Internal Server Error'
	}
	//503 Service Unavailable
	errors.code503 = {
		'status': 'error',
		'errorCode': 503,
		'errorMessage': 'Service Unavailable'
	}	
	app.locals.errors = errors;
}
