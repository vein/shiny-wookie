(function($) {
	$.Router = {};
	var _regexp = /:([a-zA-Z])+/,
		_routesLength = 0,
		_routes = {},
		_router = {
			translateReg: function(route, callback) {
				var reg = "",
					t = _regexp,
					hash = route;
				if (this.isExistInRoutes(route)) return;
				route = route.replace(/^\/|\/$/g, "").split('/');
				for (var i = 0; i < route.length; i++) {
					if (t.test(route[i]))
						route[i] = route[i].replace(t, '(\\\w+)');
				}
				reg = route.join('\\/');
				_routes[hash] = {
					reg: new RegExp(reg),
					callback: callback
				};
			},
			isExistInRoutes: function(route) {
				for (var name in _routes) {
					if (name == route) return true;
				}
				return false;
			},
			findRouteAction: function(hash) {
				for (var _hash in _routes) {
					if (_routes[_hash].reg.test(hash)) return _routes[_hash];
				}
				return false;
			},
			getParams: function(route, reg) {
				var array = reg.exec(route);
				array.shift();
				return array;
			}
		};

	$.Router.add = function(route, callback) {
		_router.translateReg(route, callback);
	};
	$.Router.map = function(route) {
		var mapobj = _router.findRouteAction(route);
		if (!mapobj) return;
		mapobj.callback.apply(null, _router.getParams(route, mapobj.reg));
	}
})(jQuery);