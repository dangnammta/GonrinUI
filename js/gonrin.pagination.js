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
            throw 'gonrin grid requires jQuery to be loaded first';
        }
        factory(jQuery);
    }
}(function ($) {
	'use strict';
	var Pagination = function (element, options) {
		var gonrin = window.gonrin;
		var grobject = {},
		language = {},
		selectedItems = [],
		data = [], //datalist
		filteredData,
		dataSource,
		filterExp, 
		unset = true,
        menu_template = '<ul class="dropdown-menu" style="overflow-y:scroll"></ul>',
        item_template =  '<li><a href="javascript:void(0)"></a></li>',
        
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
        * Private API functions
        * =====================
        */
        createId = function(prefix, pluginContainerId) {
            return prefix + pluginContainerId;
        },
        dataToOptions = function () {
            var eData,
                dataOptions = {};

            if (element.is('div') || options.inline) {
                eData = element.data();
            }

            if (eData.dataOptions && eData.dataOptions instanceof Object) {
            	dataOptions = $.extend(true, dataOptions, eData.dataOptions);
            }
            return dataOptions;
        },
        
        
        initialize = function(){
        	// initializing element and component attributes
            if (element.is('div')) {
            	if(!element.attr("id")){
            		element.attr("id","grid");
    			};
            } else {
                throw new Error('Cannot apply to non input, select element');
            }
            
         // retrieve options
            var container_id = element.attr("id"),

                nav_list_id = createId(options.nav_list_id_prefix, container_id),
                nav_top_id = createId(options.nav_top_id_prefix, container_id),
                nav_prev_id = createId(options.nav_prev_id_prefix, container_id),
                nav_item_id_prefix = createId(options.nav_item_id_prefix, container_id) + "_",
                nav_next_id = createId(options.nav_next_id_prefix, container_id),
                nav_last_id = createId(options.nav_last_id_prefix, container_id),

                goto_page_id = createId(options.nav_goto_page_id_prefix, container_id),
                rows_per_page_id = createId(options.nav_rows_per_page_id_prefix, container_id),
                rows_info_id = createId(options.nav_rows_info_id_prefix, container_id),

                html = "",
                previous_selection, current_selection,
                selector_nav_top, selector_nav_prev, selector_nav_pages, selector_nav_next, selector_nav_last,
                selector_go_to_page, selector_rows_per_page;
            
            console.log(options);
            html += '<div class="' + options.mainWrapperClass + '">';

            html += '<div class="' + options.navListContainerClass + '">';
            html += '<div class="' + options.navListWrapperClass + '">';
            html += '<ul id="' + nav_list_id + '" class="' + options.navListClass + '">';
            html += '</ul>';
            html += '</div>';
            html += '</div>';

            if(options.showGoToPage && options.visiblePageLinks < options.totalPages) {
                html += '<div class="' + options.navGoToPageContainerClass + '">';
                html += '<div class="input-group">';
                html += '<span class="input-group-addon" title="' + rsc_bs_pag.go_to_page_title + '"><i class="' + options.navGoToPageIconClass + '"></i></span>';
                html += '<input id="' + goto_page_id + '" type="text" class="' + options.navGoToPageClass + '" title="' + rsc_bs_pag.go_to_page_title + '">';
                html += '</div>';
                html += '</div>';
            }
            if(options.showRowsPerPage) {
                html += '<div class="' + options.navRowsPerPageContainerClass + '">';
                html += '<div class="input-group">';
                html += '<span class="input-group-addon" title="' + rsc_bs_pag.rows_per_page_title + '"><i class="' + options.navRowsPerPageIconClass + '"></i></span>';
                html += '<input id="' + rows_per_page_id + '" value="' + options.rowsPerPage + '" type="text" class="' + options.navRowsPerPageClass + '" title="' + rsc_bs_pag.rows_per_page_title + '">';
                html += '</div>';
                html += '</div>';
            }
            if(options.showRowsInfo) {
                html += '<div class="' + options.navInfoContainerClass + '">';
                html += '<div id="' + rows_info_id + '" class="' + options.navInfoClass + '"></div>';
                html += '</div>';
            }
            
            html += '</div>';

            // set nav_pane_html
            element.html(html);
            
            
        };
        
        /********************************************************************************
        *
        * Public API functions
        * =====================
        */
        grobject.getVersion = function() {
            return "0.0.1";
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
        
        grobject.getOption= function(opt) {
            return options[opt];
        };
        
        grobject.getAllOptions = function() {
            return options;
        };
        
        $.extend(true, options, dataToOptions());
        grobject.options(options);
        initialize();
    	//setupWidget();
        //attachElementEvents();

        
        return grobject;
		
	};
	
/*****************************************/
	
	$.fn.pagination = function (options) {
        return this.each(function () {
            var $this = $(this);
            options.refresh = options.refresh || false;
            if ($this.data('gonrin') && options.refresh){
            	$this.data('gonrin', null);
            }
            if (!$this.data('gonrin')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.pagination.defaults, options);
                $this.data('gonrin', Pagination($this, options));
            }
        });
    };

    $.fn.pagination.defaults = {
    	refresh: false,
    	page: 1,
    	pageSize: 10,
    	totalPages: null,
    	virtualTotalPages:null,
        visiblePageLinks: 5,
        showGotoPage: false,
        showRowsPerPage: false,
        showRowsInfo: false,
        showRowsDefaultInfo: true,
        containerClass: "well pagination-container",
        
        directURL: false, // or a function with current page as argument
        disableTextSelectionInNavPane: true, // disable text selection and double click
        
        mainWrapperClass: "row",

        navListContainerClass: "col-xs-12 col-sm-12 col-md-6",
        navListWrapperClass: "",
        navListClass: "pagination pagination_custom",
        navListActiveItemClass: "active",

        navGoToPageContainerClass: "col-xs-6 col-sm-4 col-md-2 row-space",
        navGoToPageIconClass: "glyphicon glyphicon-arrow-right",
        navGoToPageClass: "form-control small-input",

        navRowsPerPageContainerClass: "col-xs-6 col-sm-4 col-md-2 row-space",
        navRowsPerPageIconClass: "glyphicon glyphicon-th-list",
        navRowsPerPageClass: "form-control small-input",

        navInfoContainerClass: "col-xs-12 col-sm-4 col-md-2 row-space",
        navInfoClass: "",

        // element IDs
        nav_list_id_prefix: "nav_list_",
        nav_top_id_prefix: "top_",
        nav_prev_id_prefix: "prev_",
        nav_item_id_prefix: "nav_item_",
        nav_next_id_prefix: "next_",
        nav_last_id_prefix: "last_",

        nav_goto_page_id_prefix: "goto_page_",
        nav_rows_per_page_id_prefix: "rows_per_page_",
        nav_rows_info_id_prefix: "rows_info_",

        onChangePage: function() { // returns page_num and rows_per_page after a link has clicked
        },
        onLoad: function() { // returns page_num and rows_per_page on plugin load
        }
    };
}));