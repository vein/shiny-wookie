/*
 * 模块生产器
 *
 */
define(function(require, exports, module) {
	var klass = require('../common/Klass');
	var Extend = require('../common/extend');
	var _module = klass(null, {

		isFreeze: 0,

		elements: {},

		viewURL: '',

		viewData: {},

		events: {},


		__construct: function() {
			this._refreshElements();
			this._registerEvents();
			this.init && $.isFunction(this.init) && this.init();
		},

		_init: function(option, callback) {
			option = option || {};
			if ((option && $.isFunction(option))) return option.call(this);
			option && Extend({
				isdeep: 1,
				condition: function(params) {
					var name = params.name,
						type = params.type;

					if (name != 'elements' && name != 'events' && !(/_.*/.test(name))) {
						return true;
					}
					return false;
				},
				objs: [this, option]
			});
			this._refreshElements(option.elements);
			this._registerEvents(option.events);
			callback && $.isFunction(callback) && callback.call(this);
		},
		_refreshElements: function(elements) {
			elements = elements || {};
			this.elements = $.extend({}, this.elements, elements);
			for (var name in this.elements) {
				this[this.elements[name]] = $(name);
			}
		},

		beforeRender: function(callback) { //填充视图数据接口
			callback.call(this);
		},
		rended: function() { //渲染结束的回调接口

		},

		_renderHTML: function(container,viewUrl, type) {
			//渲染视图
			var html = new EJS({
				url: viewUrl
			}).render(this.viewData),
				type = type == "html" ? "html" : "append";
			container[type](html);
			this._refreshElements();
			this._registerEvents();
		},

		_render: function(viewUrl, type) {
			this.beforeRender && $.isFunction(this.beforeRender) && this.beforeRender(function() {
				//渲染视图
				var html = new EJS({
					url: viewUrl
				}).render(this.viewData),
					type = type == "html" ? "html" : "append";
				this.Container[type](html);
				this._refreshElements();
				this._registerEvents();
				this.rended && $.isFunction(this.rended) && this.rended.call(this, html);
			});
		},

		_deleteView: function() {
			this.Container.html("");
		},

		_freeze: function() {
			this.isFreeze = 1;
		},

		_unfreeze: function() {
			this.isFreeze = 0;
		},

		_findMethod: function(str) {

			var result;
			str = str.replace(/^\.|\.$/, "").split(".");
			switch (str.length) {
				case 1:
					result = this[str[0]];
					break;
				case 2:
					result = this[str[0]][str[1]];
					break;
				case 3:
					result = this[str[0]][str[1]][str[2]];
					break;
				case 4:
					result = this[str[0]][str[1]][str[2]][str[3]];
					break;
				default:
					throw "事件处理器名称异常";
					break;
			}
			return result;
		},

		_registerEvents: function(events) {
			var t, _this = this;
			events = events || {};
			this.events = $.extend({}, this.events, events);
			for (var proper in this.events) {

				(function(proper) {
					t = proper.split("|");

					if (t[0] == "window") t[0] = window;

					if (t.length == 2) { //"selector|eventName : eventHandler"
						$(t[0]).unbind(t[1]).bind(t[1], _this, function() {
							if (_this.isFreeze == 1) return;
							_this._findMethod(_this.events[proper]).apply(this, Array.prototype.slice.apply(arguments));
						});

					} else if (t.length == 3) {
						switch (t[2]) { //"selector|eventName|type : eventHandler"
							case "bind":
								$(t[0]).unbind(t[1]).bind(t[1], _this, function() {
									if (_this.isFreeze == 1) return;
									_this._findMethod(_this.events[proper]).apply(this, Array.prototype.slice.apply(arguments));
								});

								break;
							case "live":
								$(t[0]).die(t[1]).live(t[1], _this, function() {
									if (_this.isFreeze == 1) return;
									_this._findMethod(_this.events[proper]).apply(this, Array.prototype.slice.apply(arguments));

								});

								break;
							case "on":
								$(t[0]).off(t[1]).on(t[1], _this, function() {
									if (_this.isFreeze == 1) return;
									_this._findMethod(_this.events[proper]).apply(this, Array.prototype.slice.apply(arguments));

								});

								break;
							case "one":
								$(t[0]).one(t[1], _this, function() {
									_this._findMethod(_this.events[proper]).apply(this, Array.prototype.slice.apply(arguments));

								});

								break;
							default:
								$(t[0]).unbind(t[1]).bind(t[1], _this, function() {
									if (_this.isFreeze == 1) return;
									_this._findMethod(_this.events[proper]).apply(this, Array.prototype.slice.apply(arguments));

								});
								_this.binded[_this.events[proper]] = 1;
								break;
						}
					}
				})(proper);


			}

		},



	});
	/*


	模块定义方式
	var modules = require(./modules);
	var moduleName = modules.create({
		//接口
		viewURL:'',//模板路径配置，可以在定义的时候配置也可以在模块初始化的时候在option里面配置
		publicAPI:{},//公共API
		viewData:{},//视图数据容器
		elements:{
			"selector" : Container //模块容器
		},//模块中的UI元素
		events:{},//模块中的事件绑定
		...其他方法,包括事件处理器方法
		populateViewData : function() {}，
		rended:function(){}

	});

	module.exports = moduleName; 

	*/
	exports.create = function(name, obj) {
		var Module = klass(_module, obj),
			module,
			results = { //默认API

				name: name, //模块名称

				init: function(option, callback) {
					module = new Module();
					for (var proper in module.publicAPI) {
						if ($.isFunction(module.publicAPI[proper])) this[proper] = $.proxy(module.publicAPI[proper], module);
					}
					module._init(option, callback);
				},
				freeze: function() {
					module._freeze();
				},

				setTemplateUrl: function(url) {
					this.viewURL = url;
				},
				render: function(type) {
					this.viewURL = this.viewURL || './javascripts/views/' + this.name; //默认根据模块名称进行解析
					module._render(this.viewURL, type);
				},
				deleteView: function() {
					module._deleteView();
				},
				unfreeze: function() {
					module._unfreeze();
				}

			};

		return klass(null, results);
	};
});