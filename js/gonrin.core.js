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
  var id_counter = 0;
  gr_exports.unique_id = function(prefix) {
    var id = ++id_counter + '';
    return prefix ? prefix + id : id;
  };
  
  
  
  gr_exports.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
  };
  gr_exports.init = function(_$) {
    return init(_$ || $);
  };

  return gr_exports;
}));
