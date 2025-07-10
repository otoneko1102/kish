const util = require("util");
const Chart = require("./chart");

const Pie = function () {
  this.initialize();
};

util.inherits(Pie, Chart);

Pie.prototype.initialize = function () {
  Pie.super_.prototype.initialize.call(this);

  this.type = "pie";
  this.moreDs = false;
  this.setAutoScaling();
};

Pie.prototype.set3D = function () {
  this.moreDs = true;
};

Pie.prototype.setLabel = function (data) {
  this.labels = data;
};

Pie.prototype.addPercent = function () {
  let sum = 0;
  this.data.forEach(function (s) {
    sum = sum + s.values;
  });
  const percent = [];
  this.data.forEach(function (s) {
    const value = Math.round((s.values / sum) * 10000) / 100;
    percent.push(value + "%");
  });
  this.setLabel(percent);
};

Pie.prototype.getLabel = function () {
  return this.labels;
};

Pie.prototype.is3D = function () {
  return this.moreDs;
};

module.exports = Pie;
