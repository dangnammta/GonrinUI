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
	var ComboBox = function (element, options) {
		var gonrin = window.gonrin;
		var grobject = {},
		value,
		text,
		data, //datalist
		index = -1,
		textElement = false,
		unset = true,
        input,
        menuTemplate = '<ul class="dropdown-menu" style="overflow-y:scroll; width: 100%"></ul>',
        itemTemplate =  '<li><a href="javascript:void(0)"></a></li>',
        component = false,
        widget = false,
        dataSourceType,
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
                'pageup': 33,
                33: 'pageup',
                'pagedown': 34,
                34: 'pagedown',
                'shift': 16,
                16: 'shift',
                'control': 17,
                17: 'control',
                'space': 32,
                32: 'space',
                //'t': 84,
                //84: 't',
                'delete': 46,
                46: 'delete'
        },
        keyState = {},
        _lastkey,
        _prev,
        _typing_timeout,
        /********************************************************************************
         *
         * Private functions
         *
         ********************************************************************************/
        renderData = function(){
			if($.isArray(data) && data.length > 0){
				$.each(data, function (idx, item) {
					if (typeof item === 'object') {
						dataSourceType = 'object';
						if((options.valueField != null) && (options.textField != null)){
							var $item = $(itemTemplate);
							if((!!options.template)&& (!!gonrin.template)){
								var tpl = gonrin.template(options.template);
								$item.find('a').html(tpl(item));
							}else{
								var $item = $(itemTemplate);
								$item.find('a').text(item[options.textField]);
							}
							
							if(value === item[options.valueField]){
								//setValue(item[options.valueField]);
								console.log("value " + value);
								setIndex(idx);
							}
							widget.append($item);
							$item.bind("click", function(){
								//setValue(item[options.valueField]);
								setIndex(idx);
								hide();
							});
						}
						
					}else {
						dataSourceType = 'common';
						var $item = $(itemTemplate);//.text(item);
						$item.find('a').text(item);
						widget.append($item);
						$item.bind("click", function(){
							//setValue(item);
							setIndex(idx);
							hide();
						});
					}
				});
			}
			return grobject;
		},
        setupWidget = function () {
			if (!!options.dataSource) {
				//var menu = $(menuTemplate);
				widget = $(menuTemplate);
				if(!!options.headerTemplate){
					widget.prepend($("<li>").addClass("dropdown-header").html(options.headerTemplate))
				}
				
				if(component){
					component.before(widget);
				}
				
				if($.isArray(options.dataSource)){
					data = options.dataSource;
					renderData();
				}
				if($.isPlainObject(options.dataSource)){
					if(options.auto_bind){
						console.log("bind to Ajax datasource");
					}
					//getdataSource json from HTTP
					//setup_data();
				}
				
				//setup width and height
				
				widget.css("width", (options.width !== null) ? options.width : "100%"); 
				widget.css("height", (options.height !== null) ? options.height : "auto"); 
				
				//if(!!options.height){
				//	widget.css("height",options.height);
				//}
				widget.hide();
            }
			return grobject;
        },
        getValue = function(){
        	return value;
        },
        getText = function(){
        	return text;
        },
        getIndex = function(){
        	return index;
        },
        setValue = function (val) {
        	if (value === val){
        		return;
        	}
        	if(data && (data.length > 0)){
        		var txt = null;
        		for(var i = 0; i < data.length; i++){
        			var item = data[i];
        			if(dataSourceType === 'object'){
        				if((options.valueField != null) && (options.textField != null)){
            				if(val == item[options.valueField]){
            					setIndex(i);
            					return;
            				}
            			}
        			}
        			else if(dataSourceType === 'common'){
        				if(val == item){
        					setIndex(i);
        					return;
        				}
        			};
        		}
        	}
        },
        setIndex = function(idx){
        	if(data && (data.length > 0) && (data.length > idx) && (idx > -1)){
        		var item = data[idx];
        		var oldvalue = value;
        		var txt,val;
        		if(dataSourceType === 'object'){
        			if((options.valueField != null) && (options.textField != null)){
            			txt = item[options.textField];
            			val = item[options.valueField];
            		}else{
            			return;
            		}
        		}else if(dataSourceType === 'common'){
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
				widget.find('li').not(".dropdown-header").removeClass("active");
        		$(widget.find('li').not(".dropdown-header")[idx]).addClass("active");
        		scrollToIndex(idx);
        		
        		notifyEvent({
                    type: 'change.gonrin',
                    value: val,
                    oldValue: oldvalue
                });
				return;
        	}
        },
        
        dataToOptions = function () {
            var eData,
                data_options = {};

            if (element.is('input') || options.inline) {
                eData = element.data();
            }

            if (eData.data_options && eData.data_options instanceof Object) {
            	data_options = $.extend(true, data_options, eData.data_options);
            }
            return data_options;
        },
        
        show = function () {
        	if (input.prop('disabled') || (!options.ignore_readonly && input.prop('readonly')) || widget.is(':visible')) {
                return grobject;
            };
            
            
            widget.on('mousedown', false);
            widget.show();
            
            if (options.focusOnShow && !textElement.is(':focus')) {
                textElement.focus();
            }
            
            notifyEvent({
                type: 'show.gonrin'
            });
            return grobject;
        },
        hide = function(){
        	if (widget.is(':hidden')) {
                return grobject;
            }
        	//$(window).off('resize', place);
            widget.off('mousedown', false);
            widget.hide();
            
            notifyEvent({
                type: 'hide.gonrin',
                value: value
            });
            return grobject;
        },
        
        toggle = function () {
            /// <summary>Shows or hides the widget</summary>
            return (widget.is(':hidden') ? show() : hide());
        },
        notifyEvent = function (e) {
            if ((e.type === 'change.gonrin')  && ((e.value && (e.value === e.oldValue)) || (!e.value && !e.oldValue))) {
                return;
            }
            element.trigger(e);
        },
        scroll = function (item) {
            if (!item) {
                return;
            }

            if (item[0]) {
                item = item[0];
            }

            var content = widget[0],
                itemOffsetTop = item.offsetTop,
                itemOffsetHeight = item.offsetHeight,
                contentScrollTop = content.scrollTop,
                contentOffsetHeight = content.clientHeight,
                bottomDistance = itemOffsetTop + itemOffsetHeight;

                if (contentScrollTop > itemOffsetTop) {
                    contentScrollTop = itemOffsetTop;
                } else if (bottomDistance > (contentScrollTop + contentOffsetHeight)) {
                    contentScrollTop = (bottomDistance - contentOffsetHeight);
                }

                content.scrollTop = contentScrollTop;
        },
        scrollToIndex = function(index) {
            //var item = this.element[0].children[index];
            var item = $(widget.find('li').not(".dropdown-header")[index])
            if (item) {
                scroll(item);
            }
        },
        
        move = function(e) {
            var key = e.keyCode;
            var down = key === keyMap.down;
            var pressed;
            var current;
            if (key === keyMap.up || down) {
                if (e.altKey) {
                    toggle();
                } else {
                	show();
                	current = getIndex();
                	if (!current > -1) {
                		if(down){
                			if(current < data.length - 1){
                				setIndex(current + 1);
                			}
                		} else {
                			if(current > 0){
                				setIndex(current - 1);
                			}
                		}
                	}
                	
                    /*if (!that.listView.isBound()) {
                        if (!that._fetch) {
                            that.dataSource.one(CHANGE, function() {
                                that._fetch = false;
                                that._move(e);
                            });

                            that._fetch = true;
                            that._filterSource();
                        }

                        e.preventDefault();

                        return true; //pressed
                    }*/
                	
                	
                	/*current = that._focus();

                    if (!that._fetch && (!current || current.hasClass("k-state-selected"))) {
                        if (down) {
                            that._nextItem();

                            if (!that._focus()) {
                                that._lastItem();
                            }
                        } else {
                            that._prevItem();

                            if (!that._focus()) {
                                that._firstItem();
                            }
                        }
                    }

                    if (that.trigger(SELECT, { item: that.listView.focus() })) {
                        that._focus(current);
                        return;
                    }

                    that._select(that._focus(), true);

                    if (!that.popup.visible()) {
                        that._blur();
                    }*/
                }

                e.preventDefault();
                pressed = true;
            } else if (key === keyMap.enter || key === keyMap.tab) {
                /*if (that.popup.visible()) {
                    e.preventDefault();
                }

                current = that._focus();
                dataItem = that.dataItem();

                if (!that.popup.visible() && (!dataItem || that.text() !== that._text(dataItem))) {
                    current = null;
                }

                var activeFilter = that.filterInput && that.filterInput[0] === activeElement();

                if (current) {
                    if (that.trigger(SELECT, { item: current })) {
                        return;
                    }

                    that._select(current);
                } else if (that.input) {
                    that._accessor(that.input.val());
                    that.listView.value(that.input.val());
                }

                if (that._focusElement) {
                    that._focusElement(that.wrapper);
                }

                if (activeFilter && key === keys.TAB) {
                    that.wrapper.focusout();
                } else {
                    that._blur();
                }*/

                toggle();
                pressed = true;
            } else if (key === keyMap.escape) {
                hide();
                pressed = true;
            }
            return pressed;
        },
        
        keydown = function(e) {
        	
            var key = e.keyCode;
            _lastkey = key;
            clearTimeout(_typing_timeout);
            _typing_timeout = null;
            
            if (key != keyMap.tab && !move(e)) {
            	if(options.filter === false){
            		return false;
            	}
                triggerSearch();
             }
        },
        
        change = function (e) {
            var val = $(e.target).val().trim();
            /*var parsedDate = val ? parseInputDate(val) : null;
            setValue(parsedDate);*/
        	
        	//TODO: trigger search
            e.stopImmediatePropagation();
            return false;
        },
        
        search = function(word) {
            word = typeof word === "string" ? word : textElement.val();
            var length = word.length;
            var ignoreCase = options.ignoreCase;
            var filter = options.filter;
            var field = options.textField;

            clearTimeout(_typing_timeout);

            if (!length || length >= options.minLength) {
                /*that._state = "filter";
                that.listView.filter(true);
                if (filter === "none") {
                    that._filter(word);
                } else {
                    that._open = true;
                    that._filterSource({
                        value: ignoreCase ? word.toLowerCase() : word,
                        field: field,
                        operator: filter,
                        ignoreCase: ignoreCase
                    });
                }*/
            }
        },
        triggerSearch = function() {
        	if(textElement){
        		_typing_timeout = setTimeout(function() {
                    var searchvalue = textElement.val();
                    if (_prev !== searchvalue) {
                        _prev = searchvalue;
                        search(searchvalue);
                    }
                    _typing_timeout = null;
                }, options.delay);
        	}
        },
        attachElementEvents = function () {
        	if (textElement) {
        		textElement.on({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'focus':  show,
                });
        	}
            if (component) {
                component.on('click', toggle);
                component.on('mousedown', false);
            }
            if(widget){
            	
            }
          
        },
        detach_element_events = function () {
        	if (textElement) {
        		textElement.off({
                    'change': change,
                    'blur': options.debug ? '' : hide,
                    'keydown': keydown,
                    'focus': show
                });
        	}
            
            if (component) {
                component.off('click', toggle);
                component.off('mousedown', false);
            }
            if(widget){
            	
            }
            $(document)
            .off('click.gr.combobox.data-api', '.input-group', function (e) { e.stopPropagation() })
            .off('click.gr.combobox.data-api', hide);
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
       
		grobject.destroy = function () {
            ///<summary>Destroys the widget and removes all attached event listeners</summary>
            hide();
            detach_element_events();
            widget.remove();
            element.removeData('gonrin');
        };
        
        grobject.toggle = toggle;
        grobject.show = show;
        grobject.hide = hide;
        grobject.setValue = setValue;
        grobject.getValue = getValue;
        grobject.getText = getText;
        grobject.setIndex = setIndex;
        grobject.select = setIndex;
        grobject.getIndex = getIndex;
        grobject.disable = function () {
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
            return grobject;
        };

        grobject.enable = function () {
            ///<summary>Enables the input element, the component is attached to, by removing disabled attribute from it.</summary>
            if (component && component.hasClass('btn')) {
                component.removeClass('disabled');
            }
            if (textElement){
            	textElement.prop('disabled', false);
            }
            input.prop('disabled', false);
            return grobject;
        };
        
        grobject.readonly = function () {
            ///<summary>Disables the input element, the component is attached to, by adding a disabled="true" attribute to it.
            ///If the widget was visible before that call it is hidden. Possibly emits dp.hide</summary>
            hide();
            if (component && component.hasClass('btn')) {
                component.addClass('disabled');
            }
            if (textElement){
            	textElement.prop('readonly', true);
            }
            return grobject;
        };
        
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
        if ((element.is('input')) || (element.is('select')) ) {
            input = element;
            //value = input.val();
        
            var inputGroupSpan;
            var parentEl = element.parent();
            
            if(parentEl.is('div') && parentEl.hasClass('input-group') && parentEl.hasClass('combobox-group')){
            	inputGroupSpan = parentEl;
            }else{
            	element.wrap( '<div class="input-group combobox-group"></div>' );
                inputGroupSpan = element.parent();
            }
            
            //component
            var componentButton = element.nextAll('span:first');
            
            if((componentButton.length == 0 ) || !($(componentButton[0]).hasClass('input-group-addon'))){
            	componentButton = $('<span class="input-group-addon dropdown-toggle" data-dropdown="dropdown">').html('<span class="caret"></span><span class="glyphicon glyphicon-remove" style="display:none;"></span>');
                inputGroupSpan.append(componentButton);
            }
            
            component = componentButton;
            
            var widgetEl = element.nextAll('ul:first');
            if(widgetEl.length > 0 ){
            	widgetEl.remove();
            }
            
            var prevEl = element.prev('input');
            if((prevEl.length == 0 ) || !($(prevEl[0]).hasClass('form-control'))){
            	prevEl = $('<input class="form-control" type="text">');
                element.before(prevEl);
            }
            textElement = prevEl;
            
            
            
            element.css("display", "none");
        } else {
            throw new Error('Cannot apply to non input, select element');
        }

        $.extend(true, options, dataToOptions());
        grobject.options(options);
        
        value =  (options.value !== null) ? options.value : input.val();
        
    	setupWidget();
    	
    	if(!options.placeholder){
    		options.placeholder = input.attr("placeholder");
    	}
    	
    	if(options.valueField != null){
			if (options.textField === null){
				options.textField = options.valueField;
			}
    	}
    	if(textElement && options.placeholder){
    		textElement.attr("placeholder", options.placeholder);
    	}
    	
    	if((options.index) && (options.index > -1)){
    		grobject.setIndex(options.index);
    	}
    	
        attachElementEvents();
        if (input.prop('disabled')) {
            grobject.disable();
        }
        if (input.prop('readonly')) {
            grobject.readonly();
        }
        return grobject;
		
	};
	
/*****************************************/
	
	$.fn.combobox = function (options) {
		
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('gonrin')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.combobox.defaults, options);
                $this.data('gonrin', ComboBox($this, options));
            }
        });
    };

    $.fn.combobox.defaults = {
    	/*autobind: Controls whether to bind the widget to the data source on initialization.*/
    	autobind: true,
    	/*cascadeFrom: Use it to set the Id of the parent ComboBox widget.*/
    	cascadeFrom: null,
    	/*Defines the field to be used to filter the data source.*/
    	cascadeFromField: null,
    	/**/
    	placeholder: null,
    	readonly: false,
    	debug: false,
    	/*The delay in milliseconds between a keystroke and when the widget displays the popup.*/
    	delay: 200,
    	textField: null,
        valueField: null,
        /*dataSource: The data source of the widget which is used to display a list of values. 
         * Can be a JavaScript object which represents a valid data source configuration, a JavaScript array 
         * or an existing kendo.data.DataSource instance.*/
        dataSource: null,
        enable:true,
        index: -1,
        /*filter: The filtering method used to determine the suggestions for the current value. Filtration is turned off by default. The supported filter values are startswith, endswith and contains.*/
        filter: false,
        height: 200,
        /*If set to false case-sensitive search will be performed to find suggestions. The widget performs case-insensitive searching by default.*/
        ignoreCase: false,
        /*If set to true the widget will automatically use the first suggestion as its value.*/
        suggest: false,
        /*The minimum number of characters the user must type before a search is performed. Set to higher value than 1 if the search could match a lot of items.*/
        minLength: 1,
        /*Specifies a static HTML content, which will be rendered as a header of the popup element.*/
        headerTemplate: false,
        /*The template used to render the items. By default the widget displays only the text of the data item (configured via textField).*/
        template: false,
        /*The text of the widget used when the auto_bind is set to false.*/
        text: "",
        /*The value of the widget.*/
        value: null,
        focusOnShow: true
    };
}));