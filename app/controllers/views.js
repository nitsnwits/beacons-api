/*
  control the view rendering
 */

module.exports.getRoot = function(req, res) {
  return res.render('Landing.html');
}

module.exports.getAdmin = function(req, res) {
  return res.render('Admin.html');
}

module.exports.getProductConsole = function(req, res) {
  return res.render('ProductConsole.html');
}

module.exports.createProduct = function(req, res) {
  return res.render('Product.html');
}

module.exports.listAllProducts = function(req, res) {
  return res.render('ListAllProducts.html');
}

module.exports.createOffer = function(req, res) {
  var productId = req.query.productId;
  return res.render('CreateOffer', {productId: productId});
}