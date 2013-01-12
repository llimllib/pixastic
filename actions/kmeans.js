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

  //find <k> means in image data <data> with width <w> and height <h>. Assume a 3d space.
  k_means : function(k, data, w, h) {
    var centroids = [];
    for (var i=0; i < k; i++) {
      //choose a random pixel as a centroid
      var pix = Math.round(Math.random()*w*h);
      var offset = pix*4;
      centroids.push([data[offset], data[offset+1], data[offset+2]]);
    }

    var max_iter = 100;
    var loop_iter = 0;
    while(loop_iter < max_iter) {
      loop_iter += 1;
      console.log("looping centroids ", JSON.stringify(centroids));
      var w4 = w*4;
      var y = h;

      //create k classes in which to store the pixels which have been
      //classified. A pixel in class i is closest to centroid i.
      var classes = [];
      for (var i=0; i < k; i++) {
        classes.push([]);
      }

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
          for (var i=0; i < k; i++) {
            var centroid = centroids[i];
            var dist = this.euc_dist(pixel, centroid);
            if (dist < mindist) {
              mindist = dist;
              minc = i;
            }
          }

          //store the pixel in the class of its closest centroid
          //classes[minc].push(pixel);
          classes[minc].push(pixel);
        } while (--x);
      } while (--y);

      //if any of the classes are empty, try new centroids. We can't sensibly continue (?)
      var new_centroids = false;
      for (var i=0; i < k; i++) {
        if (classes[i].length == 0) {
          new_centroids = true;
          centroids = [];
          for (var i=0; i < k; i++) {
            //choose a random pixel as a centroid
            var pix = Math.round(Math.random()*w*h);
            var offset = pix*4
            centroids.push([data[offset], data[offset+1], data[offset+2]]);
          }
        }
      }

      if (new_centroids) continue;

      //calculate the new centroids. For each class, sum up the r, g, and b values, then
      //average them. The resulting center of mass is the new centroid.
      var new_centroids = [];
      for (var klass=0; klass < k; klass++) {
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
      params.options["centroids"] = this.k_means(3, data, w, h);
      return params["centroids"];
    }
  },

  checkSupport : function() {
    return Pixastic.Client.hasCanvasImageData();
  }
}
