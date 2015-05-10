/**
 * Validate schemas using z-schema
 */

var env = require("../../config/environment")
	, zSchema = require("z-schema")
	, objectSchemas = require("./objectSchemas")
	, moment = require('moment')
	, log = env.logger
	, validator = require("validator")
;

module.exports = function(app, env) {
	// Because other teams are using id as mysql autoincremented id, it can be a number
	// id type

	//email type
	zSchema.registerFormat('email', function(str) {
		return validator.isEmail(str);
	});

	// validte timestamp because offer history depends on reverse chronology
	zSchema.registerFormat('unixTimestamp', function(num) {
		if (!moment(num).isValid()) return false;
		return true;
	});

	objectSchemaValidator = new zSchema({
		assumeAdditional: true,
		noEmptyArrays: true,
		noEmptyStrings: true
	});

	// post user schema
	success = objectSchemaValidator.validateSchema(objectSchemas.postUserSchema);
	if(!success) return log.error("Error from z-schma in compiling postUserSchema.");		

	log.log("Successfully loaded objectSchemas.");

	// populate env
	env.postUserSchema = objectSchemas.postUserSchema[0];
	env.objectSchemaValidator = objectSchemaValidator;
}