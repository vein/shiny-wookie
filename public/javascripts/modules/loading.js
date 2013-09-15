define(function(require, exports, module) {
	module.exports = function() {
		var loading = {
			show: function(container) {
				container.find(".ajax-loading").length==0 && container.append("<div class='ajax-loading'></div>").fadeIn();
			},
			hide: function(container) {
				container.find(".ajax-loading").length==1 && container.find(".ajax-loading").fadeOut(function(){
					$(this).remove();
				});
			}
		};
		return loading;
	};
});