//don't like the text links, change to drop down navication

//create a select and append to menu
var $select = $('<select></select>');
$('#nested').append($select);
//cycle over menu links
$("#nested a").each(function(){
  var $anchor = $(this);
//create an option
  var $option = $("<option></option>");

//selected options depending on current page
if($anchor.parent().hasClass('selected')) {
  $option.prop('selected', true);
}
//options value is the href of the link
  $option.val($anchor.attr('href'));
//options text is the text of link
  $option.text($anchor.text());
//append option to select
  $select.append($option);
});

//bind change listener to select
  $select.change(function(){
    //go to select's location
      window.location = $select.val();
  });
















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