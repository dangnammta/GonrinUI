"use strict";
(function($) {
	var pluginName = "gonrin_grid",
    pluginGivenOptions = "gonrin_grid_options",
    pluginStatus = "gonrin_grid_status";
	
	function classExists(c) {
	    return typeof(c) == "function" && typeof(c.prototype) == "object" ? true : false;
	}  
	// public grid
    var grid = {
		init: function(options) {
			var elem = this;
			if(!elem.attr("id")){
				elem.attr("id","grid");
			};
            return this.each(function() {
            	
                /**
                 * store given options on first launch (in new object - no reference)
                 */
                if(typeof  elem.data(pluginGivenOptions) === "undefined") {
                    elem.data(pluginGivenOptions, $.extend(true, {}, options));
                }

                /**
                 * settings and defaults
                 * settings modification will affect elem.data(pluginName) and vice versa
                 */
                var settings = elem.data(pluginName);
                if(typeof settings === "undefined") {
                    var bootstrap_version = "3";
                    
                    var defaults = grid.getDefaults.call(elem, bootstrap_version);
                    // deep merge ('true' arg) is required, as there are object attibutes (paginationOptions, filterOptions)
                    settings = $.extend(true, {}, defaults, options);
                } else {
                    settings = $.extend(true, {}, settings, options);
                }
                elem.data(pluginName, settings);
                
                // initialize plugin status
                if(typeof  elem.data(pluginStatus) === "undefined") {
                    elem.data(pluginStatus, {});
                }

                if(!settings.primaryField) {
                    settings.selectedItems = [];
                } else {
                    switch(settings.selectionMode) {
                        case "single":
                            if(settings.selectedItems.length > 1) {
                                settings.selectedItems = [];
                            }
                            break;
                        case false:
                            settings.selectedItems = [];
                            break;
                    }
                }
                
                var container_id = elem.attr("id");

                // apply container style
                elem.removeClass().addClass(settings.containerClass);

                // bind events
                elem.unbind("cellclick").bind("cellclick", settings.onCellClick);
                elem.unbind("rowclick").bind("rowclick", settings.onRowClick);
                elem.unbind("griderror").bind("griderror", settings.onGridError);
                elem.unbind("debug").bind("debug", settings.onDebug);
                elem.unbind("render").bind("render", settings.onRender);

                // initialize plugin html
                var tools_id = createId(settings.toolsIdPrefix, container_id),
                    columns_list_id = createId(settings.columnsListIdPrefix, container_id),
                    default_columns_list = "",
                    sorting_list_id = createId(settings.sortingListIdPrefix, container_id),
                    default_sorting_list = "",
                    sorting_radio_name = createId(settings.sortingRadioNamePrefix, container_id) + "_",
                    startPos, newPos,
                    selectedRows_id = createId(settings.selectedRowsIdPrefix, container_id),
                    selection_list_id = createId(settings.selectionListIdPrefix, container_id),
                    table_container_id = createId(settings.tableContainerIdPrefix, container_id),
                    table_id = createId(settings.tableIdPrefix, container_id),
                    no_results_id = createId(settings.noResultsIdPrefix, container_id),
                    filter_toggle_id = createId(settings.filterToggleIdPrefix, container_id),
                    custom_html1_id = createId(settings.custom_html1_id_prefix, container_id),
                    custom_html2_id = createId(settings.custom_html2_id_prefix, container_id),
                    pagination_id = createId(settings.paginationIdPrefix, container_id),
                    filter_container_id = createId(settings.filterContainerIdPrefix, container_id),
                    filter_rules_id = createId(settings.filterRulesIdPrefix, container_id),
                    filter_tools_id = createId(settings.filterToolsIdPrefix, container_id),
                    elem_html = "", tools_html = "";

                // create basic html structure ---------------------------------
                elem_html += '<div id="' + tools_id + '" class="' + settings.toolsClass + '"></div>';

                elem_html += '<div id="' + table_container_id + '" class="' + settings.datatableContainerClass + '">';
                elem_html += '<table id="' + table_id + '" class="' + settings.datatableClass + '"></table>';
                elem_html += '</div>';

                elem_html += '<div id="' + no_results_id + '" class="' + settings.noResultsClass + '">' + rsc_bs_dg.no_records_found + '</div>';

                if(settings.custom_html_element_id1) {
                    elem_html += '<div id="' + custom_html1_id + '"></div>';
                }

                elem_html += '<div id="' + pagination_id + '"></div>';

                if(settings.custom_html_element_id2) {
                    elem_html += '<div id="' + custom_html2_id + '"></div>';
                }

                if(settings.useFilters) {
                    elem_html += '<div id="' + filter_container_id + '" class="' + settings.filterContainerClass + '">';

                    elem_html += '<div id="' + filter_rules_id + '"></div>';

                    elem_html += '<div id="' + filter_tools_id + '" class="' + settings.filterToolsClass + '">';
                    elem_html += '<button class="' + settings.filterApplyBtnClass + '">' + rsc_bs_dg.filters_apply + '</button>';
                    elem_html += '<button class="' + settings.filterResetBtnClass + '">' + rsc_bs_dg.filters_reset + '</button>';

                    elem_html += '</div>';
                }

                elem_html += '</div>';

                elem.html(elem_html);
                $("#" + no_results_id).hide();

                var elem_tools = elem.find("#" + tools_id),
                    elem_table = elem.find("#" + table_id),
                    elem_pagination = elem.find("#" + pagination_id);
                
                console.log(elem_pagination)

             // create toolbar ----------------------------------------------
                // columns list
                /*tools_html += '<div class="btn-group pull-right">';

                tools_html += '<button type="button" class="' + settings.columnsListLaunchButtonClass + '" data-toggle="dropdown" title="' + rsc_bs_dg.columns + '">';
                tools_html += '<span class="' + settings.columnsListLaunchButtonIconClass + '"></span>';
                tools_html += '<span class="caret"></span>';
                tools_html += '</button>';

                tools_html += '<ul id="' + columns_list_id + '" class="' + settings.columnsListClass + '">';

                var col_name, col_checked,
                    col_list_len = 0;
                for(var i in settings.columns) {
                    if(columnIsFunction(settings.columns[i])) {
                        continue;
                    }
                    col_list_len++;
                    col_name = getColumnLabel(settings.columns[i]);
                    col_checked = columnIsVisible(settings.columns[i]) ? " checked" : "";
                    default_columns_list += '<li><a href="javascript:void(0);">' +
                        '<label class="' + settings.columnsListLabelClass + '">' +
                        '<input type="checkbox" class="' + settings.columnsListCheckClass + '"' + col_checked + '> ' + col_name +
                        '</label>' +
                        '</a></li>';
                }
                default_columns_list += '<li class="not-sortable ' + settings.columnsListDividerClass + '"></li>';

                var row_index_checked = settings.showRowNumbers ? " checked" : "";
                default_columns_list += '<li class="not-sortable columns-li-padding"><label class="' + settings.columnsListLabelClass + '"><input type="checkbox" class="' + settings.columnsListCheckClass + '"' + row_index_checked + '>&nbsp;' + rsc_bs_dg.columns_showRowNumbers + '</label></li>';
                default_columns_list += '<li class="not-sortable ' + settings.columnsListDividerClass + '"></li>';
                default_columns_list += '<li class="not-sortable columns-li-padding"><button class="' + settings.columnsListDefaultButtonClass + '">' + rsc_bs_dg.columns_default + '</button></li>';

                //save default columns list
                if(typeof elem.data(pluginStatus)["default_columns_list"] === "undefined") {
                    elem.data(pluginStatus)["default_columns_list"] = default_columns_list;
                }

                tools_html += default_columns_list;

                tools_html += '</ul>';

                tools_html += '</div>';

                // sorting list ------------------------------------------------
                tools_html += '<div class="btn-group pull-right">';

                tools_html += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + rsc_bs_dg.sorting + '">';
                tools_html += '<span class="' + settings.sortingListLaunchButtonIconClass + '"></span>';
                tools_html += '<span class="caret"></span>';
                tools_html += '</button>';

                tools_html += '<ul id="' + sorting_list_id + '" class="dropdown-menu dropdown-menu-right">';

                for(var i in settings.sorting) {
                    var sort_name = getSortingName(settings.sorting[i]),
                        checked_asc = settings.sorting[i]["order"] == "ascending" ? " checked" : "",
                        checked_desc = settings.sorting[i]["order"] == "descending" ? " checked" : "",
                        checked_none = settings.sorting[i]["order"] == "none" ? " checked" : "";
                    default_sorting_list += '<li><a href="javascript:void(0);">' +
                        '<label class="' + settings.sortingLabelCheckboxClass + '"><input type="radio" name="' + sorting_radio_name + i + '"' + checked_asc + '>' + rsc_bs_dg.sort_ascending + '</label>' +
                        '<label class="' + settings.sortingLabelCheckboxClass + '"><input type="radio" name="' + sorting_radio_name + i + '"' + checked_desc + '>' + rsc_bs_dg.sort_descending + '</label>' +
                        '<label class="' + settings.sortingLabelCheckboxClass + '"><input type="radio" name="' + sorting_radio_name + i + '"' + checked_none + '>' + rsc_bs_dg.sort_none + '</label>' +
                        '<span class="' + settings.sortingNameClass + '">' + sort_name + '</span>' +
                        '</a></li>';
                }
                default_sorting_list += '<li class="not-sortable ' + settings.columnsListDividerClass + '"></li>';
                default_sorting_list += '<li class="not-sortable columns-li-padding"><button class="' + settings.columnsListDefaultButtonClass + '">' + rsc_bs_dg.sorting_default + '</button></li>';

                //save default columns list
                if(typeof elem.data(pluginStatus)["default_sorting_list"] === "undefined") {
                    elem.data(pluginStatus)["default_sorting_list"] = default_sorting_list;
                }

                tools_html += default_sorting_list;

                tools_html += '</ul>';

                tools_html += '</div>';

                // selection list ----------------------------------------------
                if(settings.primaryField &&
                    (settings.selectionMode == "single" || settings.selectionMode == "multiple")) {
                    tools_html += '<div class="btn-group pull-right">';

                    tools_html += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + rsc_bs_dg.select + '">';
                    tools_html += '<span class="' + settings.selectButtonIconClass + '"></span>';
                    tools_html += '<span id="' + selectedRows_id + '" class="' + settings.selectedRowsClass + '">' + settings.selectedItems.length + '</span>';
                    tools_html += '<span class="caret"></span>';
                    tools_html += '</button>';

                    tools_html += '<ul id="' + selection_list_id + '" class="dropdown-menu dropdown-menu-right">';

                    if(settings.selectionMode == "multiple") {
                        tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.select_all_in_page + '</a></li>';
                        tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.deselect_all_in_page + '</a></li>';
                        tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.select_inverse_in_page + '</a></li>';
                        tools_html += '<li class="not-sortable ' + settings.columnsListDividerClass + '"></li>';
                    }

                    tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.deselect_all + '</a></li>';

                    tools_html += '</ul>';

                    tools_html += '</div>';
                }

                // filter toggle button ----------------------------------------
                if(settings.useFilters) {
                    tools_html += '<button id="' + filter_toggle_id + '" class="btn btn-default pull-right" title="' + rsc_bs_dg.filters + '"><span class="' + settings.filterToggleButtonIconClass + '"></span></button>';
                }

                elem_tools.html(tools_html);*/
                
             // initialize grid ---------------------------------------------
                //var grid_init = grid.display_grid.call(elem, false);
                var grid_init = grid.display_grid.call(elem, true);
                
                
            });
        },
        render_data: function(page_data, page, total_pages, num_rows, refresh_pag){
        	console.log('render_data');
        	var elem = this,
            container_id = elem.attr("id"),
	            s = grid.getAllOptions.call(elem),
	            
	            table_id = createId(s.tableIdPrefix, container_id),
	            elem_table = $("#" + table_id),
	            
	            no_results_id = createId(s.noResultsIdPrefix, container_id),
	            elem_no_results = $("#" + no_results_id),
	            
	            filter_rules_id = createId(s.filterRulesIdPrefix, container_id),
	            
	            pagination_id = createId(s.paginationIdPrefix, container_id),
	            elem_pagination = $("#" + pagination_id),
	            err_msg;
        	
        	var server_error, filter_error, primaryField, total_rows, page_data_len, v,
            columns = s.fields,
            col_len = columns.length,
            column, c;
        	
        	total_rows = page_data.length;
            page_data_len = page_data.length;
            
            primaryField = s.primaryField;
            
         // replace null with empty string
            if(page_data_len > 0) {
                for(v = 0; v < page_data_len; v++) {
                    for(c = 0; c < col_len; c++) {
                        column = columns[c];
                        
                        if(columnIsVisible.call(elem,column)) {
                        	
                            if(page_data[v][column["field"]] == null) {
                                page_data[v][column["field"]] = '';
                            }
                        }
                    }
                }
            };
            
         // create data table
            var page_num = parseInt(s.page),
                rowsPerPage = parseInt(s.rowsPerPage),
                sorting_indicator,
                row_id_html, i, row, tbl_html, row_index,
                offset = ((page_num - 1) * rowsPerPage);

            tbl_html = '<thead>';
            row_id_html = (primaryField ? ' id="' + table_id + '_tr_0"' : '');
            tbl_html += '<tr' + row_id_html + '>';

            if(s.showRowNumbers) {
                tbl_html += '<th class="' + s.commonThClass + '">' + rsc_bs_dg.row_index_header + '</th>';
            };
            
            for(i in s.fields) {
                if(columnIsVisible.call(elem,s.fields[i])) {
                    sorting_indicator = "";
                    if(s.showSortingIndicator) {
                        var sorting_type = "none";
                        for(var e in s.sorting) {
                            if(s.sorting[e].field == s.fields[i].field) {
                                sorting_type = s.sorting[e].order;
                                break;
                            }
                        }
                        switch(sorting_type) {
                            case "ascending":
                            	sorting_indicator = '&nbsp;<span class="' + s.sortingIndicatorAscClass + '"></span>';
                                break;
                            case "descending":
                            	sorting_indicator = '&nbsp;<span class="' + s.sortingIndicatorDescClass + '"></span>';
                                break;
                            default:
                            	sorting_indicator = '';
                        }
                    }
                    tbl_html += '<th class="' + s.commonThClass + '">' + s.fields[i].label + sorting_indicator + '</th>';
                }
            }
            tbl_html += '</tr>';
            tbl_html += '</thead>';

            tbl_html += '<tbody class="grid-data">';
            tbl_html += '<tbody>';
            elem_table.html(tbl_html);
            
            console.log(elem_table);
            var grid_data = elem_table.find('tbody.grid-data');
            
            for(row in page_data) {
            	row_id_html = (primaryField ? table_id + '_tr_' + page_data[row][primaryField] : '');
            	var trow = $("<tr>").attr("id",row_id_html);
            	trow.data("row_data",page_data[row]);
                var tr_tbl_html = '';

                if(s.showRowNumbers) {
                    row_index = offset + parseInt(row) + 1;
                    tr_tbl_html += '<td>' + row_index + '</td>';
                }

                for(i in s.fields) {
                    if(columnIsVisible.call(elem,s.fields[i])) {
                    	tr_tbl_html += '<td>' + page_data[row][s.fields[i].field] + '</td>';
                    }
                }

                trow.html(tr_tbl_html);
                grid_data.append(trow);
            }
            
            
         // refresh pagination (if needed)
            if(refresh_pag) {
                elem_pagination.pagination({
                    currentPage: page,
                    totalPages: total_pages,
                    totalRows: num_rows
                });
            }
            // no results
            if(total_rows == 0) {
                elem_pagination.hide();
                elem_no_results.show();
            } else {
                elem_pagination.show();
                elem_no_results.hide();
            }
            
         // apply given styles ------------------------------------------
            var col_index = s.showRowNumbers ? 1 : 0,
                headerClass = "", dataClass = "";
            for(i in s.columns) {
                if(columnIsVisible.call(elem,s.columns[i])) {
                    headerClass = "", dataClass = "";
                    if(columns[i].hasOwnProperty("headerClass")) {
                        headerClass = columns[i]["headerClass"];
                    }
                    if(columns[i].hasOwnProperty("dataClass")) {
                        dataClass = columns[i]["dataClass"];
                    }
                    grid.setPageColClass.call(elem, col_index, headerClass, dataClass);
                    col_index++;
                }
            }

            // apply row selections ----------------------------------------
            if(s.primaryField && s.selectedItems.length > 0) {

                if(s.selectionMode == "single" || s.selectionMode == "multiple") {
                    var row_prefix_len = (table_id + "_tr_").length,
                        row_id, idx;
                    $("#" + table_id + " tbody tr").each(function() {
                        row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                        idx = grid.selectedRows.call(elem, "selected_index", row_id);
                        if(idx > -1) {
                            grid.selectedRows.call(elem, "mark_selected", row_id);
                        }
                    });
                }
            }

            // update selected rows counter
            grid.selectedRows.call(elem, "update_counter");
            
            
            
            /**
             * EVENTS ******************************************************
             */

            //TOOLS - columns list -----------------------------------------
            //Edit later
            var settings = s;
         // row selection -----------------------------------------------
            if(settings.primaryField &&
                (settings.selectionMode == "single" || settings.selectionMode == "multiple")) {

                var row_prefix_len = (table_id + "_tr_").length;
                
                // click on row
                elem_table.off("click", "tbody tr").on("click", "tbody tr", function() {
                    var row_id = parseInt($(this).attr("id").substr(row_prefix_len)),
                        row_status,
                        row_data = $(this).data("row_data"),
                        idx = grid.selectedRows.call(elem, "selected_index", row_data);

                    
                    if(idx > -1) {
                        grid.selectedRows.call(elem, "remove_id", idx);
                        grid.selectedRows.call(elem, "mark_deselected", row_data);
                        row_status = "deselected";
                    } else {
                        if(settings.selectionMode == "single") {
                            grid.selectedRows.call(elem, "clear_all_ids");
                            grid.selectedRows.call(elem, "mark_page_deselected");
                        };
                        grid.selectedRows.call(elem, "add_id", row_data);
                        grid.selectedRows.call(elem, "mark_selected", row_data);
                        row_status = "selected";
                    }
                    console.log(settings.selectedItems);
                    // update selected rows counter
                    grid.selectedRows.call(elem, "update_counter");
                    elem.triggerHandler("rowclick", {row_id: row_id, row_status: row_status, row_data:row_data, selectedItems: settings.selectedItems, source : settings["dataSource"]});
                });

                
                
                // selection list
                var container_id = elem.attr("id");
                var selection_list_id = createId(settings.selectionListIdPrefix, container_id);
                var elem_selection_list = elem.find("#" + selection_list_id);

                elem_selection_list.off("click", "li").on("click", "li", function() {
                    var sel_index = $(this).index();

                    if(settings.selectionMode == "single") {
                        grid.selectedRows.call(elem, "clear_all_ids");
                        grid.selectedRows.call(elem, "mark_page_deselected");
                    } else if(settings.selectionMode == "multiple") {

                        var selector_table_tr = "#" + table_id + " tbody tr",
                            row_prefix_len = (table_id + "_tr_").length,
                            row_id, idx;
                        switch(sel_index) {
                            case 0:
                                $(selector_table_tr).each(function() {
                                    row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                    idx = grid.selectedRows.call(elem, "selected_index", row_id);
                                    if(idx == -1) {
                                        grid.selectedRows.call(elem, "add_id", row_id);
                                    }
                                });
                                grid.selectedRows.call(elem, "mark_page_selected");
                                break;
                            case 1:
                                $(selector_table_tr).each(function() {
                                    row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                    idx = grid.selectedRows.call(elem, "selected_index", row_id);
                                    if(idx > -1) {
                                        grid.selectedRows.call(elem, "remove_id", idx);
                                    }
                                });
                                grid.selectedRows.call(elem, "mark_page_deselected");
                                break;
                            case 2:
                                $(selector_table_tr).each(function() {
                                    row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                    idx = grid.selectedRows.call(elem, "selected_index", row_id);
                                    if(idx > -1) {
                                        grid.selectedRows.call(elem, "remove_id", idx);
                                    } else {
                                        grid.selectedRows.call(elem, "add_id", row_id);
                                    }
                                });
                                grid.selectedRows.call(elem, "mark_page_inversed");
                                break;
                            case 4:
                                grid.selectedRows.call(elem, "clear_all_ids");
                                grid.selectedRows.call(elem, "mark_page_deselected");
                                break;
                        }
                    }

                    // update selected rows counter
                    grid.selectedRows.call(elem, "update_counter");

                });

            }
            
            // trigger event onDisplay
            elem.triggerHandler("render");
        },
        
        display_grid: function(refresh_pag) {
        	var elem = this,
	            s = grid.getAllOptions.call(elem);
        	
        	var dataSource = s["dataSource"];
        	var page_data = [];
        	
        	//check dataSource is Gonrin.CollectionView
        	if(typeof dataSource === "object"){
        		if((!!dataSource['_is_gonrin_view']) && (!!dataSource.collection)){
        			console.log('instance of collection view');
        			var view = dataSource;
        			view.collection.fetch({
                        success: function (data) {
                        	var page = view.collection.page,
                        		num_rows = view.collection.num_rows,
                        		total_pages = view.collection.total_pages;
                        	
                        	view.collection.each(function(model) {
                        		page_data.push(model.attributes);
							});
                        	grid.render_data.call(elem, page_data, page, total_pages, num_rows, refresh_pag);
                        },
                        error:function(){
                        	console.log("Collection fetch error");
                        	var filter_error;
                            var err_msg = "ERROR: " + "Collection fetch error";
                            elem.html('<span style="color: red;">' + err_msg + '</span>');
                            elem.triggerHandler("griderror", {err_code: "server_error", err_description: err_msg});
                            $.error(err_msg);

                            /*if(s.useFilters) {
                                var elem_filter_rules = $("#" + filter_rules_id);
                                filter_error = data["filter_error"];
                                if(filter_error["error_message"] != null) {
                                    elem_filter_rules.jui_filter_rules("markRuleAsError", filter_error["element_rule_id"], true);
                                    elem_filter_rules.triggerHandler("onValidationError", {err_code: "filter_validation_server_error", err_description: filter_error["error_message"]});
                                    $.error(filter_error["error_message"]);
                                }
                            }*/
                        },
                    });
        		}else{
        			grid.render_data.call(elem, dataSource, refresh_pag);
        		}
            	
            }
        },
        
        selectedRows: function(action, row_data) {
            var elem = this,
                container_id = elem.attr("id"),
                settings = grid.getAllOptions.call(elem),
                table_id = createId(grid.getOption.call(elem, "tableIdPrefix"), container_id),
                selectedTrClass = grid.getOption.call(elem, "selectedTrClass"),
                selector_table_tr = "#" + table_id + " tbody tr",
                table_tr_prefix = "#" + table_id + "_tr_";
            
            var id = row_data ? row_data[settings.primaryField] : null;
            
            switch(action) {
                case "get_ids":
                	if(settings.selectionMode == "single") {
                		return settings.selectedItems;
                	};
                	if(settings.selectionMode == "multiple") {
                		/*TODO*/
                		return settings.selectedItems;
                	};
                    
                    break;
                case "clear_all_ids":
                	settings.selectedItems = [];
                    break;
                case "update_counter":
                    var selectedRows_id = createId(grid.getOption.call(elem, "selectedRowsIdPrefix"), container_id);
                    $("#" + selectedRows_id).text(settings.selectedItems.length);
                    break;
                case "selected_index":
                	return $.inArray(row_data, settings.selectedItems);
                    break;
                case "add_id":
                	settings.selectedItems.push(row_data);
                    break;
                case "remove_id":
                	settings.selectedItems.splice(row_data, 1);
                    break;
                case "mark_selected":
                	elem.find(table_tr_prefix + id).addClass(selectedTrClass);
                    break;
                case "mark_deselected":
                	elem.find(table_tr_prefix + id).removeClass(selectedTrClass);
                    break;
                case "mark_page_selected":
                	elem.find(selector_table_tr).addClass(selectedTrClass);
                    break;
                case "mark_page_deselected":
                	elem.find(selector_table_tr).removeClass(selectedTrClass);
                    break;
                case "mark_page_inversed":
                	elem.find(selector_table_tr).toggleClass(selectedTrClass);
                    break;
            }

        },
        /**
         * Get plugin version
         * @returns {string}
         */
        getVersion: function() {
            return "0.0.1";
        },
        /**
         * Get any option set to plugin using its name (as string)
         *
         * @example $(element).bs_grid("getOption", some_option);
         * @param {String} opt
         * @return {*}
         */
        getOption: function(opt) {
            var elem = this;
            return elem.data(pluginName)[opt];
        },

        /**
         * Get all options
         * @example $(element).bs_grid("getAllOptions");
         * @return {*}
         */
        getAllOptions: function() {
            var elem = this;
            return elem.data(pluginName);
        },

        /**
         * Get default values
         * @example $(element).bs_grid("getDefaults", "3");
         * @return {Object}
         */
        getDefaults: function(bootstrap_version) {
            var defaultSettings = {
            	page: 1,
                rowsPerPage: 10,
                maxRowsPerPage: 100,
                primaryField: "",
                selectionMode: "single", // "multiple", "single", false
                selectedItems: [],
                /**
                 * MANDATORY PROPERTIES: field
                 * UNIQUE PROPERTIES: field
                 * {field: "customer_id", header: "Code", visible: "no", is_function: "no", "headerClass": "th_code hidden-xs", "dataClass": "td_code hidden-xs"},
                 */
                fields: [],

                /**
                 * MANDATORY PROPERTIES: field, order
                 * UNIQUE PROPERTIES: field
                 * order is one of "ascending", "descending", "none"
                 * {sortingName: "Code", field: "customer_id", order: "none"},
                 */
                sorting: [],

                /**
                 * See bs_pagination plugin documentation
                 */
                paginationOptions: {
                    containerClass: "well pagination-container",
                    visiblePageLinks: 5,
                    showGotoPage: false,
                    showRowsPerPage: false,
                    showRowsInfo: false,
                    showRowsDefaultInfo: true,
                    //disable_text_selection_in_navpane: true
                }, // "currentPage", "rowsPerPage", "maxrowsPerPage", "totalPages", "totalRows", "bootstrap_version", "onChangePage" will be ignored

                /**
                 * See jui_filter_rules plugin documentation
                 */
                useFilters: true,
                filterOptions: {
                    filters: [],
                    filter_rules: []
                }, // "bootstrap_version", "onSetRules", "onValidationError" will be ignored
                showRowNumbers: false,
                
                // events
                onCellClick: function() {
                },
                onRowClick: function() {
                },
                onGridError: function() {
                },
                onDebug: function() {
                },
                onRender: function() {
                },
                
                showSortingIndicator: true,
                useSortableLists: true,
                custom_html_element_id1: "",
                custom_html_element_id2: "",

                /* STYLES ----------------------------------------------------*/
                bootstrap_version: "3",

                // bs 3
                containerClass: "grid_container",
                noResultsClass: "alert alert-warning no-records-found",

                toolsClass: "tools",

                columnsListLaunchButtonClass: "btn btn-default dropdown-toggle",
                columnsListLaunchButtonIconClass: "glyphicon glyphicon-th",
                columnsListClass: "dropdown-menu dropdown-menu-right",
                columnsListLabelClass: "columns-label",
                columnsListCheckClass: "col-checkbox",
                columnsListDividerClass: "divider",
                columnsListDefaultButtonClass: "btn btn-primary btn-xs btn-block",

                sortingListLaunchButtonIconClass: "glyphicon glyphicon-sort",
                sortingLabelCheckboxClass: "radio-inline",
                sortingNameClass: "sorting-name",

                selectButtonIconClass: "glyphicon  glyphicon-check",
                selectedRowsClass: "selected-rows",

                filterToggleButtonIconClass: "glyphicon glyphicon-filter",
                filterToggleActiveClass: "btn-info",

                sortingIndicatorAscClass: "glyphicon glyphicon-chevron-up text-muted",
                sortingIndicatorDescClass: "glyphicon glyphicon-chevron-down text-muted",

                datatableContainerClass: "table-responsive",
                datatableClass: "table table-bordered table-hover",
                commonThClass: "th-common",
                selectedTrClass: "warning",

                filterContainerClass: "well filters-container",
                filterToolsClass: "",
                filterApplyBtnClass: "btn btn-primary btn-sm filters-button",
                filterResetBtnClass: "btn btn-default btn-sm filters-button",

                // prefixes
                toolsIdPrefix: "tools_",
                columnsListIdPrefix: "columns_list_",
                sortingListIdPrefix: "sorting_list_",
                sortingRadioNamePrefix: "sort_radio_",
                selectedRowsIdPrefix: "selectedRows_",
                selectionListIdPrefix: "selection_list_",
                filterToggleIdPrefix: "filter_toggle_",

                tableContainerIdPrefix: "tbl_container_",
                tableIdPrefix: "tbl_",

                noResultsIdPrefix: "no_res_",

                custom_html1_id_prefix: "custom1_",
                custom_html2_id_prefix: "custom2_",

                paginationIdPrefix: "pag_",
                filterContainerIdPrefix: "flt_container_",
                filterRulesIdPrefix: "flt_rules_",
                filterToolsIdPrefix: "flt_tools_",
                // misc
                debugMode: false
            };
            return defaultSettings;
        },

        
		
    };
    /**
     * Create element id
     * @function
     * @param prefix
     * @param pluginContainerId
     * @return {*}
     */
    var createId = function(prefix, pluginContainerId) {
        return prefix + pluginContainerId;
    };
	
	var array_move = function(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    };
    
    var columnIsFunction = function(column) {
        var is_function = "is_function";
        return column.hasOwnProperty(is_function) && column[is_function] === true;
    };
    
    var getColumnLabel = function(column) {
        return column.hasOwnProperty("label") ? column["label"] : column["field"];
    };
    /**
     * Get sorting name (utility function)
     *
     * @param {object} sorting
     * @returns {string}
     */
    var getSortingName = function(sorting) {
        return sorting.hasOwnProperty("sortingName") ? sorting["sortingName"] : sorting["field"];
    };

    /**
     * Check if column is sortable (utility function)
     *
     * @param {object} column
     * @returns {boolean}
     */
    var columnIsSortable = function(column) {
        return !column.hasOwnProperty("sortable") || (column.hasOwnProperty("sortable") && column["sortable"] === true);
    };
    
    /**
     * Check if column is visible (utility function)
     *
     * @param {object} column
     * @returns {boolean}
     */
    var columnIsVisible = function(column) {
        var visible = "visible";
        return !column.hasOwnProperty(visible) || (column.hasOwnProperty(visible) && column[visible] === true);
    };

    /**
     * Set column visible property (utility function)
     *
     * @param {object} column
     * @param {boolean} status
     */
    var setColumnVisible = function(column, status) {
        var visible = "visible";
        if(status) {
            if(column.hasOwnProperty(visible)) {
                delete column[visible];
            }
        } else {
            column[visible] = false;
        }
    };
    
    $.fn.grid = function(method) {
        if(this.size() != 1) {
            var err_msg = "You must use this plugin (" + pluginName + ") with a unique element (at once)";
            this.html('<span style="color: red;">' + 'ERROR: ' + err_msg + '</span>');
            $.error(err_msg);
        }

        // Method calling logic
        if(grid[method]) {
            return grid[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === "object" || !method) {
        	//init options
            return grid.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on jQuery." + pluginName);
        }

    };
})(jQuery);