(function() {

        // Neither AMD nor CommonJS used. Use global variables.
      if (typeof jQuery === 'undefined') {
          throw 'gonrin requires jQuery to be loaded first';
      }
	// Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousGonrinCore = root.gonrin;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Gonrin object for use below.
	  var gonrin = function(obj) {
	    if (obj instanceof gonrin) return obj;
	    if (!(this instanceof gonrin)) return new gonrin(obj);
	  };

	  // Export the Gonrin object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (typeof exports !== 'undefined') {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = gonrin;
	    }
	    exports.gonrin = gonrin;
	  } else {
	    root.gonrin = gonrin;
	  }

	  // Current version.
	  gonrin.VERSION = '0.1.0';
	  
	  
	  
	  gonrin.noConflict = function() {
	    root.gonrin = previousGonrin;
	    return this;
	  };
	  
	// By default, Gonrin uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  gonrin.template_settings = {
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
	  
	
	  gonrin.template = function(text, settings, oldSettings) {
		  
		    if (!settings && oldSettings) settings = oldSettings;
		    //settings = gonrin.defaults({}, settings, gonrin.template_settings);
		    settings = $.extend({}, settings, gonrin.template_settings);
		  
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
	  
	  /*return*/
	  if (typeof define === 'function' && define.amd) {
	    define('gonrin', [], function() {
	      return gonrin;
	    });
	  }
}.call(this));