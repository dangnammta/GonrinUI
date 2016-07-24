(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'gonrin combobox requires jQuery to be loaded first';
        }
        factory(jQuery);
    }
}(function ($) {
	'use strict';
	var TextBox = function (element, options) {
		var gonrin = window.gonrin;
		var grobject = {},
		value,
        input,
        getValue = function(){
        	return input.val();
        };;
	
		/********************************************************************************
        *
        * Public API functions
        * =====================
        *
        * Important: Do not expose direct references to private objects or the options
        * object to the outer world. Always return a clone when returning values or make
        * a clone when setting a private variable.
        *
        ********************************************************************************/
		grobject.getValue = getValue;
       
        grobject.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            return grobject;
        };

        // initializing element and component attributes
        
        if (element.is('input') ) {
            input = element;
            value = input.val();
            element.addClass("form-control");
        } else {
            throw new Error('Cannot apply to non input, select element');
        }

    	if(!options.placeholder){
    		options.placeholder = input.attr("placeholder");
    	}
        return grobject;
	};
	
/*****************************************/
	
	$.fn.textbox = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('gonrin')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.textbox.defaults, options);
                $this.data('gonrin', TextBox($this, options));
            }
        });
    };
    $.fn.textbox.defaults = {
        text: "",
        /*The value of the widget.*/
        value: null,
        placeholder: null
    };
}));