define(function(require, exports, module) {
	var modules = require('common/modules');
	var loveNav = modules.create('loveNav', {
		items: {},
		begined:0,
		publicAPI: {
			addNavItems: function(obj) {
				if(this.isRender==0)return this;
				for (var name in obj) {
					this.publicAPI.addNavItem.call(this, obj[name]);
				}
				this.beginX = this.NavItems.eq(0).position().left;
				this.beginY = this.NavItems.eq(0).position().top;
			},
			begin:function(){
				if(this.begined==1)return this;
				if(this.isRender==0)return this;
				this.initLogo();
				this.begined = 1;
			},
			end:function(){
				if(this.begined==0)return this;
				if(this.isRender==0)return this;
				var _this = this;
				this.publicAPI.takeBackNav.call(this,function(){
					_this.endLogo();
				});
				this.begined = 0;
			},
			removeItems: function(names) {
				if(this.isRender==0)return this;
				for (var name in obj) {
					this.publicAPI.removeNavItem.call(this, obj[name]);
				}
			},
			addNavItem: function(option) { //添加一个菜单项
				if(this.isRender==0)return this;
				var Url = option.url, //菜单链接地址
					NavName = option.navName, //菜单HTML名称
					ItemName = option.itemName, //菜单名称
					BgImg = option.bgImg, //菜单背景图片
					BgX = option.bgX || 0,
					BgY = option.bgY || 0,
					BeforeLink = option.beforeLink || function() {}, //链接前的回调函数
					Linked = option.linked || function() {}; //链接后的回调函数
				this.items[NavName] = {
					url: Url,
					navName: NavName,
					itemName: ItemName,
					bgImg: BgImg,
					bgX: BgX,
					bgY: BgY,
					beforeLink: BeforeLink,
					linked: Linked
				};
				this.NavContainer.append('<li nav_name="' + NavName + '"><div class="icon"  style="background:url(' + BgImg + ') ' + BgX + 'px ' + BgY + 'px;" ></div><a href="javascript:;" class="text">' + ItemName + '</a></li>');
				this.items[NavName].obj = this.NavContainer.find('li[nav__name="' + NavName + '"]');
				this._refreshElements();
			},
			removeNavItem: function(navName) { //删除一个菜单项
				if(this.isRender==0)return this;
				delete this.items[itemName];
				this.NavContainer.remove('li[nav__name="' + navName + '"]');
			},
			getNavIitem: function(navName) { //获取一个菜单项
				if(this.isRender==0)return this;
				return this.items[navName];
			},
			popNav: function(callback) { //弹出菜单
				if(this.isRender==0)return this;
				if (this.isPoped == 0) {
					var _this = this;
					this.option.popCallback = function() {
						callback && $.isFunction(callback) && callback.call(_this);
					}
					this.navAnimate(this.option);
				}
			},
			takeBackNav: function(callback) { //收回菜单
				if(this.isRender==0)return this;
				if (this.isPoped == 1) {
					var _this = this;
					this.option.takeBackCallback = function() {
						_this.NavItemText.animate({
							top: 0,
							opacity: 0,
						}, function() {
							callback && $.isFunction(callback) && callback.call(_this);
						});
					}
					this.navAnimate(this.option);
				}
			},
			goTo: function(navName) { //直接执行一个菜单项动作
				if(this.isRender==0)return this;
				var obj = this.publicAPI.getNavIitem.call(this, navName);
				//如果有菜单则收回菜单
				if (this.isPoped == 1) {
					this.publicAPI.takeBackNav.call(this, function() {
						//执行链接前回调
						obj.beforeLink && $.isFunction(obj.beforeLink) && obj.beforeLink.call(this);
						//执行链接
						obj.url && (window.location.href = obj.url);
						obj.linked && $.isFunction(obj.linked) && obj.linked.call(this);
					});
					return;
				}
				//执行链接前回调
				obj.beforeLink && $.isFunction(obj.beforeLink) && obj.beforeLink.call(this);
				//执行链接
				obj.url && (window.location.href = obj.url);
				obj.linked && $.isFunction(obj.linked) && obj.linked.call(this);

			}
		},

		isPoped: 0, //菜单是否已经弹出
		isRender:0,
		option: {
			startAngle: 0,
			radius: 250,
			sparateAngle: 30,
			duration: 150,
			itemWidth: 52,
			itemHeight: 52,
			popCallback: function() {

			},
			takeBackCallback: function() {

			}

		},
		rended:function(){
			this.isRender = 1;
		},
		navAnimate: function(option) {
			var startAngle = option.startAngle || 90, //第一个元素的角度定位，定位起点以左边0度为起始位置
				radius = option.radius || 100, //半径
				sparateAngle = option.sparateAngle || 30, //元素之间相隔的角度
				duration = option.duration || 200, //动画持续时间
				popCallback = option.popCallback, //弹出后的回调函数
				itemWidth = option.itemWidth || 0,
				itemHeight = option.itemHeight || 0,
				takeBackCallback = option.takeBackCallback; //收回的回调函数
			var _this = this;
			startAngle = startAngle - ((this.NavItems.size() - 1) / 2) * sparateAngle;
			if (this.NavItems.eq(0).siblings(':animated').size() == 0) {
				if (this.isPoped == 0) this.loveNav.animate({
					marginTop: parseInt(this.loveNav.css('margin-top')) - 100 + "px"
				});
				else this.loveNav.animate({
					marginTop: parseInt(this.loveNav.css('margin-top')) + 100 + "px"
				});
				this.NavItems.each(function(i) {
					i != 0 && (startAngle += sparateAngle);
					var item = $(this),
						y = _this.beginY + radius * Math.sin((Math.PI / 180) * startAngle).toFixed(1),
						x = _this.beginX - radius * Math.cos((Math.PI / 180) * startAngle).toFixed(1),
						hy = y + 10 * Math.sin((Math.PI / 180) * startAngle).toFixed(1),
						hx = x - 10 * Math.cos((Math.PI / 180) * startAngle).toFixed(1);
					duration += i * 10;
					item.rotate({
						angle: 0,
						animateTo: 360,
						duration: duration,
						easing: function(x, t, b, c, d) { // t: current time, b: begInnIng value, c: change In value, d: duration
							return c * (t / d) + b;
						}
					});
					_this.NavContainer.css({
						display: "block",
						zIndex: 1
					});
					item.find(".text").animate({
						top: "100%",
						opacity: 1,
					});
					if (item.css('display') == "none") {
						item.show().animate({
							top: hy + "px",
							left: hx + "px"
						}, duration).animate({
							top: y + "px",
							left: x + "px"
						}, duration, function() {

							if (i == _this.NavItems.size() - 1) {
								popCallback && $.isFunction(popCallback) && popCallback.call(_this);
								_this.isPoped = 1;
							}
						});

					} else {
						item.animate({
							top: hy + "px",
							left: hx + "px"
						}, duration, function() {
							if (i == _this.NavItems.size() - 1) {
								takeBackCallback && $.isFunction(takeBackCallback) && takeBackCallback.call(_this);
								_this.isPoped = 0;
							}
						}).animate({
							top: _this.beginY + "px",
							left: _this.beginX + "px"
						}, duration, function() {
							item.hide();
							_this.NavContainer.css({
								display: "none",
								zIndex: 0
							});
						});

					}
				});
			}
		},
		endLogo:function(){
			_this.Text.css({
					top: "-100px",
					opacity: 0
				});
			this.Heart.animate({
				top: "0px",
				opacity: 0
			}, 300, "swing");
		},

		initLogo: function() {
			var _this = this;
			this.Text.css({
				opacity: 0,
				top: "-100px"
			});
			this.Heart.css({
				opacity: 0,
				top: "-200px"
			}).animate({
				top: "-80px",
				opacity: 1
			}, 300, "swing", function() {
				_this.Text.css({
					top: "0px",
					opacity: 1
				});
			});
		},

		LogoClick: function(params) {
			if (params.data.NavItems.size() != 0) {
				if (params.data.isPoped == 0)
					params.data.publicAPI.popNav.call(params.data);
				else params.data.publicAPI.takeBackNav.call(params.data);
			}
		},

		navItemClick: function(params) {
			params.data.publicAPI.goTo.call(params.data, $(this).attr("nav_name"));
		},

		elements: {
			".view[view_name='loveNav']": "Container",
			".view[view_name='loveNav'] .loveNav": "loveNav",
			".view[view_name='loveNav'] .loveNav .logo": "Logo",
			".view[view_name='loveNav'] .loveNav .logo .logofont": "Text",
			".view[view_name='loveNav'] .loveNav .logo .heart": "Heart",
			".view[view_name='loveNav'] .loveNav .nav": "NavContainer",
			".view[view_name='loveNav'] .loveNav .nav li": "NavItems",
			".view[view_name='loveNav'] .loveNav .nav li .text": "NavItemText"
		},
		events: {
			".view[view_name='loveNav'] .loveNav .logo|click": "LogoClick",
			".view[view_name='loveNav'] .loveNav .nav li|click|live": "navItemClick"
		}
	});

	module.exports = loveNav;
});