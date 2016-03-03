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
  var grexports = {};
  
  /*gr_exports.removeLocale = function(name) {
    delete locales[name];

    return gr_exports;
  };*/
  var idCounter = 0;
  grexports.uniqueId = function(prefix) {
	  var id = ++idCounter + '';
	  return prefix ? prefix + id : id;
  };
  
  grexports.uuid = function() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		  var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		  return v.toString(16);
	  });
  };
  
//By default, Gonrin uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  grexports.templateSettings = {
		  evaluate    : /{%([\s\S]+?)%}/g,
		  interpolate : /{{([\s\S]+?)}}/g,
		  escape      : /{{-([\s\S]+?)}}/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };
  

  	grexports.template = function(text, settings, oldSettings) {
	  
		  if (!settings && oldSettings) settings = oldSettings;
	    //settings = gonrin.defaults({}, settings, gonrin.template_settings);
		  settings = $.extend({}, settings, grexports.templateSettings);
	  
	    // Combine delimiters into one regular expression via alternation.
		  var matcher = RegExp([
		       (settings.escape || noMatch).source,
		       (settings.interpolate || noMatch).source,
		       (settings.evaluate || noMatch).source
		  ].join('|') + '|$', 'g');
	
	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;
	
	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }
	
	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";
	
	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';
	
	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';
	
	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }
	
	    var template = function(data) {
	      return render.call(this, data, _);
	    };
	
	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';
	
	    return template;
  	};
  
  
  
  	grexports.init = function(_$) {
  		return init(_$ || $);
  	};
  
  
  

  	return grexports;
}));
