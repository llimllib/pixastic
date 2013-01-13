Pixastic.Actions.kmeans = {
  //return whether or not two triples 3d arrays are equal by value
  threequal : function(a1, a2) {
    return (a1[0][0] == a2[0][0] && a1[0][1] == a2[0][1] && a1[0][2] == a2[0][2] &&
            a1[1][0] == a2[1][0] && a1[1][1] == a2[1][1] && a1[1][2] == a2[1][2] &&
            a1[2][0] == a2[2][0] && a1[2][1] == a2[2][1] && a1[2][2] == a2[2][2])
  },

  //return whether or not two pairs of 2d arrays are equal by value
  twoequal : function(a1, a2) {
    return (a1[0][0] == a2[0][0] && a1[0][1] == a2[0][1] &&
            a1[1][0] == a2[1][0] && a1[1][1] == a2[1][1]);
  },

  //calculate the distance between two points. p1 and p2 are assumed to be of the same
  //length; undefined behavior results if they're not.
  euc_dist : function(p1, p2) {
    var sum_of_squares = 0;
    for (var i=0; i < p1.length; i++) {
      sum_of_squares += Math.pow(p1[i]-p2[i], 2);
    }
    return Math.sqrt(sum_of_squares);
  },

  k_means_lab_2d : function(k, data, w, h) {
    var centroids = [];
    for (var i=0; i < k; i++) {
      //choose a random pixel as a centroid
      var pix = Math.round(Math.random()*w*h);
      var offset = pix*4;
      //We're working in the l*a*b space, and we want the a and b values,
      //as they contain all the color information. Ignore the luminance by
      //using only the second and third values.
      centroids.push([data[offset+1], data[offset+2]]);
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
          var pixel = [data[offset+1], data[offset+2]];

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
            centroids.push([data[offset+1], data[offset+2]]);
          }
        }
      }

      if (new_centroids) continue;

      //calculate the new centroids. For each class, sum up the r, g, and b values, then
      //average them. The resulting center of mass is the new centroid.
      var new_centroids = [];
      for (var klass=0; klass < k; klass++) {
        var sums = [0,0];
        var n = 0;

        for (var point=0; point < classes[klass].length; point++) {
          sums[0] += classes[klass][point][0];
          sums[1] += classes[klass][point][1];
          n += 1;
        }
        new_centroids[klass] = [Math.round(sums[0]/n),
                                Math.round(sums[1]/n)];
      }
      console.log("new centroids ", JSON.stringify(new_centroids));

      if (this.twoequal(centroids, new_centroids)) {
        break;
      }

      centroids = new_centroids;
    }

    return centroids;
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
      if (params.options.hasOwnProperty("lab_pixels")) {
        data = params.options["lab_pixels"];
        params.options["centroids"] = this.k_means_lab_2d(3, data, w, h);
      } else {
        params.options["centroids"] = this.k_means(3, data, w, h);
      }
    }
  },

  checkSupport : function() {
    return Pixastic.Client.hasCanvasImageData();
  }
}
