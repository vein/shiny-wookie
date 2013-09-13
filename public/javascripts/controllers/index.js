define(function(require, exports, module) {
	var ModuleManager = require('common/moduleManager'),
		CarouselEvents = require('modules/carouselEvents'),
		moduleManager = new ModuleManager();
	var carouselEvents = new CarouselEvents();

	var Container = $('.view[view_name="index"]');

	Container.append('<div class="indexContent content"></div>');
	carouselEvents.init();
	Content = Container.find('.content');
	Content.css({
		width: $(window).width() - 80 + "px",
		height: $(window).height() - 80 + "px"
	});
	$(window).resize(function() {
		Content.css({
			width: $(window).width() - 80 + "px",
			height: $(window).height() - 80 + "px"
		});
	});
	module.exports = {
		index: function() {
			carouselEvents.isRender() == 0 && carouselEvents.render();

		}

	};
});