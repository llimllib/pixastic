Pixastic.Actions.kmeans = {
  //return whether or not two arrays of 3 3d arrays are equal by value
  threequal : function(a1, a2) {
    return (a1[0][0] == a2[0][0] && a1[0][1] == a2[0][1] && a1[0][2] == a2[0][2] &&
            a1[1][0] == a2[1][0] && a1[1][1] == a2[1][1] && a1[1][2] == a2[1][2] &&
            a1[2][0] == a2[2][0] && a1[2][1] == a2[2][1] && a1[2][2] == a2[2][2])
  },

  //calculate the distance between two 3d points
  euc_dist : function(p1, p2) {
    return Math.sqrt(Math.pow(p1[0]-p2[0], 2) +
                     Math.pow(p1[1]-p2[1], 2) +
                     Math.pow(p1[2]-p2[2], 2));
  },

  k_means : function(data, w, h) {
    var centroids = [[255,0,0],[0,255,0],[0,0,255]];

    while(1) {
      console.log("looping centroids ", JSON.stringify(centroids));
      var w4 = w*4;
      var y = h;

      var classes = [[], [], []];
      do {
        var offsetY = (y-1)*w4;
        var x = w;
        do {
          var offset = offsetY + (x-1)*4;
          //the pixel we're currently inspecting
          var pixel = [data[offset], data[offset+1], data[offset+2]];

          //the minimum distance from the pixel to a centroid
          var mindist = Number.MAX_VALUE;

          //the index of the minimum centroid
          var minc = null;

          //for each centroid, calculate the distance from the pixel
          for (var i=0; i < 3; i++) {
            var centroid = centroids[i];
            var dist = this.euc_dist(pixel, centroid);
            if (dist < mindist) {
              mindist = dist;
              minc = i;
            }
          }

          //if (!minc) {
          //  console.log(pixel, JSON.stringify(centroids));
          //}

          //store the pixel in the class of its closest centroid
          //classes[minc].push(pixel);
          try {
            classes[minc].push(pixel);
          } catch(err) {
            console.log(classes, minc, i, dist, pixel, centroid, offset);
            throw err;
          }
        } while (--x);
      } while (--y);

      //copy the old centroids
      var new_centroids = [];
      //calculate the new centroids
      for (var klass=0; klass < 3; klass++) {
        var sums = [0,0,0];
        var n = 0;
        for (var point=0; point < classes[klass].length; point++) {
          sums[0] += classes[klass][point][0];
          sums[1] += classes[klass][point][1];
          sums[2] += classes[klass][point][2];
          n += 1;
        }
        new_centroids[klass] = [Math.round(sums[0]/n),
                                Math.round(sums[1]/n),
                                Math.round(sums[2]/n)];
      }
      console.log("new centroids ", JSON.stringify(new_centroids));

      if (this.threequal(centroids, new_centroids)) {
        break;
      }

      centroids = new_centroids;
    }

    return centroids;
  },

  process : function(params) {
    if (Pixastic.Client.hasCanvasImageData()) {
      var data = Pixastic.prepareData(params);
      var rect = params.options.rect;
      var w = rect.width;
      var h = rect.height;
      params.options["centroids"] = this.k_means(data, w, h);
      console.log("setting centroids ", params);
      return params["centroids"];
    }
  },

  checkSupport : function() {
    return Pixastic.Client.hasCanvasImageData();
  }
}
