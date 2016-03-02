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
		dataBound = false,
		textElement = false,
		unset = true,
        input,
        menuTemplate = '<ul class="ref-selection-multiple"></ul>',
        itemTemplate =  '<li class="ref-selection-choice"></li>',
        component = false,
        widget = false,  //dialogView
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
        setupWidget = function () {
			if ((!!options.dataSource) && (typeof options.dataSource === "string")) {

				require([ options.dataSource ], function ( RefView ) {
					widget = new RefView({selectionMode: options.selectionMode});
					options.textField = options.textField || widget.textField;
					options.valueField = options.valueField || widget.valueField;
					
					if(!!input.val()){
						if(widget.selectionMode === "single"){
							var value = input.val();
			            	var model = widget.model || null;
			            	if(model){
			            		model.set(options.valueField, value);
								model.fetch({
				                    success: function (data) {
				                    	textElement.text(model.get(options.textField));
				                    },
				                    error:function(){},
								});
			            	}
						}
						if(widget.selectionMode === "multiple"){
							var value = $.parseJSON(input.val());
			            	//var model = widget.model || null;
			            	
			            	if(value){
			            		$.each(value, function(key, item){
			            			var txt = item[options.textField];
			            			$(itemTemplate).html(txt).appendTo(textElement.find("ul"));
			            		})
			            		
			            	}
						}
		            	
		            }
					
		    	});
			};
			
			//show dialog
            
			return gonrin;
		},
		show = function () {
        	if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly'))) {
                return gonrin;
            };
            if(widget){
            	widget.dialog({
            		success: function(){
            			if((!!widget)&&(!!widget.selectedItems)&&(widget.selectedItems.length > 0)){
            				var seleted = widget.selectedItems;
            				if(widget.selectionMode === "single"){
            					textElement.text(seleted[0][options.textField]);
                				input.val(seleted[0][options.valueField]);
                				//console.log(seleted[0]);
                				notifyEvent({
                					type:"change.gonrin",
                					value : seleted[0]
                				});
                				// trigger here
                				//input.trigger('change.gonrin', seleted[0]);
            				}
            				if(widget.selectionMode === "multiple"){
            					//textElement.html(JSON.stringify(seleted));
            					textElement.find("ul").empty();
    			            	$.each(seleted, function(key, item){
    			            		var txt = item[options.textField];
    			            		$(itemTemplate).html(txt).appendTo(textElement.find("ul"));
    			            	});
    			            	input.val(JSON.stringify(seleted));
    			            	
    			            	notifyEvent({
                					type:"change.gonrin",
                					value : seleted
                				});
    			            	//input.trigger('change.gonrin');
            				}
            			}
            		}
            	})
            }
            /*notifyEvent({
                type: 'show.gonui'
            });*/
            return gonrin;
        },
        notifyEvent = function (e) {
            if ((e.type === 'change.gonrin')  && ((e.value && (e.value === e.oldValue)) || (!e.value && !e.oldValue))) {
                return;
            }
            element.trigger(e);
        },
        hide = function(){
            return gonrin;
        },
        
        toggle = function () {
            /// <summary>Shows or hides the widget</summary>
            //return (widget.is(':hidden') ? show() : hide());
        	return show();
        },
		attachElementEvents = function () {
        	if(options.onChange){
        		element.bind("change.gonrin", options.context !== null ? $.proxy(options.onChange, options.context ) : options.onChange);
        	}

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
            textElement = $('<span class="form-control ref-form-control">');
            if(options.selectionMode === "multiple"){
            	var selectRender = $(menuTemplate).appendTo(textElement);
            	
            }
            element.before(textElement);
            element.css("display", "none");
        } else {
            throw new Error('Cannot apply to non input element');
        }
        
        
    	if (input.is('input'))  {
        	setupWidget();
        	if(!options.placeholder){
        		options.placeholder = input.attr("placeholder");
        	}
        	if(textElement && options.placeholder){
        		textElement.attr("placeholder", options.placeholder);
        	}
        	
        };
        
        attachElementEvents();
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
               
                console.log(options);
                $this.data('gonrin', GonrinRef($this, options));
            }
        });
    };

    $.fn.gonrinref.defaults = {
    	context: null,
    	//template: null,
    	//height: null,
    	/*placeholder: null,
    	ignore_readonly: false,*/
    	selectionMode: "single",
    	debug: false,
    	//hasMany: false,
    	textField: null,
        valueField: null,
        dataSource: null,
        selectedItems: [],
        onChange : function(){}
    };
}));