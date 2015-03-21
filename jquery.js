//problem: the user is redirected to a dead end page with the image
//solution: create an overlay with the large image - lightbox

var $overlay = $('<div id="overlay"></div>');
var $image = $("<img>");
var $caption = $("<p></p>");

//add image to overlay
$overlay.append($image);

//add caption
$overlay.append($caption);

//add an overlay
$('body').append($overlay);

//capture the click event on a link to an image
$("#gallery a").click(function(event){
  event.preventDefault();
  var imageLocation = $(this).attr("href");
  //update overlay with the image linked in the link
  $image.attr("src", imageLocation);

  //show the overlay
  $overlay.show();

  //set caption
  var captionText = $(this).children("img").attr("alt");
  $caption.text(captionText);
});


//3. click on overlay again
  //3.1 hide the overlay
  $overlay.click(function(){
    $overlay.hide();
  });