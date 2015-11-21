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
            throw 'gonui.combobox requires jQuery to be loaded first';
        }
        factory(jQuery);
    }
}(function ($) {
	'use strict';
	var ComboBox = function (element, options) {
		var combo = {},
		value,
		text,
		data, //datalist
		index = -1,
		textElement = false,
		unset = true,
        input,
        menuTemplate = '<ul class="typeahead typeahead-long dropdown-menu"></ul>',
        itemTemplate =  '<li><a href="javascript:void(0)"></a></li>',
        component = false,
        widget = false,
		keyMap = {
                'up': 38,
                38: 'up',
                'down': 40,
                40: 'down',
                'left': 37,
                37: 'left',
                'right': 39,
                39: 'right',
                'tab': 9,
                9: 'tab',
                'escape': 27,
                27: 'escape',
                'enter': 13,
                13: 'enter',
                //'pageUp': 33,
                //33: 'pageUp',
                //'pageDown': 34,
                //34: 'pageDown',
                //'shift': 16,
                //16: 'shift',
                //'control': 17,
                //17: 'control',
                'space': 32,
                32: 'space',
                //'t': 84,
                //84: 't',
                'delete': 46,
                46: 'delete'
        },
        keyState = {},
        

        /********************************************************************************
         *
         * Private functions
         *
         ********************************************************************************/
        setup_data = function(){
			data = options.data_source;
		},
        setup_widget = function () {
			if (options.data_source) {
				widget = $(menuTemplate);
				if(component){
					component.before(widget);
				}
				//getdata_source json from HTTP
				//setup_data();
				data = options.data_source;
				$.each(data, function (idx, item) {
					
					if((options.data_value_field != null) && (options.data_text_field != null)){
						if (typeof item == 'object') {
							var $item = $(itemTemplate);
							$item.find('a').text(item[options.data_text_field]);
							if(value == item[options.data_value_field]){
								set_value(item[options.data_value_field]);
							}
							widget.append($item);
							$item.bind("click", function(){
								set_value(item[options.data_value_field]);
								hide();
							});
						}
					}else{
						if (typeof item == 'string') {
							var $item = $(itemTemplate);//.text(item);
							$item.find('a').text(item);
							widget.append($item);
							$item.bind("click", function(){
								set_value(item, item);
								hide();
							});
						}
					}
				});
				//setup width and height
				if(element.parent().length === 0){
					widget.css("width", element.outerWidth());
				}else{
					widget.css("width", element.parent().outerWidth());
				}
				widget.hide();
            }
			return combo;
        },
        get_value = function(){
        	return value;
        },
        get_text = function(){
        	return text;
        },
        get_index = function(){
        	return index;
        },
        set_value = function (val) {
        	var oldvalue = value;
        	value = val;
        	function set_text(txt){
        		if(textElement){
        			text = txt;
            		textElement.val(txt);
            	}
        	};
        	if(data && (data.length > 0)){
        		var txt = null;
        		for(var i = 0; i < data.length; i++){
        			var item = data[i];
        			if((options.data_value_field != null) && (options.data_text_field != null)){
        				if(value == item[options.data_value_field]){
        					txt = item[options.data_text_field];
        					set_text(txt);
        					index = i;
        					input.val(value);
        					widget.find('li').removeClass("active");
        	        		$(widget.find('li')[i]).addClass("active");
        	        		notifyEvent({
        	                    type: 'change.gonui',
        	                    value: value,
        	                    oldValue: oldvalue
        	                });
        	        		
        					return;
        				}
        			}else{
        				if(value == item){
        					index = i;
        					set_text(txt);
        					input.val(value);
        					widget.find('li').removeClass("active");
        	        		$(widget.find('li')[i]).addClass("active");
        	        		notifyEvent({
        	                    type: 'change.gonui',
        	                    value: value,
        	                    oldValue: oldvalue
        	                });
        	        		
        					return;
        				}
        			};
        			
        		}
        		
        	}
        },
        set_index = function(idx){
        	if(data && (data.length > 0) && (data.length > idx)){
        		var item = data[idx];
        		var oldvalue = value;
        		var txt,val;
        		if((options.data_value_field != null) && (options.data_text_field != null)){
        			txt = item[options.data_text_field];
        			val = item[options.data_value_field];
        		}else{
        			txt = item;
        			val = item;
        		}
    			if(textElement){
        			text = txt;
            		textElement.val(txt);
            	};
				index = idx;
				input.val(val);
				value = val;
				widget.find('li').removeClass("active");
        		$(widget.find('li')[idx]).addClass("active");
        		notifyEvent({
                    type: 'change.gonui',
                    value: val,
                    oldValue: oldvalue
                });
				return;
        	}
        },
        data_to_options = function () {
            var eData,
                data_options = {};

            /*if (element.is('input') || options.inline) {
                eData = element.data();
            } else {
                eData = element.find('input').data();
            }

            if (eData.dateOptions && eData.dateOptions instanceof Object) {
                dataOptions = $.extend(true, dataOptions, eData.dateOptions);
            }

            $.each(options, function (key) {
                var attributeName = 'date' + key.charAt(0).toUpperCase() + key.slice(1);
                if (eData[attributeName] !== undefined) {
                    dataOptions[key] = eData[attributeName];
                }
            });*/
            return data_options;
        },
        show = function () {
        	if (input.prop('disabled') || (!options.ignore_readonly && input.prop('readonly')) || widget.is(':visible')) {
                return combo;
            };
            
            //$(window).on('resize', place);
            widget.on('mousedown', false);
            
            widget.show();
            notifyEvent({
                type: 'show.gonui'
            });
            return combo;
        },
        hide = function(){
        	if (widget.is(':hidden')) {
                return combo;
            }
        	//$(window).off('resize', place);
        	//widget.off('click', '[data-action]');
            widget.off('mousedown', false);
            widget.hide();
            
            notifyEvent({
                type: 'hide.gonui',
                value: value
            });
            return combo;
        },
        
        toggle = function () {
            /// <summary>Shows or hides the widget</summary>
            return (widget.is(':hidden') ? show() : hide());
        },
        notifyEvent = function (e) {
            if ((e.type === 'change.gonui')  && ((e.value && (e.value === e.oldValue)) || (!e.value && !e.oldValue))) {
                return;
            }
            element.trigger(e);
        },
        attach_element_events = function () {
            /*input.on({
                'change': change,
                'blur': options.debug ? '' : hide,
                'keydown': keydown,
                'keyup': keyup,
                'focus': options.allowInputToggle ? show : ''
            });*/

            /*if (element.is('input')) {
                input.on({
                    'focus': show
                });
            };*/
            
            if (component) {
                component.on('click', toggle);
                component.on('mousedown', false);
            }
            if(widget){
            	
            }
        },
        detachElementEvents = function () {
            /*input.off({
                'change': change,
                'blur': blur,
                'keydown': keydown,
                'keyup': keyup,
                'focus': options.allowInputToggle ? hide : ''
            });*/

            if (element.is('input')) {
                input.off({
                    'focus': show
                });
            }
            
            if (component) {
                component.off('click', toggle);
                component.off('mousedown', false);
            }
            if(widget){
            	
            }
        };
        
		
		
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
       
		combo.destroy = function () {
            ///<summary>Destroys the widget and removes all attached event listeners</summary>
            hide();
        };
        
        combo.toggle = toggle;
        combo.show = show;
        combo.hide = hide;
        combo.set_value = set_value;
        combo.get_value = get_value;
        combo.get_text = get_text;
        combo.set_index = set_index;
        combo.get_index = get_index;
        combo.disable = function () {
            ///<summary>Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
            ///If the widget was visible before that call it is hidden. Possibly emits dp.hide</summary>
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            if (textElement){
            	textElement.prop('disabled', true);
            }
            input.prop('disabled', true);
            return combo;
        };

        combo.enable = function () {
            ///<summary>Enables the input element, the component is attached to, by removing disabled attribute from it.</summary>
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            if (textElement){
            	textElement.prop('disabled', false);
            }
            input.prop('disabled', false);
            return combo;
        };
        
        combo.readonly = function () {
            ///<summary>Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
            ///If the widget was visible before that call it is hidden. Possibly emits dp.hide</summary>
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            if (textElement){
            	textElement.prop('readonly', true);
            }
            return combo;
        };
        
        combo.options = function (newOptions) {
            if (arguments.length === 0) {
                return $.extend(true, {}, options);
            }

            if (!(newOptions instanceof Object)) {
                throw new TypeError('options() options parameter should be an object');
            }
            $.extend(true, options, newOptions);
            $.each(options, function (key, value) {
                if (combo[key] !== undefined) {
                	combo[key](value);
                } else {
                    throw new TypeError('option ' + key + ' is not recognized!');
                }
            });
            return combo;
        };
        combo.debug = function (debug) {
            if (typeof debug !== 'boolean') {
                throw new TypeError('debug() expects a boolean parameter');
            }
            options.debug = debug;
            return combo;
        };
        combo.data_text_field = function (data_text_field) {
            if (data_text_field !== null && typeof data_text_field !== 'string') {
                throw new TypeError('data_text_field() expects a string parameter');
            }
            options.data_text_field = data_text_field;
            return combo;
        };
        combo.data_value_field = function (data_value_field) {
        	if (data_value_field !== null && typeof data_value_field !== 'string') {
                throw new TypeError('data_value_field() expects a string parameter');
            }
            options.data_value_field = data_value_field;
            return combo;
        };
        combo.placeholder = function (placeholder) {
        	if (placeholder !== null && typeof placeholder !== 'string') {
                throw new TypeError('placeholder() expects a string parameter');
            }
            options.placeholder = placeholder;
            return combo;
        };
        
        combo.data_source = function (data_source) {
            if (data_source !== null && typeof data_source !== 'object') {
                throw new TypeError('data_source() expects a object parameter');
            }
            options.data_source = data_source;
            return combo;
        };
        
        combo.index = function (idx) {
            if (typeof index !== 'number') {
                throw new TypeError('index() expects a number parameter');
            }
            options.index = idx;
            return combo;
        };
        
        combo.ignore_readonly = function (ignore_readonly) {
            if (arguments.length === 0) {
                return options.ignore_readonly;
            }
            if (typeof ignore_readonly !== 'boolean') {
                throw new TypeError('ignore_readonly () expects a boolean parameter');
            }
            options.ignore_readonly = ignore_readonly;
            return combo;
        };
        
        
        // initializing element and component attributes
        if ((element.is('input')) || (element.is('select')) ) {
            input = element;
            value = input.val();
          
            element.wrap( '<span class="input-group"></span>');
            var inputGroupSpan = element.parent();
            //inputGroupSpan.css("width", element.outerWidth());
            var componentButton = $('<span class="input-group-addon dropdown-toggle" data-dropdown="dropdown">').html('<span class="caret"></span><span class="glyphicon glyphicon-remove" style="display:none;"></span>');
            inputGroupSpan.append(componentButton);
            component = componentButton;
            textElement = $('<input class="form-control" type="text">');
            element.before(textElement);
            element.css("display", "none");
        } else {
            throw new Error('Cannot apply to non input, select element');
        }
        
        if (!options.inline && !input.is('input')) {
            throw new Error('Could not initialize ComboBox without an input element');
        }

        $.extend(true, options, data_to_options());
        
        combo.options(options);
        
        if (input.is('input'))  {
        	setup_widget();
        	if(!options.placeholder){
        		options.placeholder = input.attr("placeholder");
        	}
        	if(textElement && options.placeholder){
        		textElement.attr("placeholder", options.placeholder);
        	}
        	if((options.index) && (options.index > -1)){
        		combo.set_index(options.index);
        	}
        }
        
        attach_element_events();
        if (input.prop('disabled')) {
            combo.disable();
        }
        if (input.prop('readonly')) {
            combo.readonly();
        }
        return combo;
		
	};
	

/*****************************************/
	
	$.fn.combobox = function (options) {
		
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('combobox')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.combobox.defaults, options);
                $this.data('combobox', ComboBox($this, options));
            }
        });
    };

    $.fn.combobox.defaults = {
    	//template: null,
    	//height: null,
    	placeholder: null,
    	ignore_readonly: false,
    	debug: false,
    	data_text_field: null,
        data_value_field: null,
        data_source: null,
        index: -1,
    };
}));