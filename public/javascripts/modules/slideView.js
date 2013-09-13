define(function(require, exports, module) {
	var modules = require('common/modules');
	var slideView = modules.create('slideView', {
		publicAPI: {
			addViews: function(views) {
				for (var name in views) {
					this.publicAPI.addView.call(this, views[name]);
				}
			},
			addView: function(view) {
				this.AnimateModel.append('<div class="view" view_name="' + view.name + '"></div>');
				this.views[view.name] = {};
				this.views[view.name].controller = view.controller;
				this.views[view.name].showed = view.showed;
				this.registViews();
			},
			getView: function(viewName) {
				this.toView(this.views[viewName].index);
				this.currentViewIndex = this.views[viewName].index;
				this.turned();
			},
			removeView: function(viewName) {
				$(this.views[viewName].obj).remove();
			},
			preView: function(params) {
				var _this = params.data,
					targetIndex = ((_this.currentViewIndex - 1) < 0 ? 0 : (_this.currentViewIndex - 1));
				_this.toView(targetIndex);
				_this.currentViewIndex = targetIndex;
				_this.turned();
			},
			nextView: function(params) {
				var _this = params.data,
					targetIndex = ((_this.currentViewIndex + 1) > (_this.viewLength - 1) ? (_this.viewLength - 1) : (_this.currentViewIndex + 1));
				_this.toView(targetIndex);
				_this.currentViewIndex = targetIndex;
				_this.turned();
			}
		},
		views: {},
		viewLength: 0,
		currentViewIndex: 0,

		init: function() {
			this.ContainerHeight = this.ContainerHeight || $(window).height();
			this.ContainerWidth = this.ContainerWidth || $(window).width();
			this.cur = this.cur || "y";
		},

		rended: function() {
			this.registViews();
			this.prevButton.hide();
		},

		turned: function() {
			if (this.currentViewIndex == 0) {
				this.prevButton.fadeOut();
				this.nextButton.fadeIn();
			} else if (this.currentViewIndex == this.viewLength - 1) {
				this.prevButton.fadeIn();
				this.nextButton.fadeOut();
			} else {
				this.prevButton.fadeIn();
				this.nextButton.fadeIn();
			}
		},

		toView: function(i) {
			var _this = this;
			switch (this.cur) {
				case "y":
					this.AnimateModel.animate({
						marginTop: -(this.ContainerHeight * i) + "px"
					}, 300, function() {
						var obj = _this.views[$(this).find(".view").eq(i).attr("view_name")],
							controller = obj.controller;
						if (controller && window.location.href != controller) window.location.href = controller;
						obj.showed && $.isFunction(obj.showed) && obj.showed();
					});
					break;
				case "x":
					this.AnimateModel.animate({
						marginLeft: -(this.ContainerWidth * i) + "px"
					}, 300, "swing", function() {
						var obj = _this.views[$(this).find(".view").eq(i).attr("view_name")],
							controller = obj.controller;
						if (controller && window.location.href != controller) window.location.href = controller;
						obj.showed && $.isFunction(obj.showed) && obj.showed();
					});
					break;
				default:
					this.AnimateModel.animate({
						marginTop: -(this.ContainerHeight * i) + "px"
					}, 300, "swing", function() {
						var obj = _this.views[$(this).find(".view").eq(i).attr("view_name")],
							controller = obj.controller;
						if (controller && window.location.href != controller) window.location.href = controller;
						obj.showed && $.isFunction(obj.showed) && obj.showed();
					});
					break;
			}

		},
		registViews: function() {
			var _this = this;
			_this.viewLength = 0;
			this.AnimateModel.find(".view").each(function(i) {
				_this.views[$(this).attr('view_name')] = _this.views[$(this).attr('view_name')] || {};
				_this.views[$(this).attr('view_name')].index = i;
				_this.views[$(this).attr('view_name')].obj = this;
				_this.viewLength++;
			});
		},
		elements: {
			"body": "Container",
			".slideView": "AnimateModel",
			".slideView #prevButton": "prevButton",
			".slideView #nextButton": "nextButton"
		},
		events: {
			".slideView #prevButton|click|bind": "publicAPI.preView",
			".slideView #nextButton|click|bind": "publicAPI.nextView"
		}
	});

	module.exports = slideView;
});