/*
 * Different utilities, convenience functions for app
 */

var uuid = require('node-uuid')
	, moment = require('moment')
	, path = require('path')
;

module.exports = function(app, env) {
	// get a new uuid for freedoor application
	env.uuid = function() {
		return uuid.v4();
	}

	// Get a new unix timestamp to update last modified
	env.getUnixTimestamp = function() {
		return Number(moment().format("X"));
	}

 }