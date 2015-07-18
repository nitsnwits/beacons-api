
function mapCategory(categoryName) {
  var categories = JSON.parse(localStorage.getItem('categories'));
  var categoryId = '';
  categories.forEach(function(elem, index, array) {
    if (elem.name == categoryName) {
      categoryId = elem.categoryId;
    }
  });
  return categoryId;
}

function submitProduct() {
  $('#submit').click(function() {
    var product = {
      name: $('#name').val(),
      description: $('#description').val(),
      categoryId: mapCategory($('#categorySelect').val()),
      price: $('#price').val()
    }
    console.log('photo: ' + $('#photo').val());
    console.log('product: %j', product);
    $.ajax({
      url: '/api/v1/products',
      type: 'POST',
      dataType: 'json',
      contentType:"application/json; charset=utf-8",
      data: JSON.stringify(product),
      success: function(json) {
        console.log('POST Products result: %j', json);
        var productId = json.productId;
        var file = document.getElementById('photo').files[0];
        console.log('file : ' + file);
        $.ajax({
          url: '/api/v1/products/' + productId + '/photo',
          type: 'POST',
          dataType: 'image/png',
          contentType: 'image/png',
          data: file,
          processData: false,
          success: function(json) {
            console.log('POST photo result: %j', json);
            alert('Product created successfully');
          }
        });
        alert('Product created successfully with productId: ' + json.productId);
        location.reload();
      }
    });
  });  
}


function getReady() {
  submitProduct();
  $.ajax({
    url:'/api/v1/categories',
    type:'GET',
    dataType: 'json',
    success: function( json ) {
      function parseCategory(elem, index, array) {
        $('#categorySelect').append($('<option>').text(elem.name).attr('value', elem.name));
      }
      json.forEach(parseCategory);
      localStorage.setItem('categories', JSON.stringify(json));
    }
  });
}