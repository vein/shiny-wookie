define(function(require, exports, module) {
	var klass = require('../common/Klass');
	var _router = klass(null, {
		_regexp: /:([a-zA-Z]+)/,
		_routes: {},
		_translateReg: function(route, callback) {
			var reg = "",
				params = [],
				t = this._regexp,
				hash = route instanceof RegExp ? route.toString() : route;
			if (this._isExistInRoutes(route)) return;
			if (!(route instanceof RegExp)) {
				route = route.replace(/^\/|\/$/g, "").split('/');
				for (var i = 0; i < route.length; i++) {
					if (t.test(route[i])) {
						params.push(t.exec(route[i])[1]);
						route[i] = route[i].replace(t, '(\\\w+)');
					}
				}
				reg = route.join('\\/');
				this._routes[hash] = {
					reg: new RegExp(reg),
					callback: (callback ? ($.isFunction(callback) ? callback : function() {}) : function() {} ),
					paramNames: params,
					type: "string"
				};
			} else {
				this._routes[hash] = {
					reg: route,
					callback: (callback ? ($.isFunction(callback) ? callback : function() {}) : function() {} ),
					paramNames: params,
					type: "reg"
				};
			}

		},
		parseQuery: function(query) {
			var result = {}, t;
			query = query.replace(/^\?|&$/, "");
			query = query.split("&");
			for (var i = 0; i < query.length; i++) {
				t = query[i].split('=');
				result[t[0]] = t[1];
			}
			return result;
		},
		_isExistInRoutes: function(route) {
			for (var name in this._routes) {
				if (name == route) return true;
			}
			return false;
		},
		_findRouteAction: function(hash) {
			for (var _hash in this._routes) {
				if (this._routes[_hash].reg.test(hash)) return this._routes[_hash];
			}
			return false;
		},
		_getParams: function(route, reg) {
			var array = reg.exec(route);
			array.shift();
			return array;
		},
		_generateParams: function(route, mapobj, query) {
			var obj = {}, paramNames = mapobj.paramNames,
				params = this._getParams(route, mapobj.reg);
			if (mapobj.type == "reg") {
				obj.params = params;
			} else {
				obj.params = [];
				for (var i = 0; i < paramNames.length; i++) {
					obj.params[paramNames[i]] = params[i];
				}
			}
			query && (obj.query = this.parseQuery(query));
			return obj;
		},
		add: function(route, callback) {
			this._translateReg(route, callback);
		},
		map: function(route, query) {
			var mapobj = this._findRouteAction(route);
			if (!mapobj) return;
			mapobj.callback.call(null, this._generateParams(route, mapobj, query));
		}
	});

	module.exports = klass(null, {
		__construct: function() {
			this.Router = new _router();
			var _this = this;
			$(window).bind('hashchange', function(e, triggered) {
				var hash = location.hash;
				if (hash) {
					_this.Router.map(hash, location.search);
				}
			});
		},
		begin:function(){
			var hash = location.hash;
			if (hash) {
				this.Router.map(hash, location.search);
			}
		},
		get: function(route, callback) {
			this.Router.add(route, callback);
			
		}
	})
});