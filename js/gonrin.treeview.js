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
	var TreeView = function (element, options) {
		var gonrin = window.gonrin;
		var grobject = {},
		pluginName = "treeview",
		template = {
			list: '<ul class="list-group"></ul>',
			item: '<li class="list-group-item"></li>',
			indent: '<span class="indent"></span>',
			icon: '<span class="icon"></span>',
			link: '<a href="#" style="color:inherit;"></a>',
			badge: '<span class="badge"></span>'
		},
		_default = {
			options : {
				silent: false,
				ignoreChildren: false
			},
			searchOptions : {
				ignoreCase: true,
				exactMatch: false,
				revealResults: true
			}
		},
		initialized = false,
		elementId = element.attr("id"),
		tree = [],
		nodes = [],
		wrapper = null,
		setInitialStates = function (node, level) {
			if (!node[options.nodesField]) return;
			level += 1;
			
			var parent = node;
			//var _this = this;
			$.each(node[options.nodesField], function checkStates(index, node) {

				// nodeId : unique, incremental identifier
				node.nodeId = nodes.length;

				// parentId : transversing up the tree
				node.parentId = parent.nodeId;

				// if not provided set selectable default value
				if (!node.hasOwnProperty('selectable')) {
					node.selectable = true;
				}

				// where provided we should preserve states
				node.state = node.state || {};

				// set checked state; unless set always false
				if (!node.state.hasOwnProperty('checked')) {
					node.state.checked = false;
				}

				// set enabled state; unless set always false
				if (!node.state.hasOwnProperty('disabled')) {
					node.state.disabled = false;
				}

				// set expanded state; if not provided based on levels
				if (!node.state.hasOwnProperty('expanded')) {
					if (!node.state.disabled &&
							(level < options.levels) &&
							(node[options.nodesField] && node[options.nodesField].length > 0)) {
						node.state.expanded = true;
					}
					else {
						node.state.expanded = false;
					}
				}

				// set selected state; unless set always false
				if (!node.state.hasOwnProperty('selected')) {
					node.state.selected = false;
				}

				// index nodes in a flattened structure for use later
				nodes.push(node);

				// recurse child nodes and transverse the tree
				if (node[options.nodesField]) {
					setInitialStates(node, level);
				}
			});
        },
        setExpandedState = function (node, state) {

    		if (state === node.state.expanded) return;

    		if (state && node[options.nodesField]) {

    			// Expand a node
    			node.state.expanded = true;
    			if (!options.silent) {
    				element.trigger('nodeExpanded', $.extend(true, {}, node));
    			}
    		}
    		else if (!state) {

    			// Collapse a node
    			node.state.expanded = false;
    			if (!options.silent) {
    				element.trigger('nodeCollapsed', $.extend(true, {}, node));
    			}

    			// Collapse child nodes
    			/*TODO: check ky proxy*/
    			if (node[options.nodesField] && !options.ignoreChildren) {
    				$.each(node[options.nodesField], $.proxy(function (index, node) {
    					setExpandedState(node, false);
    				}, this));
    			}
    		}
    	},
    	getNodeValue = function (obj, attr) {
    		var index = attr.indexOf('.');
    		if (index > 0) {
    			var _obj = obj[attr.substring(0, index)];
    			var _attr = attr.substring(index + 1, attr.length);
    			return getNodeValue(_obj, _attr);
    		}
    		else {
    			if (obj.hasOwnProperty(attr)) {
    				return obj[attr].toString();
    			}
    			else {
    				return undefined;
    			}
    		}
    	},
    	findNodes = function (pattern, modifier, attribute) {
    		modifier = modifier || 'g';
    		attribute = attribute || 'text';
    		return $.grep(nodes, function (node) {
    			var val = getNodeValue(node, attribute);
    			
    			if (typeof val === 'string') {
    				return val.match(new RegExp(pattern, modifier));
    			}
    		});
    	},
        toggleExpandedState = function (node) {
    		if (!node) return;
    		setExpandedState(node, !node.state.expanded);
    	},
    	setSelectedState = function (node, state) {

    		if (state === node.state.selected) return;

    		if (state) {

    			// If multiSelect false, unselect previously selected
    			if (!options.multiSelect) {
    				$.each(findNodes('true', 'g', 'state.selected'), $.proxy(function (index, node) {
    					setSelectedState(node, false);
    				}, this));
    			}

    			// Continue selecting node
    			node.state.selected = true;
    			if (!options.silent) {
    				element.trigger('nodeSelected', $.extend(true, {}, node));
    			}
    		}
    		else {

    			// Unselect node
    			node.state.selected = false;
    			if (!options.silent) {
    				element.trigger('nodeUnselected', $.extend(true, {}, node));
    			}
    		}
    	},
    	setCheckedState = function (node, state) {

    		if (state === node.state.checked) return;

    		if (state) {

    			// Check node
    			node.state.checked = true;

    			if (!options.silent) {
    				element.trigger('nodeChecked', $.extend(true, {}, node));
    			}
    		}
    		else {

    			// Uncheck node
    			node.state.checked = false;
    			if (!options.silent) {
    				element.trigger('nodeUnchecked', $.extend(true, {}, node));
    			}
    		}
    	},
    	toggleCheckedState = function (node) {
    		if (!node) return;
    		setCheckedState(node, !node.state.checked);
    	},
    	toggleSelectedState = function (node) {
    		if (!node) return;
    		setSelectedState(node, !node.state.selected);
    	},
        clickHandler = function (event) {
        	
        	if (!options.enableLinks) event.preventDefault();

    		var target = $(event.target);
    		var node = findNode(target);
    		if (!node || node.state.disabled) return;
    		
    		var classList = target.attr('class') ? target.attr('class').split(' ') : [];
    		if ((classList.indexOf('expand-icon') !== -1)) {

    			toggleExpandedState(node);
    			render();
    		}
    		else if ((classList.indexOf('check-icon') !== -1)) {
    			
    			toggleCheckedState(node);
    			render();
    		}
    		else {
    			
    			if (node.selectable) {
    				toggleSelectedState(node);
    			} else {
    				toggleExpandedState(node);
    			}

    			render();
    		}
        },
        forEachIdentifier = function (identifiers, callback) {

    		//options = $.extend({}, _default.options, options);

    		if (!(identifiers instanceof Array)) {
    			identifiers = [identifiers];
    		}

    		$.each(identifiers, $.proxy(function (index, identifier) {
    			callback(identifyNode(identifier), options);
    		}, this));	
    	},
        identifyNode = function (identifier) {
    		return ((typeof identifier) === 'number') ?
    						nodes[identifier] :
    						identifier;
    	},
        clearSearch = function (options) {

    		//options = $.extend({}, { render: true }, options);

    		var results = $.each(findNodes('true', 'g', 'searchResult'), function (index, node) {
    			node.searchResult = false;
    		});

    		if (options.render) {
    			render();	
    		}
    		
    		element.trigger('searchCleared', $.extend(true, {}, results));
    	},
        injectStyle = function () {
        	return;
        },
        findNode = function (target) {
    		var nodeId = target.closest('li.list-group-item').attr('data-nodeid');
    		var node = nodes[nodeId];
    		if (!node) {
    			console.log('Error: node does not exist');
    		}
    		return node;
    	},
    	buildStyleOverride = function(node){
    		if (node.state.disabled) return '';
    		var color = node.color;
    		var backColor = node.backColor;

    		if (options.highlightSelected && node.state.selected) {
    			if (options.selectedColor) {
    				color = options.selectedColor;
    			}
    			if (options.selectedBackColor) {
    				backColor = options.selectedBackColor;
    			}
    		}

    		if (options.highlightSearchResults && node.searchResult && !node.state.disabled) {
    			if (options.searchResultColor) {
    				color = this.options.searchResultColor;
    			}
    			if (options.searchResultBackColor) {
    				backColor = options.searchResultBackColor;
    			}
    		}
    		
    		return 'color:' + color +
    			';background-color:' + backColor + ';';
    	},
    	buildTree = function (nodes, level) {
    		if (!nodes) return;
    		level += 1;
    		
    		$.each(nodes, function addNodes(id, node) {
    			var treeItem = $(template.item)
					.addClass('node-' + elementId)
					.addClass(node.state.checked ? 'node-checked' : '')
					.addClass(node.state.disabled ? 'node-disabled': '')
					.addClass(node.state.selected ? 'node-selected' : '')
					.addClass(node.searchResult ? 'search-result' : '') 
					.attr('data-nodeid', node.nodeId)
					.attr('style', buildStyleOverride(node));
	
				// Add indent/spacer to mimic tree structure
				for (var i = 0; i < (level - 1); i++) {
					treeItem.append(template.indent);
				}
				// Add expand, collapse or empty spacer icons
				var classList = [];
				if (node[options.nodesField]) {
					classList.push('expand-icon');
					if (node.state.expanded) {
						classList.push(options.collapseIcon);
					}
					else {
						classList.push(options.expandIcon);
					}
				}
				else {
					classList.push(options.emptyIcon);
				}
				
				treeItem.append($(template.icon).addClass(classList.join(' ')));
				
				// Add node icon
				if (options.showIcon) {
					
					var classList = ['node-icon'];

					classList.push(node.icon || options.nodeIcon);
					if (node.state.selected) {
						classList.pop();
						classList.push(node.selectedIcon || options.selectedIcon || 
										node.icon || options.nodeIcon);
					}

					treeItem.append($(template.icon).addClass(classList.join(' ')));
				}
				
				// Add check / unchecked icon
				if (options.showCheckbox) {

					var classList = ['check-icon'];
					if (node.state.checked) {
						classList.push(options.checkedIcon); 
					}
					else {
						classList.push(options.uncheckedIcon);
					}

					treeItem.append($(template.icon).addClass(classList.join(' ')));
				}
				
				// Add text
				if (options.enableLinks) {
					// Add hyperlink
					treeItem.append($(template.link).attr('href', node.href).append(node[options.textField]));
				}
				else {
					// otherwise just text
					treeItem.append(node[options.textField]);
				}
				// Add tags as badges
				if (options.showTags && node.tags) {
					$.each(node.tags, function addTag(id, tag) {
						treeItem.append($(template.badge).append(tag));
					});
				}
				
				
				// Add item to the tree
				wrapper.append(treeItem);

				// Recursively add child ndoes
				if (node[options.nodesField] && node.state.expanded && !node.state.disabled) {
					return buildTree(node[options.nodesField], level);
				}
    		});
        	return;
        },
        
        unsubscribeEvents = function (){
        	element.off('click');
    		element.off('nodeChecked');
    		element.off('nodeCollapsed');
    		element.off('nodeDisabled');
    		element.off('nodeEnabled');
    		element.off('nodeExpanded');
    		element.off('nodeSelected');
    		element.off('nodeUnchecked');
    		element.off('nodeUnselected');
    		element.off('searchComplete');
    		element.off('searchCleared');
        },
        subscribeEvents = function (){
        	unsubscribeEvents();
    		element.on('click', $.proxy(clickHandler, this));

    		if (typeof (options.onNodeChecked) === 'function') {
    			element.on('nodeChecked', options.onNodeChecked);
    		}

    		if (typeof (options.onNodeCollapsed) === 'function') {
    			element.on('nodeCollapsed', options.onNodeCollapsed);
    		}

    		if (typeof (options.onNodeDisabled) === 'function') {
    			element.on('nodeDisabled', options.onNodeDisabled);
    		}

    		if (typeof (options.onNodeEnabled) === 'function') {
    			element.on('nodeEnabled', options.onNodeEnabled);
    		}

    		if (typeof (options.onNodeExpanded) === 'function') {
    			element.on('nodeExpanded', options.onNodeExpanded);
    		}

    		if (typeof (options.onNodeSelected) === 'function') {
    			element.on('nodeSelected', options.onNodeSelected);
    		}

    		if (typeof (options.onNodeUnchecked) === 'function') {
    			element.on('nodeUnchecked', options.onNodeUnchecked);
    		}

    		if (typeof (options.onNodeUnselected) === 'function') {
    			element.on('nodeUnselected', options.onNodeUnselected);
    		}

    		if (typeof (options.onSearchComplete) === 'function') {
    			element.on('searchComplete', options.onSearchComplete);
    		}

    		if (typeof (options.onSearchCleared) === 'function') {
    			element.on('searchCleared', options.onSearchCleared);
    		}
        },
        getParent = function (identifier) {
    		var node = identifyNode(identifier);
    		return nodes[node.parentId];
    	},
        checkNode = function (identifiers) {
    		forEachIdentifier(identifiers, function (node, options) {
    			setCheckedState(node, true);
    		});
    		render();
    	},
        destroy = function (){
        	if (!initialized) return;

    		wrapper.remove();
    		wrapper = null;

    		// Switch off events
    		unsubscribeEvents();

    		// Reset this.initialized flag
    		initialized = false;
        },
    	render = function () {
    		if (!initialized) {
    			// Setup first time only components
    			element.addClass(pluginName);
    			wrapper = $(template.list);

    			injectStyle();
    			initialized = true;
    		}
    		element.empty().append(wrapper.empty());
    		// Build tree
    		buildTree(tree, 0);
    	},
    	getSelected = function () {
    		return findNodes('true', 'g', 'state.selected');
    	},
    	getChecked = function () {
    		return findNodes('true', 'g', 'state.checked');
    	}
		;
	
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
		grobject.getSelected = getSelected;
		grobject.getChecked = getChecked;
		grobject.checkNode = checkNode;
		grobject.getParent = getParent;
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

        // initializing element
        if (options.data) {
			if (typeof options.data === 'string') {
				options.data = $.parseJSON(options.data);
			}
			tree = $.extend(true, [], options.data);
		}
        elementId = element.id;
        destroy();
		subscribeEvents();
		var treeWrap = {};
		treeWrap[options.nodesField] = tree;
		setInitialStates(treeWrap, 0);
        render();
        return grobject;
	};
	
