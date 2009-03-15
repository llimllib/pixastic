Pixastic.Actions.edge = {
  each_3x3 : function(data, w, h, visit, avg_function) {
    var w4 = w*4;
    var y = h;
    var end = w4*h;
    do {
      var offtopY = (y-2)*w4;
      var offsetY = (y-1)*w4;
      var offbotY = y*w4;
      var x = w;
      do {
        var offtop = offtopY + (x-1)*4;
        var offset = offsetY + (x-1)*4;
        var offbot = offbotY + (x-1)*4;
        var g = function (offset) {
          return offset > 0 && offset < end ? data[offset] : 0;
        }
        var newval = visit(g(offtop-4), g(offtop), g(offtop+4),
                           g(offset-4), g(offset), g(offset+4),
                           g(offbot-4), g(offbot), g(offbot+4));
        data[offset] = data[offset+1] = data[offset+2] = newval;
      } while (--x);
    } while (--y);
  },

  process : function(params) {
    if (Pixastic.Client.hasCanvasImageData()) {
      var data = Pixastic.prepareData(params);
      var rect = params.options.rect;
      var w = rect.width;
      var h = rect.height;
      var first = true;
      this.each_3x3(data, w, h, function(z1, z2, z3, z4, z5, z6, z7, z8, z9) {
        w = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
        if (first) {
          console.log("first pix: ", z1, z2, z3, z4, z5, z6, z7, z8, z9);
          console.log("result: ", w[0]*z1 + w[1]*z2 + w[2]*z3 +
               w[3]*z4 + w[4]*z5 + w[5]*z6 +
               w[6]*z7 + w[7]*z8 + w[8]*z9);

          first = false;
        }
        return w[0]*z1 + w[1]*z2 + w[2]*z3 +
               w[3]*z4 + w[4]*z5 + w[5]*z6 +
               w[6]*z7 + w[7]*z8 + w[8]*z9;
      });
      return true;
    }
  },

	checkSupport : function() {
		return Pixastic.Client.hasCanvasImageData();
	}
}
