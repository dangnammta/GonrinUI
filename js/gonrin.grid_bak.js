"use strict";
(function($) {
	var plugin_name = "gonrin_grid",
    pluginGivenOptions = "gonrin_grid_options",
    pluginStatus = "gonrin_grid_status";
	
	function classExists(c) {
	    return typeof(c) == "function" && typeof(c.prototype) == "object" ? true : false;
	}  
	// public grid
    var grid = {
		init: function(options) {
			var elem = this;

            return this.each(function() {

                /**
                 * store given options on first launch (in new object - no reference)
                 */
                if(typeof  elem.data(pluginGivenOptions) === "undefined") {
                    elem.data(pluginGivenOptions, $.extend(true, {}, options));
                }

                /**
                 * settings and defaults
                 * settings modification will affect elem.data(plugin_name) and vice versa
                 */
                var settings = elem.data(plugin_name);
                if(typeof settings === "undefined") {
                    var bootstrap_version = "3";
                    
                    var defaults = grid.get_defaults.call(elem, bootstrap_version);
                    // deep merge ('true' arg) is required, as there are object attibutes (paginationOptions, filterOptions)
                    settings = $.extend(true, {}, defaults, options);
                } else {
                    settings = $.extend(true, {}, settings, options);
                }
                elem.data(plugin_name, settings);

                // initialize plugin status
                if(typeof  elem.data(pluginStatus) === "undefined") {
                    elem.data(pluginStatus, {});
                }

                if(!settings.row_primary_key) {
                    settings.selected_ids = [];
                } else {
                    switch(settings.row_selection_mode) {
                        case "single":
                            if(settings.selected_ids.length > 1) {
                                settings.selected_ids = [];
                            }
                            break;
                        case false:
                            settings.selected_ids = [];
                            break;
                    }
                }
                var container_id = elem.attr("id");

                // apply container style
                elem.removeClass().addClass(settings.container_class);

                // bind events
                elem.unbind("cellclick").bind("cellclick", settings.on_cellclick);
                elem.unbind("rowclick").bind("rowclick", settings.on_rowclick);
                elem.unbind("griderror").bind("griderror", settings.on_griderror);
                elem.unbind("debug").bind("debug", settings.on_debug);
                elem.unbind("render").bind("render", settings.on_render);

                // initialize plugin html
                var tools_id = create_id(settings.tools_id_prefix, container_id),
                    columns_list_id = create_id(settings.columns_list_id_prefix, container_id),
                    default_columns_list = "",
                    sorting_list_id = create_id(settings.sorting_list_id_prefix, container_id),
                    default_sorting_list = "",
                    sorting_radio_name = create_id(settings.sorting_radio_name_prefix, container_id) + "_",
                    startPos, newPos,
                    selected_rows_id = create_id(settings.selected_rows_id_prefix, container_id),
                    selection_list_id = create_id(settings.selection_list_id_prefix, container_id),
                    table_container_id = create_id(settings.table_container_id_prefix, container_id),
                    table_id = create_id(settings.table_id_prefix, container_id),
                    no_results_id = create_id(settings.no_results_id_prefix, container_id),
                    filter_toggle_id = create_id(settings.filter_toggle_id_prefix, container_id),
                    custom_html1_id = create_id(settings.custom_html1_id_prefix, container_id),
                    custom_html2_id = create_id(settings.custom_html2_id_prefix, container_id),
                    pagination_id = create_id(settings.pagination_id_prefix, container_id),
                    filter_container_id = create_id(settings.filter_container_id_prefix, container_id),
                    filter_rules_id = create_id(settings.filter_rules_id_prefix, container_id),
                    filter_tools_id = create_id(settings.filter_tools_id_prefix, container_id),
                    elem_html = "", tools_html = "";

                // create basic html structure ---------------------------------
                elem_html += '<div id="' + tools_id + '" class="' + settings.tools_class + '"></div>';

                elem_html += '<div id="' + table_container_id + '" class="' + settings.datatable_container_class + '">';
                elem_html += '<table id="' + table_id + '" class="' + settings.datatable_class + '"></table>';
                elem_html += '</div>';

                elem_html += '<div id="' + no_results_id + '" class="' + settings.no_results_class + '">' + rsc_bs_dg.no_records_found + '</div>';

                if(settings.custom_html_element_id1) {
                    elem_html += '<div id="' + custom_html1_id + '"></div>';
                }

                elem_html += '<div id="' + pagination_id + '"></div>';

                if(settings.custom_html_element_id2) {
                    elem_html += '<div id="' + custom_html2_id + '"></div>';
                }

                if(settings.useFilters) {
                    elem_html += '<div id="' + filter_container_id + '" class="' + settings.filter_container_class + '">';

                    elem_html += '<div id="' + filter_rules_id + '"></div>';

                    elem_html += '<div id="' + filter_tools_id + '" class="' + settings.filter_tools_class + '">';
                    elem_html += '<button class="' + settings.filter_apply_btn_class + '">' + rsc_bs_dg.filters_apply + '</button>';
                    elem_html += '<button class="' + settings.filter_reset_btn_class + '">' + rsc_bs_dg.filters_reset + '</button>';

                    elem_html += '</div>';
                }

                elem_html += '</div>';

                elem.html(elem_html);
                $("#" + no_results_id).hide();

                var elem_tools = $("#" + tools_id),
                    elem_table = $("#" + table_id),
                    elem_pagination = $("#" + pagination_id);
                
                console.log(elem_pagination)

             // create toolbar ----------------------------------------------
                // columns list
                /*tools_html += '<div class="btn-group pull-right">';

                tools_html += '<button type="button" class="' + settings.columns_list_launch_button_class + '" data-toggle="dropdown" title="' + rsc_bs_dg.columns + '">';
                tools_html += '<span class="' + settings.columns_list_launch_button_icon_class + '"></span>';
                tools_html += '<span class="caret"></span>';
                tools_html += '</button>';

                tools_html += '<ul id="' + columns_list_id + '" class="' + settings.columns_list_class + '">';

                var col_name, col_checked,
                    col_list_len = 0;
                for(var i in settings.columns) {
                    if(column_is_function(settings.columns[i])) {
                        continue;
                    }
                    col_list_len++;
                    col_name = get_column_header(settings.columns[i]);
                    col_checked = column_is_visible(settings.columns[i]) ? " checked" : "";
                    default_columns_list += '<li><a href="javascript:void(0);">' +
                        '<label class="' + settings.columns_list_label_class + '">' +
                        '<input type="checkbox" class="' + settings.columns_list_check_class + '"' + col_checked + '> ' + col_name +
                        '</label>' +
                        '</a></li>';
                }
                default_columns_list += '<li class="not-sortable ' + settings.columns_list_divider_class + '"></li>';

                var row_index_checked = settings.show_row_numbers ? " checked" : "";
                default_columns_list += '<li class="not-sortable columns-li-padding"><label class="' + settings.columns_list_label_class + '"><input type="checkbox" class="' + settings.columns_list_check_class + '"' + row_index_checked + '>&nbsp;' + rsc_bs_dg.columns_show_row_numbers + '</label></li>';
                default_columns_list += '<li class="not-sortable ' + settings.columns_list_divider_class + '"></li>';
                default_columns_list += '<li class="not-sortable columns-li-padding"><button class="' + settings.columns_list_default_button_class + '">' + rsc_bs_dg.columns_default + '</button></li>';

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
                    var sort_name = get_sorting_name(settings.sorting[i]),
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
                default_sorting_list += '<li class="not-sortable ' + settings.columns_list_divider_class + '"></li>';
                default_sorting_list += '<li class="not-sortable columns-li-padding"><button class="' + settings.columns_list_default_button_class + '">' + rsc_bs_dg.sorting_default + '</button></li>';

                //save default columns list
                if(typeof elem.data(pluginStatus)["default_sorting_list"] === "undefined") {
                    elem.data(pluginStatus)["default_sorting_list"] = default_sorting_list;
                }

                tools_html += default_sorting_list;

                tools_html += '</ul>';

                tools_html += '</div>';

                // selection list ----------------------------------------------
                if(settings.row_primary_key &&
                    (settings.row_selection_mode == "single" || settings.row_selection_mode == "multiple")) {
                    tools_html += '<div class="btn-group pull-right">';

                    tools_html += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="' + rsc_bs_dg.select + '">';
                    tools_html += '<span class="' + settings.selectButtonIconClass + '"></span>';
                    tools_html += '<span id="' + selected_rows_id + '" class="' + settings.selected_rowsClass + '">' + settings.selected_ids.length + '</span>';
                    tools_html += '<span class="caret"></span>';
                    tools_html += '</button>';

                    tools_html += '<ul id="' + selection_list_id + '" class="dropdown-menu dropdown-menu-right">';

                    if(settings.row_selection_mode == "multiple") {
                        tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.select_all_in_page + '</a></li>';
                        tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.deselect_all_in_page + '</a></li>';
                        tools_html += '<li><a href="javascript:void(0);">' + rsc_bs_dg.select_inverse_in_page + '</a></li>';
                        tools_html += '<li class="not-sortable ' + settings.columns_list_divider_class + '"></li>';
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
                var grid_init = grid.display_grid_lc.call(elem, true);
                
                /**
                 * EVENTS ******************************************************
                 */

                //TOOLS - columns list -----------------------------------------
                //Edit later
                
             // row selection -----------------------------------------------
                if(settings.row_primary_key &&
                    (settings.row_selection_mode == "single" || settings.row_selection_mode == "multiple")) {

                    var row_prefix_len = (table_id + "_tr_").length;

                    // click on row
                    elem_table.off("click", "tbody tr").on("click", "tbody tr", function() {
                    	
                        var row_id = parseInt($(this).attr("id").substr(row_prefix_len)),
                            row_status,
                            idx = grid.selected_rows.call(elem, "selected_index", row_id);

                        if(idx > -1) {
                            grid.selected_rows.call(elem, "remove_id", idx);
                            grid.selected_rows.call(elem, "mark_deselected", row_id);
                            row_status = "deselected";
                        } else {
                            if(settings.row_selection_mode == "single") {
                                grid.selected_rows.call(elem, "clear_all_ids");
                                grid.selected_rows.call(elem, "mark_page_deselected");
                            }
                            grid.selected_rows.call(elem, "add_id", row_id);
                            grid.selected_rows.call(elem, "mark_selected", row_id);
                            row_status = "selected";
                        }

                        // update selected rows counter
                        grid.selected_rows.call(elem, "update_counter");

                        elem.triggerHandler("rowclick", {row_id: row_id, row_status: row_status});
                    });

                    // selection list
                    var elem_selection_list = $("#" + selection_list_id);

                    elem_selection_list.off("click", "li").on("click", "li", function() {
                        var sel_index = $(this).index();

                        if(settings.row_selection_mode == "single") {
                            grid.selected_rows.call(elem, "clear_all_ids");
                            grid.selected_rows.call(elem, "mark_page_deselected");
                        } else if(settings.row_selection_mode == "multiple") {

                            var selector_table_tr = "#" + table_id + " tbody tr",
                                row_prefix_len = (table_id + "_tr_").length,
                                row_id, idx;
                            switch(sel_index) {
                                case 0:
                                    $(selector_table_tr).each(function() {
                                        row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                        idx = grid.selected_rows.call(elem, "selected_index", row_id);
                                        if(idx == -1) {
                                            grid.selected_rows.call(elem, "add_id", row_id);
                                        }
                                    });
                                    grid.selected_rows.call(elem, "mark_page_selected");
                                    break;
                                case 1:
                                    $(selector_table_tr).each(function() {
                                        row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                        idx = grid.selected_rows.call(elem, "selected_index", row_id);
                                        if(idx > -1) {
                                            grid.selected_rows.call(elem, "remove_id", idx);
                                        }
                                    });
                                    grid.selected_rows.call(elem, "mark_page_deselected");
                                    break;
                                case 2:
                                    $(selector_table_tr).each(function() {
                                        row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                        idx = grid.selected_rows.call(elem, "selected_index", row_id);
                                        if(idx > -1) {
                                            grid.selected_rows.call(elem, "remove_id", idx);
                                        } else {
                                            grid.selected_rows.call(elem, "add_id", row_id);
                                        }
                                    });
                                    grid.selected_rows.call(elem, "mark_page_inversed");
                                    break;
                                case 4:
                                    grid.selected_rows.call(elem, "clear_all_ids");
                                    grid.selected_rows.call(elem, "mark_page_deselected");
                                    break;
                            }
                        }

                        // update selected rows counter
                        grid.selected_rows.call(elem, "update_counter");

                    });

                }
            });
        },
        render_data: function(page_data, page, total_pages, num_rows, refresh_pag){
        	var elem = this,
            container_id = elem.attr("id"),
	            s = grid.get_all_options.call(elem),
	            
	            table_id = create_id(s.table_id_prefix, container_id),
	            elem_table = $("#" + table_id),
	            
	            no_results_id = create_id(s.no_results_id_prefix, container_id),
	            elem_no_results = $("#" + no_results_id),
	            
	            filter_rules_id = create_id(s.filter_rules_id_prefix, container_id),
	            
	            pagination_id = create_id(s.pagination_id_prefix, container_id),
	            elem_pagination = $("#" + pagination_id),
	            err_msg;
        	
        	var server_error, filter_error, row_primary_key, total_rows, page_data_len, v,
            columns = s.fields,
            col_len = columns.length,
            column, c;
        	
        	total_rows = page_data.length;
            page_data_len = page_data.length;
            
            row_primary_key = s.row_primary_key;
            
         // replace null with empty string
            if(page_data_len > 0) {
                for(v = 0; v < page_data_len; v++) {
                    for(c = 0; c < col_len; c++) {
                        column = columns[c];
                        
                        if(column_is_visible.call(elem,column)) {
                        	
                            if(page_data[v][column["field"]] == null) {
                                page_data[v][column["field"]] = '';
                            }
                        }
                    }
                }
            };
            
         // create data table
            var page_num = parseInt(s.page),
                rows_per_page = parseInt(s.rows_per_page),
                sorting_indicator,
                row_id_html, i, row, tbl_html, row_index,
                offset = ((page_num - 1) * rows_per_page);

            tbl_html = '<thead>';
            row_id_html = (row_primary_key ? ' id="' + table_id + '_tr_0"' : '');
            tbl_html += '<tr' + row_id_html + '>';

            if(s.show_row_numbers) {
                tbl_html += '<th class="' + s.common_th_class + '">' + rsc_bs_dg.row_index_header + '</th>';
            };
            
            for(i in s.fields) {
                if(column_is_visible.call(elem,s.fields[i])) {
                    sorting_indicator = "";
                    if(s.show_sorting_indicator) {
                        var sorting_type = "none";
                        for(var e in s.sorting) {
                            if(s.sorting[e].field == s.fields[i].field) {
                                sorting_type = s.sorting[e].order;
                                break;
                            }
                        }
                        switch(sorting_type) {
                            case "ascending":
                            	sorting_indicator = '&nbsp;<span class="' + s.sorting_indicator_asc_class + '"></span>';
                                break;
                            case "descending":
                            	sorting_indicator = '&nbsp;<span class="' + s.sorting_indicator_desc_class + '"></span>';
                                break;
                            default:
                            	sorting_indicator = '';
                        }
                    }
                    tbl_html += '<th class="' + s.common_th_class + '">' + s.fields[i].label + sorting_indicator + '</th>';
                }
            }
            tbl_html += '</tr>';
            tbl_html += '</thead>';

            tbl_html += '<tbody>';
            for(row in page_data) {

                row_id_html = (row_primary_key ? ' id="' + table_id + '_tr_' + page_data[row][row_primary_key] + '"' : '');
                tbl_html += '<tr' + row_id_html + '>';

                if(s.show_row_numbers) {
                    row_index = offset + parseInt(row) + 1;
                    tbl_html += '<td>' + row_index + '</td>';
                }

                for(i in s.fields) {
                    if(column_is_visible.call(elem,s.fields[i])) {
                        tbl_html += '<td>' + page_data[row][s.fields[i].field] + '</td>';
                    }
                }

                tbl_html += '</tr>';
            }
            tbl_html += '<tbody>';
            elem_table.html(tbl_html);
            
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
            var col_index = s.show_row_numbers ? 1 : 0,
                headerClass = "", dataClass = "";
            for(i in s.columns) {
                if(column_is_visible.call(elem,s.columns[i])) {
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
            if(s.row_primary_key && s.selected_ids.length > 0) {

                if(s.row_selection_mode == "single" || s.row_selection_mode == "multiple") {
                    var row_prefix_len = (table_id + "_tr_").length,
                        row_id, idx;
                    $("#" + table_id + " tbody tr").each(function() {
                        row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                        idx = grid.selected_rows.call(elem, "selected_index", row_id);
                        if(idx > -1) {
                            grid.selected_rows.call(elem, "mark_selected", row_id);
                        }
                    });
                }
            }

            // update selected rows counter
            grid.selected_rows.call(elem, "update_counter");

            // trigger event onDisplay
            elem.triggerHandler("render");
        },
        
        display_grid_lc: function(refresh_pag) {
        	var elem = this,
	            s = grid.get_all_options.call(elem);
        	
        	var data_source = s["data_source"];
        	var page_data = [];
        	
        	//check data_source is Gonrin.CollectionView
        	if(typeof data_source === "object"){
        		if((!!data_source['_is_gonrin_view']) && (!!data_source.collection)){
        			console.log('instance of collection view');
        
        			var view = data_source;
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
                            elem.triggerHandler("onDatagridError", {err_code: "server_error", err_description: err_msg});
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
        			grid.render_data.call(elem, data_source, refresh_pag);
        		}
            	
            }
        },
        
        
        
        
        display_grid: function(refresh_pag) {

            var elem = this,
                container_id = elem.attr("id"),
                s = grid.get_all_options.call(elem),

                table_id = create_id(s.table_id_prefix, container_id),
                elem_table = $("#" + table_id),
                no_results_id = create_id(s.no_results_id_prefix, container_id),
                elem_no_results = $("#" + no_results_id),
                filter_rules_id = create_id(s.filter_rules_id_prefix, container_id),
                pagination_id = create_id(s.pagination_id_prefix, container_id),
                elem_pagination = $("#" + pagination_id),
                err_msg;

            // fetch page data and display datagrid
            var res = $.ajax({
                type: "POST",
                url: s.ajaxFetchDataURL,
                data: {
                    page_num: s.page_num,
                    rows_per_page: s.rows_per_page,
                    columns: s.columns,
                    sorting: s.sorting,
                    filter_rules: s.filterOptions.filter_rules,
                    debug_mode: s.debug_mode
                },
                dataType: "json",
                success: function(data) {
                    var server_error, filter_error, row_primary_key, total_rows, page_data, page_data_len, v,
                        columns = s.columns,
                        col_len = columns.length,
                        column, c;

                    server_error = data["error"];
                    if(server_error != null) {
                        err_msg = "ERROR: " + server_error;
                        elem.html('<span style="color: red;">' + err_msg + '</span>');
                        elem.triggerHandler("onDatagridError", {err_code: "server_error", err_description: server_error});
                        $.error(err_msg);
                    }

                    if(s.useFilters) {
                        var elem_filter_rules = $("#" + filter_rules_id);
                        filter_error = data["filter_error"];
                        if(filter_error["error_message"] != null) {
                            elem_filter_rules.jui_filter_rules("markRuleAsError", filter_error["element_rule_id"], true);
                            elem_filter_rules.triggerHandler("onValidationError", {err_code: "filter_validation_server_error", err_description: filter_error["error_message"]});
                            $.error(filter_error["error_message"]);
                        }
                    }

                    total_rows = data["total_rows"];
                    page_data = data["page_data"];
                    page_data_len = page_data.length;

                    elem.data(pluginStatus)["total_rows"] = total_rows;

                    row_primary_key = s.row_primary_key;

                    if(s.debug_mode == "yes") {
                        elem.triggerHandler("onDebug", {debug_message: data["debug_message"]});
                    }

                    // replace null with empty string
                    if(page_data_len > 0) {
                        for(v = 0; v < page_data_len; v++) {
                            for(c = 0; c < col_len; c++) {
                                column = columns[c];
                                if(column_is_visible.call(elem,column)) {
                                    if(page_data[v][column["field"]] == null) {
                                        page_data[v][column["field"]] = '';
                                    }
                                }
                            }
                        }
                    }

                    // create data table
                    var page_num = parseInt(s.page_num),
                        rows_per_page = parseInt(s.rows_per_page),
                        sortingIndicator,
                        row_id_html, i, row, tbl_html, row_index,
                        offset = ((page_num - 1) * rows_per_page);

                    tbl_html = '<thead>';
                    row_id_html = (row_primary_key ? ' id="' + table_id + '_tr_0"' : '');
                    tbl_html += '<tr' + row_id_html + '>';

                    if(s.show_row_numbers) {
                        tbl_html += '<th class="' + s.common_th_class + '">' + rsc_bs_dg.row_index_header + '</th>';
                    }

                    for(i in s.columns) {
                        if(column_is_visible.call(elem,s.columns[i])) {
                            sortingIndicator = "";
                            if(s.showSortingIndicator) {
                                var sorting_type = "none";
                                for(var e in s.sorting) {
                                    if(s.sorting[e].field == s.columns[i].field) {
                                        sorting_type = s.sorting[e].order;
                                        break;
                                    }
                                }
                                switch(sorting_type) {
                                    case "ascending":
                                        sortingIndicator = '&nbsp;<span class="' + s.sorting_indicator_asc_class + '"></span>';
                                        break;
                                    case "descending":
                                        sortingIndicator = '&nbsp;<span class="' + s.sorting_indicator_desc_class + '"></span>';
                                        break;
                                    default:
                                        sortingIndicator = '';
                                }
                            }
                            tbl_html += '<th class="' + s.common_th_class + '">' + s.columns[i].header + sortingIndicator + '</th>';
                        }
                    }
                    tbl_html += '</tr>';
                    tbl_html += '</thead>';

                    tbl_html += '<tbody>';
                    for(row in page_data) {

                        row_id_html = (row_primary_key ? ' id="' + table_id + '_tr_' + page_data[row][row_primary_key] + '"' : '');
                        tbl_html += '<tr' + row_id_html + '>';

                        if(s.show_row_numbers) {
                            row_index = offset + parseInt(row) + 1;
                            tbl_html += '<td>' + row_index + '</td>';
                        }

                        for(i in s.columns) {
                            if(column_is_visible.call(elem,s.columns[i])) {
                                tbl_html += '<td>' + page_data[row][s.columns[i].field] + '</td>';
                            }
                        }

                        tbl_html += '</tr>';
                    }
                    tbl_html += '<tbody>';

                    elem_table.html(tbl_html);

                    // refresh pagination (if needed)
                    if(refresh_pag) {
                        elem_pagination.bs_pagination({
                            currentPage: s.page_num,
                            totalPages: Math.ceil(total_rows / s.rows_per_page),
                            totalRows: total_rows
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
                    var col_index = s.show_row_numbers ? 1 : 0,
                        headerClass = "", dataClass = "";
                    for(i in s.columns) {
                        if(column_is_visible.call(elem,s.columns[i])) {
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
                    if(s.row_primary_key && s.selected_ids.length > 0) {

                        if(s.row_selection_mode == "single" || s.row_selection_mode == "multiple") {
                            var row_prefix_len = (table_id + "_tr_").length,
                                row_id, idx;
                            $("#" + table_id + " tbody tr").each(function() {
                                row_id = parseInt($(this).attr("id").substr(row_prefix_len));
                                idx = grid.selected_rows.call(elem, "selected_index", row_id);
                                if(idx > -1) {
                                    grid.selected_rows.call(elem, "mark_selected", row_id);
                                }
                            });
                        }
                    }

                    // update selected rows counter
                    grid.selected_rows.call(elem, "update_counter");

                    // trigger event onDisplay
                    elem.triggerHandler("onDisplay");

                }
            });

            return res;

        },
        selected_rows: function(action, id) {
            var elem = this,
                container_id = elem.attr("id"),
                s = grid.get_all_options.call(elem),
                table_id = create_id(grid.get_option.call(elem, "table_id_prefix"), container_id),
                selectedTrClass = grid.get_option.call(elem, "selectedTrClass"),
                selector_table_tr = "#" + table_id + " tbody tr",
                table_tr_prefix = "#" + table_id + "_tr_";

            switch(action) {
                case "get_ids":
                    return s.selected_ids;
                    break;
                case "clear_all_ids":
                    s.selected_ids = [];
                    break;
                case "update_counter":
                    var selected_rows_id = create_id(grid.get_option.call(elem, "selected_rows_id_prefix"), container_id);
                    $("#" + selected_rows_id).text(s.selected_ids.length);
                    break;
                case "selected_index":
                    return $.inArray(id, s.selected_ids);
                    break;
                case "add_id":
                    s.selected_ids.push(id);
                    break;
                case "remove_id":
                    s.selected_ids.splice(id, 1);
                    break;
                case "mark_selected":
                    $(table_tr_prefix + id).addClass(selectedTrClass);
                    break;
                case "mark_deselected":
                    $(table_tr_prefix + id).removeClass(selectedTrClass);
                    break;
                case "mark_page_selected":
                    $(selector_table_tr).addClass(selectedTrClass);
                    break;
                case "mark_page_deselected":
                    $(selector_table_tr).removeClass(selectedTrClass);
                    break;
                case "mark_page_inversed":
                    $(selector_table_tr).toggleClass(selectedTrClass);
                    break;
            }

        },
        /**
         * Get plugin version
         * @returns {string}
         */
        get_version: function() {
            return "0.0.1";
        },
        /**
         * Get any option set to plugin using its name (as string)
         *
         * @example $(element).bs_grid("get_option", some_option);
         * @param {String} opt
         * @return {*}
         */
        get_option: function(opt) {
            var elem = this;
            return elem.data(plugin_name)[opt];
        },

        /**
         * Get all options
         * @example $(element).bs_grid("get_all_options");
         * @return {*}
         */
        get_all_options: function() {
            var elem = this;
            return elem.data(plugin_name);
        },

        /**
         * Get default values
         * @example $(element).bs_grid("getDefaults", "3");
         * @return {Object}
         */
        get_defaults: function(bootstrap_version) {
            var default_settings = {
            	page: 1,
                rows_per_page: 10,
                max_rows_per_page: 100,
                row_primary_key: "",
                row_selection_mode: "single", // "multiple", "single", false
                selected_ids: [],

                /**
                 * MANDATORY PROPERTIES: field
                 * UNIQUE PROPERTIES: field
                 * {field: "customer_id", header: "Code", visible: "no", is_function: "no", "headerClass": "th_code hidden-xs", "dataClass": "td_code hidden-xs"},
                 */
                fields: [],
                visible_columns : [],

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
                pagination_options: {
                    container_class: "well pagination-container",
                    visible_page_links: 5,
                    show_goto_page: false,
                    show_rows_per_page: false,
                    show_rows_info: false,
                    show_rows_default_info: true,
                    disable_text_selection_in_navpane: true
                }, // "currentPage", "rows_per_page", "maxrows_per_page", "totalPages", "totalRows", "bootstrap_version", "onChangePage" will be ignored

                /**
                 * See jui_filter_rules plugin documentation
                 */
                filter_options: {
                    filters: [],
                    filter_rules: []
                }, // "bootstrap_version", "onSetRules", "onValidationError" will be ignored

                use_filters: true,
                show_row_numbers: false,
                show_sorting_indicator: true,
                use_sortable_ists: true,
                custom_html_element_id1: "",
                custom_html_element_id2: "",

                /* STYLES ----------------------------------------------------*/
                bootstrap_version: "3",

                // bs 3
                container_class: "grid_container",
                no_results_class: "alert alert-warning no-records-found",

                tools_class: "tools",

                columns_list_launch_button_class: "btn btn-default dropdown-toggle",
                columns_list_launch_button_icon_class: "glyphicon glyphicon-th",
                columns_list_class: "dropdown-menu dropdown-menu-right",
                columns_list_label_class: "columns-label",
                columns_list_check_class: "col-checkbox",
                columns_list_divider_class: "divider",
                columns_list_default_button_class: "btn btn-primary btn-xs btn-block",

                sorting_list_launch_button_icon_class: "glyphicon glyphicon-sort",
                sorting_label_checkbox_class: "radio-inline",
                sorting_name_class: "sorting-name",

                select_button_icon_class: "glyphicon  glyphicon-check",
                selected_rows_class: "selected-rows",

                filter_toggle_button_icon_class: "glyphicon glyphicon-filter",
                filter_toggle_active_class: "btn-info",

                sorting_indicator_asc_class: "glyphicon glyphicon-chevron-up text-muted",
                sorting_indicator_desc_class: "glyphicon glyphicon-chevron-down text-muted",

                datatable_container_class: "table-responsive",
                datatable_class: "table table-bordered table-hover",
                common_th_class: "th-common",
                selected_tr_class: "warning",

                filter_container_class: "well filters-container",
                filter_tools_class: "",
                filter_apply_btn_class: "btn btn-primary btn-sm filters-button",
                filter_reset_btn_class: "btn btn-default btn-sm filters-button",

                // prefixes
                tools_id_prefix: "tools_",
                columns_list_id_prefix: "columns_list_",
                sorting_list_id_prefix: "sorting_list_",
                sorting_radio_name_prefix: "sort_radio_",
                selected_rows_id_prefix: "selected_rows_",
                selection_list_id_prefix: "selection_list_",
                filter_toggle_id_prefix: "filter_toggle_",

                table_container_id_prefix: "tbl_container_",
                table_id_prefix: "tbl_",

                no_results_id_prefix: "no_res_",

                custom_html1_id_prefix: "custom1_",
                custom_html2_id_prefix: "custom2_",

                pagination_id_prefix: "pag_",
                filter_container_id_prefix: "flt_container_",
                filter_rules_id_prefix: "flt_rules_",
                filter_tools_id_prefix: "flt_tools_",

                // misc
                debug_mode: "no",

                // events
                on_cellclick: function() {
                },
                on_rowclick: function() {
                },
                on_griderror: function() {
                },
                on_debug: function() {
                },
                on_render: function() {
                }
            };
            return default_settings;
        },

        
		
    };
    /**
     * Create element id
     * @function
     * @param prefix
     * @param plugin_container_id
     * @return {*}
     */
    var create_id = function(prefix, plugin_container_id) {
        return prefix + plugin_container_id;
    };
	
	var array_move = function(arr, fromIndex, toIndex) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    };
    
    var column_is_function = function(column) {
        var is_function = "is_function";
        return column.hasOwnProperty(is_function) && column[is_function] == "yes";
    };
    
    var get_column_header = function(column) {
        return column.hasOwnProperty("header") ? column["header"] : column["field"];
    };
    /**
     * Get sorting name (utility function)
     *
     * @param {object} sorting
     * @returns {string}
     */
    var get_sorting_name = function(sorting) {
        return sorting.hasOwnProperty("sortingName") ? sorting["sortingName"] : sorting["field"];
    };

    /**
     * Check if column is sortable (utility function)
     *
     * @param {object} column
     * @returns {boolean}
     */
    var column_is_sortable = function(column) {
        return !column.hasOwnProperty("sortable") || (column.hasOwnProperty("sortable") && column["sortable"] == "yes");
    };
    
    /**
     * Check if column is visible (utility function)
     *
     * @param {object} column
     * @returns {boolean}
     */
    var column_is_visible = function(column) {
    	var elem = this,
    	s = grid.get_all_options.call(elem);
    	
    	var visible_columns = s.visible_columns;
        //var visible = "visible";
        //return !column.hasOwnProperty(visible) || (column.hasOwnProperty(visible) && column[visible] === true);
    	if(column && column.field && visible_columns){
    		if(visible_columns)
    			return ($.inArray( column.field, visible_columns ) !== -1);
    	};
    	return false;
    };

    /**
     * Set column visible property (utility function)
     *
     * @param {object} column
     * @param {boolean} status
     */
    var set_column_visible = function(column, status) {
        var visible = "visible";
        if(status) {
            if(column.hasOwnProperty(visible)) {
                delete column[visible];
            }
        } else {
            column[visible] = "no";
        }
    };
    
    $.fn.grid = function(method) {

        if(this.size() != 1) {
            var err_msg = "You must use this plugin (" + plugin_name + ") with a unique element (at once)";
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
            $.error("Method " + method + " does not exist on jQuery." + plugin_name);
        }

    };
})(jQuery);