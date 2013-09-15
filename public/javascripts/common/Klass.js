/*
 * 类生产器
 *
 */
define(function(require, exports, module) {

	module.exports = function(Parent, props) {
		var Child, F, i;

		Child = function() {
			if (Child.uber && Child.uber.hasOwnProperty("__construct")) {
				Child.uber.__construct.apply(this, arguments);
			}
			if (Child.prototype.hasOwnProperty("__construct")) {
				Child.prototype.__construct.apply(this, arguments);
			}
			
		};

		Parent = Parent || Object;

		F = function() {};

		F.prototype = Parent.prototype;
		Child.prototype = new F();
		Child.uber = Parent.prototype;
		Child.prototype.construct = Child;

		for (i in props) {
			if (props.hasOwnProperty(i)) {
				Child.prototype[i] = props[i];
			}
		}

		return Child;
	};
});