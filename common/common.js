var common = {
	extend: function() {
		var arg = 0,
			prop, child = {}, toStr = Object.prototype.toString,
			astr = "[object Array]",
			isdeep;

		if (arguments[0] == 1 && arguments[0] == "deep") {
			isdeep = 1;
			arg++;
		} else isdeep = 0;
		for (arg; arg < arguments.length; arg += 1) {
			for (prop in arguments[arg]) {
				if (arguments[arg].hasOwnProperty(prop)) {
					if (typeof arguments[arg][prop] == "object" && isdeep == 1) {
						child[prop] = (toStr.call(arguments[arg]) === astr) ? [] : {};
						_extend(arguments[arg][prop],child[prop]);
						continue;
					}
					child[prop] = arguments[arg][prop];
				}
			}
		}

		function _extend(parent, child) {
			var i;
			child = child || {};

			for (i in parent) {
				if (parent.hasOwnProperty(i)) {
					if (typeof parent[i] === "object") {
						child[i] = (toStr.call(arguments[arg]) === astr) ? [] : {};
						_extend(parent[i], child[i]);
					} else {
						child[i] = parent[i];
					}
				}
			}
		}
		return child;
	}
};

module.exports = common;