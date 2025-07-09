const http = require("http");
const https = require("https");
const querystring = require("querystring");

let hostname = "image-charts.com";

module.exports = {
  setHostname: function (newHostname) {
    hostname = newHostname;
  },
  createUrl: function (chart, secure) {
    const qs = getQuerystring(chart);
    return (secure ? "https://" : "http://") + hostname + "/chart?" + qs;
  },
  getReq: function (chart, secure, callback) {
    const qs = getQuerystring(chart);
    const options = {
      hostname: hostname,
      path: "/chart?" + qs,
      method: "GET",
    };
    const type = secure ? https : http;
    const req = type.request(options, callback);

    return req;
  },
  getPostReq: function (chart, secure, callback) {
    const options = {
      hostname: hostname,
      path: "/chart",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencode",
      },
    };
    const type = secure ? https : http;
    const req = type.request(options, callback);
    const qs = getQuerystring(chart);
    req.write(qs);

    return req;
  },
};

function getQuerystring(chart) {
  const params = compileParams(chart);
  return querystring.stringify(params);
}

function compileParams(chart) {
  let params = {};
  params = _merge(params, processType(chart));
  params = _merge(params, processTitle(chart));
  params = _merge(params, processData(chart));
  params = _merge(params, processLineStyle(chart));
  params = _merge(params, processAxes(chart));
  params = _merge(params, processBarWidthSpacing(chart));
  params = _merge(params, processLegend(chart));
  params = _merge(params, processSize(chart));
  params = _merge(params, processBackground(chart));
  params = _merge(params, processEncoding(chart));
  params = _merge(params, processLabel(chart));
  params = _merge(params, processLabelData(chart));

  return params;
}

function processSize(chart) {
  return {
    chs: chart.width + "x" + chart.height,
  };
}

function processType(chart) {
  let cht = "";
  const type = chart.getType();
  if (type === "bar") {
    cht = "b";
    cht += chart.isVerticle() ? "v" : "h";

    if (chart.isOverlapped()) {
      cht += "o";
    } else if (chart.isStacked()) {
      cht += "s";
    } else if (chart.isGrouped()) {
      cht += "g";
    }
  } else if (type === "pie") {
    cht = "p";
    if (chart.is3D()) {
      cht += "3";
    }
  } else if (type === "line") {
    cht = "l";
    if (chart.isSparklines()) {
      cht += "s";
    } else if (chart.isXY()) {
      cht += "xy";
    } else {
      cht += "c";
    }
  } else if (type === "qrcode") {
    cht = "qr";
  }

  return {
    cht: cht,
  };
}

function processTitle(chart) {
  const params = {};

  if (!chart.title.text) {
    return {};
  }

  const title = chart.title;
  params.chtt = title.text;
  if (title.color || title.size || title.align) {
    params.chts = _compact([title.color, title.size, title.align]).join(",");
  }

  return params;
}

function processData(chart) {
  const data = chart.getData();
  if (!data || data.length === 0) {
    return {};
  }

  const params = {};
  const dataSets = [];
  const setColors = [];
  const setLabels = [];
  const setRanges = [];

  for (let i = 0, l = data.length; i < l; i++) {
    const datum = data[i];
    let values = datum.values;
    const valuesTypeof = typeof values;
    if (
      ["string", "number"].indexOf(valuesTypeof) === -1 &&
      !Array.isArray(values)
    ) {
      continue;
    }

    if (Array.isArray(values)) {
      values = values.join(",");
    }

    dataSets.push(values);

    if (datum.range) {
      setRanges.push(datum.range.join(","));
    }

    if (datum.label) {
      setLabels.push(datum.label);
    }

    if (datum.color) {
      setColors.push(datum.color);
    }
  }

  let dataSep = "|";
  if (["pie", "3DPie"].indexOf(chart.type) !== -1) {
    dataSep = ",";
  }

  params.chd = "t:" + dataSets.join(dataSep);
  params.chco = setColors.join(",");

  if (!chart.legend.disabled) {
    params.chdl = setLabels.join("|");
  }

  if (chart.axisRanges && chart.axisRanges.y) {
    params.chds = [chart.axisRanges.y.start, chart.axisRanges.y.end].join(",");
  } else if (chart.autoScaling) {
    params.chds = "a";
  } else if (setRanges.length) {
    params.chds = setRanges.join(",");
  }

  return params;
}