/*****************************************/
	
	$.fn.treeview = function (options) {
        return this.each(function () {
            var $this = $(this);
            if (!$this.data('gonrin')) {
                // create a private copy of the defaults object
                options = $.extend(true, {}, $.fn.treeview.defaults, options);
                $this.data('gonrin', TreeView($this, options));
            }
        });
    };
    $.fn.treeview.defaults = {
		injectStyle: true,

		levels: 2,

		expandIcon: 'glyphicon glyphicon-plus',
		collapseIcon: 'glyphicon glyphicon-minus',
		emptyIcon: 'glyphicon',
		nodeIcon: '',
		selectedIcon: '',
		checkedIcon: 'glyphicon glyphicon-check',
		uncheckedIcon: 'glyphicon glyphicon-unchecked',

		color: undefined, // '#000000',
		backColor: undefined, // '#FFFFFF',
		borderColor: undefined, // '#dddddd',
		onhoverColor: '#F5F5F5',
		selectedColor: '#FFFFFF',
		selectedBackColor: '#428bca',
		searchResultColor: '#D9534F',
		searchResultBackColor: undefined, //'#FFFFFF',

		enableLinks: false,
		highlightSelected: true,
		highlightSearchResults: true,
		showBorder: true,
		showIcon: true,
		showCheckbox: false,
		showTags: false,
		multiSelect: false,
		
		nodesField: "nodes",
		textField: "text",
		silent: false,

		// Event handlers
		onNodeChecked: undefined,
		onNodeCollapsed: undefined,
		onNodeDisabled: undefined,
		onNodeEnabled: undefined,
		onNodeExpanded: undefined,
		onNodeSelected: undefined,
		onNodeUnchecked: undefined,
		onNodeUnselected: undefined,
		onSearchComplete: undefined,
		onSearchCleared: undefined
    };
}));