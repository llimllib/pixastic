Pixastic.Actions.convolve = {
  contain : function(val, min, max) {
    return Math.max(min, Math.min(val, max));
  },

  each_3x3 : function(data, w, h, visit) {
    var w4 = w*4;
    var y = h;
    var end = w4*h;
    copy = new Uint8Array(data);
    do {
      var offtopY = (y-2)*w4;
      var offsetY = (y-1)*w4;
      var offbotY = y*w4;
      var x = w;
      do {
        var offtop = offtopY + (x-1)*4;
        var offset = offsetY + (x-1)*4;
        var offbot = offbotY + (x-1)*4;

        var z1 = x > 1 && offtop > 0 ? copy[offtop-4] : 0;
        var z2 = offtop > 0 ? copy[offtop] : 0;
        var z3 = x < w && offtop > 0 ? copy[offtop+4] : 0;

        var z4 = x > 1 ? copy[offset-4] : 0;
        var z5 = copy[offset];
        var z6 = x < w ? copy[offset+4] : 0;

        var z7 = x > 1 && offbot < end ? copy[offbot-4] : 0;
        var z8 = offbot < end ? copy[offbot] : 0;
        var z9 = x < w && offbot < end ? copy[offbot+4] : 0;

        var newval = visit(z1, z2, z3, z4, z5, z6, z7, z8, z9);
        data[offset] = data[offset+1] = data[offset+2] = this.contain(newval, 0, 255); 
      } while (--x);
    } while (--y);
  },

  process : function(params) {
    if (Pixastic.Client.hasCanvasImageData()) {
      var data = Pixastic.prepareData(params);
      var rect = params.options.rect;
      var w = rect.width;
      var h = rect.height;
      var kernel = params.options.kernel;
      if (!kernel.length == 9) {
        throw "This is not a 3x3 kernel!" + kernel;
      }
      this.each_3x3(data, w, h, function(z1, z2, z3, z4, z5, z6, z7, z8, z9) {
        return Math.abs(kernel[0]*z1 + kernel[1]*z2 + kernel[2]*z3 +
                        kernel[3]*z4 + kernel[4]*z5 + kernel[5]*z6 +
                        kernel[6]*z7 + kernel[7]*z8 + kernel[8]*z9);
      });
      return true;
    }
  },

	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}