function processBarWidthSpacing(chart) {
  if (chart.getType() === "bar") {
    return {
      chbh: _compact(["a", chart.barSpacing, chart.barWidth]).join(","),
    };
  }

  return {};
}

function processAxes(chart) {
  let params = {
    chxt: [],
    chxl: [],
    chxr: [],
  };

  chart.axisLabels.forEach(function (item) {
    const pos = params.chxt.push(item.axis) - 1;
    if (item.label) {
      params.chxl.push(pos + ":|" + item.label.join("|"));
    }
  });

  if (chart.axisRanges) {
    Object.keys(chart.axisRanges).forEach(function (key) {
      const item = chart.axisRanges[key];
      let pos = params.chxt.indexOf(key);
      if (pos == -1) {
        pos = params.chxt.push(item.axis) - 1;
      }

      const range = [pos, item.start, item.end];
      if (item.step) {
        range.push(item.step);
      }

      params.chxr.push(range.join(","));
    });
  }

  if (params.chxt.length) {
    params.chxt = params.chxt.join(",");
  }
  if (params.chxl.length) {
    params.chxl = params.chxl.join("|");
  }
  if (params.chxr.length) {
    params.chxr = params.chxr.join("|");
  }

  return params;
}

function processLegend(chart) {
  if (chart.legend.disabled) {
    return {};
  }

  const params = {};
  const legend = chart.legend;
  if (legend.position || legend.order) {
    params.chdlp = [legend.position || "r", legend.order || "l"].join("|");
  }

  if (legend.color || legend.size) {
    if (legend.size && !legend.color) {
      throw new Error("Legend color must also be set");
    }

    params.chdls = [legend.color, legend.size].join(",");
  }

  return params;
}

function processLabelData(chart) {
  if (chart.getType() === "qrcode") {
    const ecl = chart.getErrorCorrectionLevel();
    const margin = chart.getMargin();
    if (ecl !== "L" || margin !== 4) {
      return {
        chld: [ecl, margin].join("|"),
      };
    }
  }

  return {};
}

function processLineStyle(chart) {
  if (["line", "radar"].indexOf(chart.getType()) === -1) {
    return {};
  }

  const processed = [];
  let hasStyle = false;

  const styles = chart.getLineStyles();
  styles.forEach(function (item) {
    const style = [];

    if (item.thickness) {
      style.push(item.thickness);
    }

    if (item.line) {
      style.push(item.line);
    }

    if (item.space) {
      style.push(item.space);
    }

    if (!hasStyle && style.length > 0) {
      hasStyle = true;
    }

    processed.push(style.join(","));
  });

  if (!hasStyle) {
    return {};
  }

  return {
    chls: processed.join("|"),
  };
}

function processLabel(chart) {
  const type = chart.getType();
  if (type === "qrcode") {
    return {
      chl: chart.getLabel(),
    };
  } else if (type === "pie" || type === "3DPie") {
    if (!chart.getLabel()) {
      return {};
    } else {
      return {
        chl: chart.getLabel().join("|"),
      };
    }
  }

  return {};
}

function processEncoding(chart) {
  if (chart.getType() === "qrcode") {
    const encoding = chart.getEncoding();
    if (encoding && encoding !== "L") {
      return {
        choe: encoding,
      };
    }
  }

  return {};
}

function processBackground(chart) {
  if (!chart.background) {
    return {};
  }

  const bg = chart.background;
  if (!bg.fill || !bg.color) {
    return {};
  }

  const params = {};
  params.chf = ["bg", bg.fill, bg.color].join(",");

  return params;
}

function _merge() {
  const obj = {};

  for (let i = 0, l = arguments.length; i < l; i++) {
    const rObj = arguments[i];
    for (const attrname in rObj) {
      obj[attrname] = rObj[attrname];
    }
  }

  return obj;
}

function _compact(arr) {
  return arr.filter(function (val) {
    return !(val === null || val === undefined || val === "");
  });
}
