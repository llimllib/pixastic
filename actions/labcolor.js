Pixastic.Actions.lab = {
  // Convert rgb to sRGB then to xyz, as per
  // http://www.imagemagick.org/www/command-line-options.html
  // inspired by:
  // https://github.com/mbostock/d3/blob/master/src/core/rgb.js
  rgb2xyz : function(r, g, b) {
    //first to sRGB
    r = (r / 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = (g / 255) <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = (b / 255) <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    //now to XYZ
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    // 0.4124564  0.3575761  0.1804375
    // 0.2126729  0.7151522  0.0721750
    // 0.0193339  0.1191920  0.9503041
    //
    // and to D65 white point, as specified in:
    // http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
    //
    // I'm doing this part because it's what d3 does. I'm not exactly
    // clear on what it means, but I trust them. thank you guys.
    return [
      (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.950470,
      (0.2126729 * r + 0.7151522 * g + 0.0721750 * b),
      (0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / 1.088830
    ];
  },

  //http://www.brucelindbloom.com/index.html?Eqn_XYZ_to_Lab.html
  xyz2lab : function(x, y, z) {
    return [
      116 * y - 16,
      500 * (x - y),
      200 * (y - z)
    ];
  },

  rgb2lab : function(r, g, b) {
    return this.xyz2lab(this.rgb2xyz(r, g, b));
  },

  lab2xyz : function(l, a, b) {
    var y = (l + 16) / 116,
        x = y + a / 500,
        z = y - b / 200;
    return [x, y, z];
  },

  xyz2rgb : function(x, y, z) {
    // from xyz to sRGB? Maybe? The corrections at the end are to shift us out of
    // D65. Maybe. Really just taking D3's word on it.
    x = (x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037) * 0.950470;
    y = y > 0.206893034 ? y * y * y : (y - 4 / 29) / 7.787037;
    z = (z > 0.206893034 ? z * z * z : (z - 4 / 29) / 7.787037) * 1.088830;

    //now from xyz to sRGB
    var r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z,
        g = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z,
        b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

    //then to RGB and return
    return [
      Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055)),
      Math.round(255 * (g <= 0.00304 ? 12.92 * g : 1.055 * Math.pow(g, 1 / 2.4) - 0.055)),
      Math.round(255 * (b <= 0.00304 ? 12.92 * b : 1.055 * Math.pow(b, 1 / 2.4) - 0.055))
    ];
  },

  lab2rgb : function(l, a, b) {
    return this.xyz2rgb(this.lab2xyz(l, a, b));
  },

  process : function(params) {
    var data = Pixastic.prepareData(params);

    var newData = [];

    var rect = params.options.rect;
    var p = rect.width * rect.height;

    while (p--) {
      //the index into the pixel array is p*4
      i = p*4;
      lab = this.xyz2lab(data[i], data[i+1], data[i+2]);

      newData[i]   = lab[0];
      newData[i+1] = lab[1];
      newData[i+2] = lab[2];

      //keep alpha data intact
      newData[i+3] = data[i+3];
    }

    params.options["lab_pixels"] = newData;
  },

  checkSupport : function() {
    return Pixastic.Client.hasCanvasImageData();
  }
}
