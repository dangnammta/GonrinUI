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
}(function ($){
	var comboBox = function(element){
		var combo = {id:1, name:'HaiHien',
				toogle: function(){
					if(widget){
						if(widget.is(':visible')){
							widget.hide();
						}else{
							widget.show();
						}
					}
				},
		};
		var widget;
		
		var setupWidget = function(){
			var btn = $('<span class="input-group-addon dropdown-toggle" data-dropdown="dropdown">').html('<span class="caret"></span><span class="glyphicon glyphicon-remove" style="display:none;"></span>');
			widget = $('<ul>').html('<li>1</li><li>2</li>');
			
			btn.bind("click",combo.toogle);
			element.after(btn);
			element.after(widget);
			widget.css("display","none");
		};
		
		
		
		element.css('border',"1px solid #00ff00");
		element.addClass("form-control");
		element.wrap( '<span class="input-group"></span>');
		setupWidget();
		return combo;
	};
	$.fn.gonuiComboBox2 = function (options) {
		return this.each(function () {
            var $this = $(this);
            if (!$this.data('ComboBox2')) {
                // create a private copy of the defaults object
                //options = $.extend(true, {}, $.fn.gonuiComboBox.defaults, options);
                $this.data('ComboBox2',comboBox($this));
            }
        });
        alert('HaiHien');
    };
	
}));