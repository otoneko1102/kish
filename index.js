const lookup = {};
const charts = ["bar", "pie", "line", "qr"];
charts.forEach(function (item) {
  lookup[item.toLowerCase()] = require("./lib/src" + item);
});

module.exports = function (type) {
  if (!type || typeof type !== "string") {
    throw new Error("Specificy a valid chart type");
  }

  type = type.toLowerCase();
  const chart = lookup[type];

  if (!chart) {
    throw new Error("Invalid chart type - " + type);
  }

  return new chart();
};
