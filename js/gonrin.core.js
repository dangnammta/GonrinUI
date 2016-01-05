(function (root, factory) {

  "use strict";
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["jquery"], factory);
  } else if (typeof exports === "object") {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("jquery"));
  } else {
    // Browser globals (root is window)
    root.gonrin = factory(root.jQuery);
  }

}(this, function init($, undefined) {

  "use strict";
  
  // our public object; augmented after our private API
  var gr_exports = {};
  
  /*gr_exports.removeLocale = function(name) {
    delete locales[name];

    return gr_exports;
  };*/
  gr_exports.init = function(_$) {
    return init(_$ || $);
  };

  return gr_exports;
}));
