/*
  client for retrieving data from semantics 3 website
 */

var app = require('../../../server');
var semantics = require('semantics3-node');

function Client() {
  if (this.client) {
    return;
  }
  var api_key = app.locals.config.semantics.apiKey;
  var api_secret = app.locals.config.semantics.apiSecret;  
  this.client = new semantics(api_key, api_secret);
}

Client.prototype.search = function search(query, cb) {
  this.client.products.products_field('search', query);
  this.client.products.get_products(function getProducts(err, products) {
    if (err) {
      return cb(err);
    }
    return cb(null, products);
  });
}

module.exports.createClient = function() {
  return new Client();
}