$(document).ready(function() {
  var conway = new Conway(65);
  conway.renderGrid();

  // var windowWidth = $(window).width();
  // var cellSize = windowWidth / 100;
  // $('.cell').width(cellSize);
  // $('.cell').height(cellSize);
  // $('.row').height(cellSize);

  var time = setInterval( function () {
    conway.updateNeighborsForAllCells();
    conway.updateAllCells();
  }, 100);

  // $(window).resize(function() {
  //   var windowWidth = $(window).width();
  //   var cellSize = windowWidth / 50;
  //   $('.cell').width(cellSize);
  //   $('.cell').height(cellSize);
  //   $('.row').height(cellSize);
  // });

});


// when we resize the window, we want to change the width and height of each cell,
// we want to make the row height to equal cell height
