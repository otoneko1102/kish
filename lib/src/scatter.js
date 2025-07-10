const util = require("util");
const Chart = require("./chart");

const Scatter = function () {
  this.initialize();
};

util.inherits(Scatter, Chart);

Scatter.prototype.initialize = function () {
  Scatter.super_.prototype.initialize.call(this);

  this.type = "scatter";
};

module.exports = Scatter;
