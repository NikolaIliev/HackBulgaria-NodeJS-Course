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

  $("#files").on('change', function (event) {
    test = event.target.files[0];
  });
});