require.config({
  paths: {
    "jquery": "../bower_components/jquery/dist/jquery"
  },
  shim: {
    "bootstrap": {
        "deps": ["jquery"]
    }
  }
});

require(["jquery"], function($) {
  "use strict";

  var canvas = $("#canvas")[0],
    resultCanvas = $("#result-canvas")[0];

  function createImage(event) {
    var img = new Image();
    img.onload = onLoadImage;
    img.src = event.target.result;
  }

  function onLoadImage(event) {
    canvas.width = event.target.width;
    resultCanvas.width = event.target.width;
    canvas.height = event.target.height;
    resultCanvas.height = event.target.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(event.target, 0, 0);
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(imageData);
    $.ajax({
      type: "POST",
      url: "http://localhost:3010/applyFilter",
      data: {
        "imageData": imageData
      }
    }).done(function (data) {
      var ctx = resultCanvas.getContext('2d');
      console.log(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      imageData.data.set(new Uint8ClampedArray(data));
      ctx.putImageData(imageData, 0, 0);
    });
  }

  $("#files").on('change', function (event) {
    var file = event.target.files[0],
      fr = new FileReader();
      fr.onload = createImage;
      fr.readAsDataURL(file);
  });
});