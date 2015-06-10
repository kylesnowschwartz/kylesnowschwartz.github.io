$(document).ready(function() {

  function RunConway() {
    var conway = new Conway(65);
    conway.renderGrid();
    var time = setInterval( function () {
      conway.updateNeighborsForAllCells();
      conway.updateAllCells();
    }, 100);
  }

  $(document).on('click', '.refresh-conway', function (e) {
    $('#grid').html('');
    RunConway();
  });

  RunConway();

});


// when we resize the window, we want to change the width and height of each cell,
// we want to make the row height to equal cell height
  // var windowWidth = $(window).width();
  // var cellSize = windowWidth / 100;
  // $('.cell').width(cellSize);
  // $('.cell').height(cellSize);
  // $('.row').height(cellSize);

  // $(window).resize(function() {
  //   var windowWidth = $(window).width();
  //   var cellSize = windowWidth / 50;
  //   $('.cell').width(cellSize);
  //   $('.cell').height(cellSize);
  //   $('.row').height(cellSize);
  // });
