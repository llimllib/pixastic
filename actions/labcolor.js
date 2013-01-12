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
