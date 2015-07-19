function getReady() {
  $.ajax({
    url:'/api/v1/products',
    type:'GET',
    dataType: 'json',
    success: function( json ) {
      json.forEach(function(elem, index, array) {
        createCard(elem);
      });
      $('#product').remove();
    }
  });
}

function createCard(product) {
  var newProduct = $('#product').clone();
  newProduct.find('#image').attr('src', product.image);
  newProduct.find('#name').html(product.name);
  newProduct.find('#description').text('Description: ' + product.description);
  newProduct.find('#price').text('Price: ' + product.price);
  newProduct.find('#link').attr('href', '/createOffer?productId=' + product.productId);
  $('#container').append(newProduct);
}