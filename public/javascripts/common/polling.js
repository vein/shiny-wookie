//轮询模块
define(function(require, exports, module) {
	var klass = require('../common/Klass');
	var _polling = klass(null, {
		_events: {},
		_cache:{},
		_duration: 5000,
		add: function(uri, callback, duration) {
			var _this = this;
			this._events[uri] = setInterval(function() {
				$.ajax({
					url: uri,
					success: function(data) {
						if (data && data !== _(this._cache[uri] ||  (_this._cache[uri] = data)) ) {
							callback && $.isFunction(callback) && callback(data);
						}
					}
				})
			}, (duration || this._duration))
		},
		remove: function(uri) {
			if(this._events[uri]){
				clearInterval(this._events[uri]);
				delete this._events[uri];
				this._cache[uri] && (delete this._cache[uri]);
			}
		}
	});
	module.exports = klass(null,{
		__construct:function(){
			this.polling = new polling();
		},
		add:function(){
			this.polling.add.apply(this.polling,arguments);
		},
		remove:function(){
			this.polling.remove.apply(this.polling,arguments);
		}
	})
});