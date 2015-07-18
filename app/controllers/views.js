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
  return res.render('Product.html');
}