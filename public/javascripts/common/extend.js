/*
 *  extend模块
 *
 */
define(function(require, exports, module) {
	var _Extend = function(option) {
		var arg = 1,
			prop,
			objs = option.objs || [],
			child = option.objs[0] || {},
			toStr = Object.prototype.toString,
			astr = "[object Array]",
			isdeep = option.isdeep || 0,
			condition = option.condition || function() {
				return true;
			};

		for (arg; arg < objs.length; arg += 1) {
			for (prop in objs[arg]) {
				if (objs[arg].hasOwnProperty(prop)) {
					if (typeof objs[arg][prop] == "object" && isdeep == 1 && condition({
						name: prop,
						type: (toStr.call(objs[arg][prop]) === astr) ? "array" : "object",
						obj: objs[arg][prop]
					})) {
						child[prop] = (toStr.call(objs[arg][prop]) === astr) ? [] : {};
						_extend(objs[arg][prop], child[prop]);
						continue;
					} else if (typeof objs[arg][prop] == "function" && condition({
						name: prop,
						type: "function",
						obj: objs[arg][prop]
					})) {
						child[prop] = $.proxy(objs[arg][prop], child);
					} else if (condition({
						name: prop,
						type: "const",
						obj: objs[arg][prop]
					})) child[prop] = objs[arg][prop];
				}
			}
		}

		function _extend(parent, child) {
			var i;
			child = child || {};

			for (i in parent) {
				if (parent.hasOwnProperty(i)) {
					if (typeof parent[i] === "object" && condition({
						name: i,
						type: (toStr.call(parent[i]) === astr) ? "array" : "object",
						obj: parent[i]
					})) {
						child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
						_extend(parent[i], child[i]);
					} else if (typeof parent[i] == "function" && condition({
						name: i,
						type: "function",
						obj: parent[i]
					})) {
						child[i] = $.proxy(parent[i], child);
					} else if (condition({
						name: i,
						type: "const",
						obj: parent[i]
					})) {
						child[i] = parent[i];
					}
				}
			}
		}
		return child;
	};
	module.exports = _Extend;
});