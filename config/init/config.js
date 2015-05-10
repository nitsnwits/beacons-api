/*

	Read configuration file and set it to env
	
*/

var fs = require('fs')
;

module.exports = function(app, env) {
	// get cwd from node's process
	var cwd = process.cwd();
	var config = fs.readFileSync( cwd + '/config/config.json', 'utf8');
	// set the parsed config json object to env for global access
	env.config = JSON.parse(config);
}