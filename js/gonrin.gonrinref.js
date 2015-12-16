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
            throw 'Gonrin Ref requires jQuery to be loaded first';
        }
        factory(jQuery);
    }
}(function ($) {
	'use strict';
	var GonrinRef = function (element, options) {
		
		
		
		
		
		var gonrin = {},
		value,
		text,
		data, //datalist
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
        setup_widget = function () {
			
			if (!!options.data_source) {
				console.log(options);
			};
			//show dialog
			return gonrin;
		},
		show = function () {
        	if (input.prop('disabled') || (!options.ignore_readonly && input.prop('readonly'))) {
                return combo;
            };
            
            if (!!options.data_source) {
            	options.data_source.dialog({
            		on_success: function(){
            			if((!!options.data_source)&&(!!options.data_source.selected_items)){
            				console.log(options.data_source.selected_items)
            				var seleted = options.data_source.selected_items;
            				textElement.val(seleted[options.data_text_field]);
            				input.val(seleted[options.data_value_field]);
            				input.trigger('change');
            			}
            			
            		},
					
				});
			};
            
            /*notifyEvent({
                type: 'show.gonui'
            });*/
            return gonrin;
        },
        hide = function(){
        	/*if (widget.is(':hidden')) {
                return gonrin;
            }
        	//$(window).off('resize', place);
        	//widget.off('click', '[data-action]');
            widget.off('mousedown', false);
            widget.hide();
            
            notifyEvent({
                type: 'hide.gonui',
                value: value
            });*/
            return gonrin;
        },
        
        toggle = function () {
            /// <summary>Shows or hides the widget</summary>
            //return (widget.is(':hidden') ? show() : hide());
        	return show();
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
        ********************************************************************************/
		gonrin.disable = function () {
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
            return gonrin;
        };
		// initializing element and component attributes
        if (element.is('input') ) {
            input = element;
            value = input.val();
          
            element.wrap( '<span class="input-group"></span>');
            var inputGroupSpan = element.parent();
            //inputGroupSpan.css("width", element.outerWidth());
            var componentButton = $('<span class="input-group-addon dropdown-toggle" data-dropdown="dropdown">').html('<span class="glyphicon glyphicon-th-list"></span><span class="glyphicon glyphicon-remove" style="display:none;"></span>');
            inputGroupSpan.append(componentButton);
            component = componentButton;
            textElement = $('<input class="form-control" type="text">');
            element.before(textElement);
            element.css("display", "none");
        } else {
            throw new Error('Cannot apply to non input element');
        }
        
        
    	if (input.is('input'))  {
        	setup_widget();
        	if(!options.placeholder){
        		options.placeholder = input.attr("placeholder");
        	}
        	if(textElement && options.placeholder){
        		textElement.attr("placeholder", options.placeholder);
        	}
        	
        };
        
        attach_element_events();
        /*if (input.prop('disabled')) {
        	gonrin.disable();
        }
        if (input.prop('readonly')) {
        	gonrin.readonly();
        }*/
		
		return gonrin;
	};
	
	
	
	
	$.fn.gonrinref = function (options) {
		
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('gonrin')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.gonrinref.defaults, options);
                $this.data('gonrin', GonrinRef($this, options));
            }
        });
    };

    $.fn.gonrinref.defaults = {
    	//template: null,
    	//height: null,
    	/*placeholder: null,
    	ignore_readonly: false,*/
    	debug: false,
    	data_text_field: null,
        data_value_field: null,
        data_source: null
    };
}));