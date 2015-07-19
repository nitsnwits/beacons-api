$(document).ready(function() {



function parseUrl() {
  var url = window.location;
  var productId = url.search.split('=')[1];
  return productId;
}

$('#submit').click(function() {
  var offer = {
    offerPrice: $('#offerPrice').val(),
    productId: parseUrl(),
    startDate: Date.parse($('#startDate').val())/1000,
    endDate: Date.parse($('#endDate').val())/1000
  }
  $.ajax({
    url: '/api/v1/offers',
    type: 'POST',
    dataType: 'json',
    contentType:"application/json; charset=utf-8",
    data: JSON.stringify(offer),
    success: function(json) {
      alert('Offer created successfully with offerId: ' + json.offerId);
      Window.location.href = '/listProducts';
    }
  });
});

})