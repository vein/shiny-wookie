define(function(require, exports, module) {
	var modules = require('common/modules');
	var loading = require('modules/loading');
	var carouselEvents = modules.create('carouselEvents', {
		publicAPI: {
			isRender: function() {
				return this.isRended;
			}
		},
		isRended: 0,
		currentPage: 0,
		uri: "/events/new",
		count: 4,
		maxNum: 20,
		elements: {
			".slideView .view[view_name='index'] .content": "Container",
			".carouselEvents": "InsideContainer",
			".carouselEvents .events": "EventsContent",
			".carouselEvents .btns": "Buttons"
		},
		events: {
			".carouselEvents .btns.prevEventsBtn|click": "prevEvents",
			".carouselEvents .btns.nextEventsBtn|click": "nextEvents"
		},
		prevEvents: function(event) {
			var _this = event.data;
			if (_this.currentPage * _this.count - 1 < 0) {
				_this.currentPage = 0;
				return;
			} else _this.currentPage--;
			_this.getData(_this.currentPage, function() {
				_this._renderHTML(_this.EventsContent, './javascripts/views/carouselEventsContent.ejs', 'html');
			});
		},
		nextEvents: function(event) {
			var _this = event.data;
			if (_this.currentPage * _this.count + 1 > _this.maxNum) {
				_this.currentPage = _this.maxNum;
				return;
			} else _this.currentPage++;
			_this.getData(_this.currentPage, function() {
				_this._renderHTML(_this.EventsContent, './javascripts/views/carouselEventsContent.ejs', 'html');

			});
		},
		getData: function(page, callback) {
			var _this = this;
			loading().show(this.InsideContainer);
			$.ajax({
				url: this.uri + "?start=" + page * this.count + "&count=" + this.count,
				success: function(data) {
					loading().hide(_this.InsideContainer);
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