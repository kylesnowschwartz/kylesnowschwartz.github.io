function Cell () {
  this.$element = $("<div class='cell'></div>");
  this.neighbors = 0;
  this.playRussianRoulette();
}

Cell.prototype.playRussianRoulette = function () {
  if (Math.random() > 0.8) {
    this.resurrect();
  }
};

Cell.prototype.kill = function() {
  this.$element.removeClass('alive');
};

Cell.prototype.resurrect = function() {
  this.$element.addClass('alive');
};

Cell.prototype.isAlive = function () {
  return this.$element.hasClass('alive');
}