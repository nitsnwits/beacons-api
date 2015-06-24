/*
	salesman main server file
*/

var express = require('express');
var app = module.exports = express();
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
app.locals.bunyan = require('bunyan');
app.locals.config = require('config'); // set config to locals, read from config/default.js
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var log = app.locals.bunyan.createLogger({name: 'server'});
app.use(express.static(path.join(__dirname, 'public'))); // only public directory will be serve static content

// TODO: fix views forr angular
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.enable('view cache');
app.engine('html', require('hogan-express'));

// initialization
require('./config/init/cache')(app);
require('./config/init/utils')(app);
require('./config/init/errors')(app);
require('./config/init/routes')(app);
require('./config/init/db')(app);
require('./config/init/aws')(app);

// application server start
server = http.createServer(app);
server.listen(app.locals.config.server.port, app.locals.config.server.ip);
log.info("Salesman Server listening on port " + app.locals.config.server.port);
