const util = require("util");
const Chart = require("./chart");

const Line = function () {
  this.initialize();
};

util.inherits(Line, Chart);

Line.prototype.initialize = function () {
  Line.super_.prototype.initialize.call(this);

  this.type = "line";
  this.lineType = "normal";
  this.lineStyles = [];
  this.setAutoScaling();
  this.axisRanges = {};
};

Line.prototype.addData = function (
  data,
  label,
  color,
  thickness,
  dashLength,
  spaceLength
) {
  const style = {};

  if (thickness) {
    style.thickness = thickness;
  }

  if (dashLength) {
    style.line = dashLength;
  }

  if (spaceLength) {
    style.space = spaceLength;
  }

  this.lineStyles.push(style);

  Line.super_.prototype.addData.call(this, data, label, color);
};

Line.prototype.getLineStyles = function () {
  return this.lineStyles;
};

Line.prototype.setSparklines = function () {
  this.lineType = "sparklines";
};

Line.prototype.isSparklines = function () {
  return this.lineType === "sparklines";
};

Line.prototype.setXY = function () {
  this.lineType = "xy";
};

Line.prototype.isXY = function () {
  return this.lineType === "xy";
};

Line.prototype.setAxisRange = function (axis, start, end, step) {
  const range = {
    start: start,
    end: end,
  };

  if (step) {
    range.step = step;
  }

  this.axisRanges[axis] = range;
};

module.exports = Line;
