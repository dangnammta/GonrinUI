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
		
		var grexport = {},
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
        refView,
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
        isBackBoneDataSource = function(source){
        	var key, _i, _len, _ref;
            _ref = ["dialog"];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              key = _ref[_i];
              if (!source[key]) {
            	  return false;
              }
            }
            return true;
        },
        setupWidget = function () {
			//var RefView = options.dataSource
			widget = options.dataSource || null;
			//check is gonrin dialog
			if ((!!widget) && isBackBoneDataSource(widget)) {

				//require([ options.dataSource ], function ( RefView ) {
					//widget = new RefView();
					
					options.textField = options.textField || widget.textField;
					options.valueField = options.valueField || widget.valueField;
					widget.uiControl.selectedItems = options.selectedItems || [];
					widget.uiControl.selectionMode = options.selectionMode || "single";
					
					if(!!input.val()){
						if(options.selectionMode === "single"){
							try{
								value = $.parseJSON(input.val());
								if(value){
									textElement.text(value[options.textField]);
								}
							} catch (error) {
								//console.log(error);
							}
						}
						if(options.selectionMode === "multiple"){
							try{
								value = $.parseJSON(input.val());
				            	if(value){
				            		$.each(value, function(key, item){
				            			var txt = item[options.textField];
				            			$(itemTemplate).html(txt).appendTo(textElement.find("ul"));
				            		});
				            	}
								if(value){
									textElement.text(value[options.textField]);
								}
							} catch (error) {
								//console.log(error);
							}
						}
		            }else{
		            	console.log(input.val() + " val");
		            	//widget.uiControl.applyRowSelections();
		            }
		    	//});
			};
			return grexport;
		},
		show = function () {
        	if (input.prop('disabled') || (!options.ignoreReadonly && input.prop('readonly'))) {
                return grexport;
            };
            if(widget){
            	//widget.uiControl.selectedItems = options.selectedItems || [];
            	widget.dialog();
            	widget.on("onSelected", function(){
            		if((!!widget) && (!!widget.uiControl) && (!!widget.uiControl.selectedItems)){
            			options.selectedItems = widget.uiControl.selectedItems;
            			
        				var seleted = widget.uiControl.selectedItems;
        				if(options.selectionMode === "single"){
        					var txt = seleted.length > 0 ? seleted[0][options.textField]: "";
        					textElement.text(txt);
            				
            				if(options.valueField){
            					value = seleted.length > 0 ? seleted[0][options.valueField]: null;
            					var inputtxt = seleted.length > 0 ? seleted[0][options.valueField]: "";
            					input.val(inputtxt);
            				}else{
            					//console.log(seleted[0]);
            					value = seleted.length > 0 ? seleted[0]: null;
            					input.val(JSON.stringify(value));
            				}
            				notifyEvent({
            					type:"change.gonrin",
            					value : value
            				});
        				}
        				if(options.selectionMode === "multiple"){
        					//textElement.html(JSON.stringify(seleted));
        					textElement.find("ul").empty();
        					var valArray = [];
			            	$.each(seleted, function(key, item){
			            		var txt = item[options.textField];
			            		$(itemTemplate).html(txt).appendTo(textElement.find("ul"));
			            		
			            		if(options.valueField){
			            			var val = item[options.valueField];
			            			valArray.push(val);
			            		}else{
			            			valArray.push(item);
			            		}
			            	});
			            	//input.val(JSON.stringify(seleted));
			            	input.val(JSON.stringify(valArray));
			            	value = valArray;
			            	notifyEvent({
            					type:"change.gonrin",
            					value : value
            				});
        				}
            		}
            	});
            }
            /*notifyEvent({
                type: 'show.gonui'
            });*/
            return grexport;
        },
        notifyEvent = function (e) {
            if ((e.type === 'change.gonrin')  && ((e.value && (e.value === e.oldValue)) || (!e.value && !e.oldValue))) {
                return;
            }
            element.trigger(e);
        },
        hide = function(){
            return grexport;
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
        },
        getValue = function(){
        	return value;
        },
        clearFilters = function(){
        	options.filters = null;
        	if(widget){
        		var colEl = widget.getCollectionElement();
        		if(colEl){
        			colEl.filter(null);
        		}
        		//widget.filters = null;
        	}
        },
		setFilters = function(filters){
        	options.filters = filters;
        	if(widget){
        		var colEl = widget.getCollectionElement();
        		if(colEl){
        			colEl.filter(options.filters);
        		}
        	}
        },
        getFilters = function(){
        	return options.filters;
        },
        clearValue = function(){
        	value = null;
        	text = null;
        	if(widget){
        		if(widget.selectionMode === "single"){
        			textElement.text("");
        			input.val("");
        		}
        		if(widget.selectionMode === "multiple"){
        			textElement.find("ul").empty();
        			input.val("");
        		}
        	}
        	
        	notifyEvent({
				type:"change.gonrin",
				value : value
			});
        	return;
        };
		
		/********************************************************************************
        *
        * Public API functions
        * =====================
        ********************************************************************************/
		grexport.disable = function () {
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
            return grexport;
        };
        grexport.getValue = getValue;
        grexport.clearValue = clearValue;
        grexport.setFilters = setFilters;
        grexport.getFilters = getFilters;
        grexport.clearFilters = clearFilters;
        
        
		// initializing element and component attributes
        if (element.is('input') ) {
            input = element;
            //value = input.val().length > 0 ? ;
          
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
        	if(textElement && !!options.placeholder){
        		textElement.attr("placeholder", options.placeholder);
        	}
        	
        };
        
        attachElementEvents();
       
		return grexport;
	};
	
	
	
	
	$.fn.ref = function (options) {
		
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('gonrin')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.ref.defaults, options);
                $this.data('gonrin', GonrinRef($this, options));
            }
        });
    };

    $.fn.ref.defaults = {
    	context: null,
    	//template: null,
    	//height: null,
    	/*placeholder: null,
    	ignore_readonly: false,*/
    	readonly : false,
    	placeholder: null,
    	selectionMode: "single",
    	selectedItems:[],
    	debug: false,
    	filters: false,
    	textField: null,
        valueField: null,
        dataSource: null,
        onChange : function(){}
    };
}));