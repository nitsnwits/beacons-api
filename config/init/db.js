/*
	set up database connection
 */

var mongoose = require('mongoose');
module.exports = function(app) {
	mongoose.connect(app.locals.config.database.mongo.url);
}
