(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD is used - Register as an anonymous module.
        define(['jquery', 'gonrin'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('gonrin'));
    } else {
        // Neither AMD nor CommonJS used. Use global variables.
        if (typeof jQuery === 'undefined') {
            throw 'gonrin.excel requires jQuery to be loaded first';
        }
        if (typeof gonrin === 'undefined') {
            throw 'gonrin.excel requires gonrin.core.js to be loaded first';
        }
        factory(jQuery, gonrin);
    }
}(function ($, gonrin) {
	'use strict';
	if (!gonrin) {
		throw 'gonrin.excel requires gonrin.core.js to be loaded first';
    }
	
/*****************************************/
	
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	var fromCharCode = String.fromCharCode;
	var INVALID_CHARACTER_ERR = (function () {
	        "use strict";
	        // fabricate a suitable error object
	        try {
	            document.createElement('$');
	        } catch (error) {
	            return error;
	        }
	    }());

	// encoder
	if (!window.btoa) {
	    window.btoa = function (string) {
	        "use strict";
	        var a, b, b1, b2, b3, b4, c, i = 0, len = string.length, max = Math.max, result = '';

	        while (i < len) {
	            a = string.charCodeAt(i++) || 0;
	            b = string.charCodeAt(i++) || 0;
	            c = string.charCodeAt(i++) || 0;

	            if (max(a, b, c) > 0xFF) {
	                throw INVALID_CHARACTER_ERR;
	            }

	            b1 = (a >> 2) & 0x3F;
	            b2 = ((a & 0x3) << 4) | ((b >> 4) & 0xF);
	            b3 = ((b & 0xF) << 2) | ((c >> 6) & 0x3);
	            b4 = c & 0x3F;

	            if (!b) {
	                b3 = b4 = 64;
	            } else if (!c) {
	                b4 = 64;
	            }
	            result += characters.charAt(b1) + characters.charAt(b2) + characters.charAt(b3) + characters.charAt(b4);
	        }
	        return result;
	    };
	}

	// decoder
	if (!window.atob) {
	    window.atob = function(string) {
	        "use strict";
	        string = string.replace(new RegExp("=+$"), '');
	        var a, b, b1, b2, b3, b4, c, i = 0, len = string.length, chars = [];

	        if (len % 4 === 1) {
	            throw INVALID_CHARACTER_ERR;
	        }

	        while (i < len) {
	            b1 = characters.indexOf(string.charAt(i++));
	            b2 = characters.indexOf(string.charAt(i++));
	            b3 = characters.indexOf(string.charAt(i++));
	            b4 = characters.indexOf(string.charAt(i++));

	            a = ((b1 & 0x3F) << 2) | ((b2 >> 4) & 0x3);
	            b = ((b2 & 0xF) << 4) | ((b3 >> 2) & 0xF);
	            c = ((b3 & 0x3) << 6) | (b4 & 0x3F);

	            chars.push(fromCharCode(a));
	            b && chars.push(fromCharCode(b));
	            c && chars.push(fromCharCode(c));
	        }
	        return chars.join('');
	    };
	}
	
	
	var Spreadsheet = function(options){
		var template = {
                head: "<html xmlns:o=\"urn:schemas-microsoft-com:office:office\" xmlns:x=\"urn:schemas-microsoft-com:office:excel\" xmlns=\"http://www.w3.org/TR/REC-html40\"><head><meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>",
                sheet: {
                    head: "<x:ExcelWorksheet><x:Name>",
                    tail: "</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>"
                },
                mid: "</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>",
                table: {
                    head: "<table>",
                    tail: "</table>"
                },
                foot: "</body></html>"
            };
		
		
		var grobject = {},
		data, //datalist
		/*Private Function*/
		save_excel = function(){
			//return down load exxcel
            if(options.sheets.length == 0){
            	return;
            }
            var sheet = options.sheets[0];
            var table = [];
            
            var datasource = sheet.data_source;
            if(!datasource){
            	return;
            }
            
            var fullTemplate="", i, link, a;
            
            //table header
            var tbl_html = '<tr>';
            
            for(i in sheet.fields) {
            	if(sheet.fields[i].label){
            		tbl_html += '<td><b>' + sheet.fields[i].label +'</b></td>';
            	}else{
            		tbl_html += '<td><b>' + sheet.fields[i].field +'</b></td>';
            	}
                    
            }
            tbl_html += '</tr>';
            table.push(tbl_html);
            
            for(var row in datasource) {
            	var tr_tbl_html = "<tr>";

                for(i in sheet.fields) {
                	
                    tr_tbl_html += '<td>' + (datasource[row][sheet.fields[i].field] || "") + '</td>';  
                }
            	tr_tbl_html += "</tr>";
            	table.push(tr_tbl_html);
            }
            

			//console.log("save_excel");
			var uri = "data:application/vnd.ms-excel;base64,";
            var base64 = function (s) {
                return window.btoa(unescape(encodeURIComponent(s)));
            };
            
            var format = function (s, c) {
                return s.replace(/{(\w+)}/g, function (m, p) {
                    return c[p];
                });
            };
			
            var ctx = {
                worksheet: name || "Worksheet",
                table: table
            };

            fullTemplate= template.head;

            if ( $.isArray(table) ) {
                for (i in table) {
                    //fullTemplate += e.template.sheet.head + "{worksheet" + i + "}" + e.template.sheet.tail;
                    fullTemplate += template.sheet.head + "Table" + i + "" + template.sheet.tail;
                }
            }

            fullTemplate += template.mid;

            if ( $.isArray(table) ) {
                for (i in table) {
                    fullTemplate += template.table.head + "{table" + i + "}" + template.table.tail;
                }
            }

            fullTemplate += template.foot;
            for (i in table) {
                ctx["table" + i] = table[i];
            }
            delete ctx.table;
            
            
            link = uri + base64(format(fullTemplate, ctx));
            a = document.createElement("a");
            a.download = options.excel.file_name;
            a.href = link;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return true;
		},
		create_sheet = function (config) {
            config = config || {};
            _.defaults(config, {
                name: 'Sheet '.concat(this.worksheets.length + 1)
            });
            return new Worksheet(config);
        },
		bind_sheet_data = function(){
			for(var i = 0; i < options.sheets.length; i++){
				var sheet = options.sheets[i];
				sheet.name = sheet.name || "";
				sheet.rows = sheet.rows || [];
				
				//sheet.header = sheet.rows || [];
				if((sheet.rows.length == 0) && (!sheet.data_source) && $.isArray(sheet.data_source)){
					console.log("bindata");
				}
				
			}
			
			return grobject;
		};
		bind_sheet_data();
		console.log(options);
		/*Public Method*/
		grobject.save_excel = save_excel 
		return grobject;
	}
	
	gonrin.spreadsheet = function (options) {
		options = $.extend(true, {}, gonrin.spreadsheet.defaults, options);
		options.excel.file_name = options.excel.file_name || null;
		return Spreadsheet(options);
    };
    
    

    gonrin.spreadsheet.defaults = {
    	defaults: {
    		fontsize : 12,
    	},
    	sheets: [],
    	excel:{},
    };
}));