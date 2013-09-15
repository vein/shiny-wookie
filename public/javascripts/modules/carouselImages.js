define(function(require, exports, module) {
	var modules = require('common/modules');
	var carouselEvents = modules.create('carouselEvents', {
		publicAPI: {
			isRender: function() {
				return this.isRended;
			}
		},
		isRended: 0,
		currentPage: 0,
		uri: "/photos/new",
		count: 4,
		maxNum: 20,
		elements: {
			".slideView .view[view_name='index'] .content": "Container",
			".carouselImages": "InsideContainer",
			".carouselImages .iamges": "ImagesContent",
			".carouselImages .btns": "Buttons"
		},
		events: {
			".carouselImages .btns.prevImagesBtn|click": "prevEvents",
			".carouselImages .btns.nextImagesBtn|click": "nextEvents"
		},
		prevEvents: function(event) {
			var _this = event.data;
			if (_this.currentPage * _this.count - 1 < 0) {
				_this.currentPage = 0;
				return;
			} else _this.currentPage--;
			_this.getData(_this.currentPage, function() {
				_this._renderHTML(_this.EventsContent, './javascripts/views/carouselImagesContent.ejs', 'html');
			});
		},
		nextEvents: function(event) {
			var _this = event.data;
			if (_this.currentPage * _this.count + 1 > _this.maxNum) {
				_this.currentPage = _this.maxNum;
				return;
			} else _this.currentPage++;
			_this.getData(_this.currentPage, function() {
				_this._renderHTML(_this.EventsContent, './javascripts/views/carouselImagesContent.ejs', 'html');

			});
		},
		getData: function(page, callback) {
			var _this = this;
			$.ajax({
				url: this.uri + "?start=" + page * this.count + "&count=" + this.count,
				success: function(data) {
					if (data.length) {
						_this.viewData.data = data;
						callback && callback.call(_this);
					} else {
						_this.currentPage--;
					}
				}
			});
		},
		rended: function() {
			this.isRended = 1;
			var _this = this;
			this.getData(_this.currentPage, function() {
				_this._renderHTML(this.EventsContent, './javascripts/views/carouselEventsContent.ejs', 'html');

			});
			this.Buttons.animate({
				opacity: 0.2
			}, 300);
		}
	});
	module.exports = carouselEvents;
});