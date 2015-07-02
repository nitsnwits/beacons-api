/*
  products controller
 */

var app = require('../../server'); // circular dependency to read app.locals
var products = require('../../lib/semantics-client').createClient();
var log = app.locals.bunyan.createLogger({name: 'productsController'});


// @GET Search products based on a query
module.exports.searchProducts = function(req, res) {
  if (!req.query.query) {
    log.info('No query to search for products');
    return res.status(400).send(app.locals.errors.code400);
  }
  products.search(req.query.query, function(err, products) {
    if (err) {
      log.warn('Error getting products', err);
      return res.status(500).send(app.locals.errors.code500);
    }
    return res.status(200).send(products);
  });
}