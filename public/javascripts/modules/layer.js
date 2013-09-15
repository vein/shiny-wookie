define(function(require, exports, module) {
	var modules = require('common/modules'),
		extend = require('common/extend');
	var layer = modules.create("Layer", {
		publicAPI: {
			layer: function(option) { //弹出窗口
				this._createObj(option);
			},
			close: function(index) { //关闭窗口
				var _this = this;
				$(".layer_outwrap_" + (this.zIndex + index)).fadeOut(200, function() {
					this.remove();
					_this.num--;
				});
			},
			alert: function(option) { //信息窗口
				option = option || {};
				this._createObj({
					type: 0,
					title: "信息",
					poptype: option.poptype,
					titleIcon: ['./javascripts/styles/images/icon.png', -19, -311],
					dialog: {
						btns: option.btns || 2,
						btn: option.btn || ['确定', '取消'],
						msg: option.msg || "空信息",
						type: option.type || 0,
						yes: option.yes,
						no: option.no
					}

				});
			},
			confirm: function() { //确认窗口

			},
			msg: function() { //信息窗口

			},
			tips: function() { //提示层

			}

		},
		_layer: modules.create("_layer", {
			publicAPI: {
				pop: function(type) {

					var Width = this.Framework.width(),
						Height = this.Framework.height();
					switch (type) {
						case "center_scale":
							this.Framework.css({
								display: 'block',
								visibility: 'visible',
								opacity: 0,
								width: 0,
								height: 0,
								left: $(window).width() / 2 + "px",
								top: $(window).height() / 2 + "px"
							}).animate({
								opacity: 1,
								width: Width,
								height: Height,
								left: $(window).width() / 2 - Width / 2 + 'px',
								top: $(window).height() / 2 - Height / 2 + 'px'
							}, 300);
							break;
						case "x_left_slide":
							this.Framework.css({
								display: 'block',
								visibility: 'visible',
								opacity: 1,
								left: -Width + "px",
								top: $(window).height() / 2 - Height / 2 + "px"
							}).animate({
								opacity: 1,
								width: Width,
								height: Height,
								left: $(window).width() / 2 - Width / 2 + 'px',
								top: $(window).height() / 2 - Height / 2 + 'px'
							}, 300);
							break;
						case "x_right_slide":
							this.Framework.css({
								display: 'block',
								visibility: 'visible',
								opacity: 1,
								left: $(window).width() + "px",
								top: $(window).height() / 2 - Height / 2 + "px"
							}).animate({
								opacity: 1,
								width: Width,
								height: Height,
								left: $(window).width() / 2 - Width / 2 + 'px',
								top: $(window).height() / 2 - Height / 2 + 'px'
							}, 300);
							break;
						case "y_top_slide":
							this.Framework.css({
								display: 'block',
								visibility: 'visible',
								opacity: 1,
								left: $(window).width() / 2 - Width / 2 + "px",
								top: -Height + "px"
							}).animate({
								opacity: 1,
								width: Width,
								height: Height,
								left: $(window).width() / 2 - Width / 2 + 'px',
								top: $(window).height() / 2 - Height / 2 + 'px'
							}, 300);
							break;
						case "y_bottom_slide":
							this.Framework.css({
								display: 'block',
								visibility: 'visible',
								opacity: 1,
								left: $(window).width() / 2 - Width / 2 + "px",
								top: $(window).height() + "px"
							}).animate({
								opacity: 1,
								width: Width,
								height: Height,
								left: $(window).width() / 2 - Width / 2 + 'px',
								top: $(window).height() / 2 - Height / 2 + 'px'
							}, 300);
							break;
						default:
							this.Framework.css({
								display: 'block',
								visibility: 'visible',
								opacity: 0,
								width: 0,
								height: 0,
								left: $(window).width() / 2 + "px",
								top: $(window).height() / 2 + "px"
							}).animate({
								opacity: 1,
								width: Width,
								height: Height,
								left: $(window).width() / 2 - Width / 2 + 'px',
								top: $(window).height() / 2 - Height / 2 + 'px'
							}, 300);
							break;
					}

				},
				getIndex: function() {
					return this.option.zIndex;
				},
				getElementName: function(value) {
					for (var name in this.elements) {
						if (this.elements[name] == value) return name;
					}
				}
			},
			elements: {
				"body": "Container",
			}

		}),
		_render: function() {},

		num: 0,

		times: 0,

		zIndex: 19911130, //弹出层层级

		_createObj: function(option) { //生产出一个对象
			option = option || {};
			var outThis = this;
			var defaultSettings = {
				title: "", //标题
				type: 0, //弹窗类型，0：信息框（默认），1：页面层，2：iframe层，3：tips层 , 4：加载层。
				shadow: [0.5, "#000", false], //阴影配置[透明度，颜色，是否遮罩]
				titleIcon: ['', 0, 0], //标题图标配置
				area: [900, 800],
				fixed: true, //弹窗是否固定
				move: ["window", true], //拖拽支持[容器（如果不为空则说明拖拽必须在该容器内，如果为空则没有限制），是否支持拖拽]
				dialog: { //信息框层的配置
					btns: 0,
					btn: ['确定', '取消'],
					type: 3,
					msg: '',
					yes: function(index) {},
					no: function(index) {}
				},
				page: { //页面层的配置
					dom: "",
					html: "",
					url: ""
				},
				iframe: { //iframe层配置
					src: ""
				},
				loading: {
					type: 0,
				},
				tips: { //小提示层
					msg: '',
					follow: '',
					guide: 0,
					isGuide: true
				},
				success: function() {}, //成功弹出后的回调函数 
				close: function() {}, //点击关闭按钮后的回调函数
				end: function() {} //层彻底关闭后的回调函数
			};
			this.num++;
			option.zIndex = this.zIndex + this.num + this.times;
			var newlayer = new this._layer(),
				TName = ['dialog', 'page', 'iframe', 'tips', 'loading'],
				Elements = {}, Events = {}, Option = $.extend(true, {}, defaultSettings, option);
			Elements[".layer_outwrap_" + option.zIndex] = "Framework";
			Elements[".layer_outwrap_" + option.zIndex + " .insidewrap"] = "Insidewrap";
			Elements[".layer_outwrap_" + option.zIndex + " .insidewrap .top .layer_title"] = "Title";
			Elements[".layer_outwrap_" + option.zIndex + " .insidewrap .top .layer_close"] = "Close";
			Elements[".layer_outwrap_" + option.zIndex + " .insidewrap .layer_content"] = "Content";
			Events[".layer_outwrap_" + (option.zIndex) + "|click"] = "Bodyclick";
			Events[".layer_outwrap_" + (option.zIndex) + " .insidewrap .layer_close|click|bind"] = "CloseHandler";
			Events[".layer_outwrap_" + (option.zIndex) + " .insidewrap .layer_content .yesButton|click|bind"] = "YesBtnHandler";
			Events[".layer_outwrap_" + (option.zIndex) + " .insidewrap .layer_content .noButton|click|bind"] = "NoBtnHandler";
			Events[".layer_outwrap_" + (option.zIndex) + " .insidewrap .top|mousedown|bind"] = "Move";


			newlayer.init({
				option: Option,
				elements: Elements,
				viewData: {
					move: Option.move[1],
					fixed: Option.fixed,
					titleBg: {
						url: Option.titleIcon[0],
						left: Option.titleIcon[1],
						top: Option.titleIcon[2]
					},
					type: Option.type || 0,
					title: Option.title || "信息",
					zIndex: Option.zIndex,
					content: Option[TName[Option.type]]
				},
				events: Events,
				YesBtnHandler: function(event) {
					$.isFunction(event.data.option.dialog.yes) && event.data.option.dialog.yes.call(null, event.data.option.zIndex - outThis.zIndex);
				},
				NoBtnHandler: function(event) {
					$.isFunction(event.data.option.dialog.no) && event.data.option.dialog.no.call(null, event.data.zIndex - event.data.OzIndex);
				},
				CloseHandler: function(event) {
					event.data.Framework.fadeOut(200, function() {
						this.remove();
						outThis.num--;
					});
				},
				Bodyclick: function(event) {
					var _this = event.data;
					outThis.times++;
					_this.Framework.css('z-index', outThis.zIndex + outThis.num + outThis.times);
				},
				Move: function(event) {
					var _this = event.data,
						Container = _this.option.move[0],
						ismove = _this.option.move[1],
						borderType = "dotted",
						borderWidth = 3,
						borderColor = "#fff";
					if (!ismove) return;
					if (Container = "window") Container = window;
					event.preventDefault();
					event.stopPropagation();
					outThis.times++;
					var cloned = _this.Framework.clone().empty().css({
						top: _this.Framework.position().top - borderWidth + "px",
						left: this.Framework.position().left - borderWidth + "px",
						background: "none",
						opacity: 0.5,
						boxShadow: "none",
						border: borderType + " " + borderWidth + "px " + borderColor,
						zIndex: outThis.zIndex + outThis.num + outThis.times - 1
					});

					cloned.appendTo(_this.Container);

					_this.Framework.css({
						position: "absolute",
						top: _this.Framework.position().top,
						left: _this.Framework.position().left,
						zIndex: outThis.zIndex + outThis.num + outThis.times
					});
					var startL = event.pageX - _this.Framework.position().left,
						startH = event.pageY - _this.Framework.position().top,
						ow = _this.Framework.width() - startL,
						oh = _this.Framework.height() - startH;
					$(Container).mousemove(function(event) {
						_this.Framework.css({
							left: (event.pageX - startL) < 0 ? borderWidth : (event.pageX + ow) >= $(Container).width() ? ($(Container).width() - _this.Framework.width() - borderWidth) : (event.pageX - startL) + 'px',
							top: (event.pageY - startH) < 0 ? borderWidth : (event.pageY + oh) >= $(Container).height() ? ($(Container).height() - _this.Framework.height() - borderWidth) : (event.pageY - startH) + 'px'
						});
					}).mouseup(function(event) {
						$(Container).unbind('mousemove');
						_this.Framework.css({
							position: "absolute",
							opacity: 1,
							border: "none"
						});
						cloned.remove();
					});
				},
				rended: function() {
					var _this = this,
						loaded = 0,
						nw = _this.option.area[0],
						nh = _this.option.area[1];

					if (this.option.type == 1 && this.option.page.url && !this.option.page.html) {
						$(".ajax_content_" + this.option.zIndex).load($(".ajax_content_" + this.option.zIndex).attr("data"), function() {
							var nw = _this.option.area[0],
								nh = _this.option.area[1];
							if (nw && nh) {
								$(this).css({
									width: nw + 'px',
									height: nh + 'px'
								});
							}
							_this.publicAPI.pop.call(_this, _this.option.poptype);
							$(this).perfectScrollbar();
						});
					} else if (this.option.type == 2 && this.option.iframe.src) {
						$(".layer_outwrap_" + this.option.zIndex + " .xubox_iframe").load(function() {
							if (loaded == 1) return;
							try {
								var nw = this.contentWindow.document.body.scrollWidth || this.contentWindow.document.documentElement.scrollWidth,
									nh = this.contentWindow.document.body.scrollHeight || this.contentWindow.document.documentElement.scrollHeight;
							} catch (e) {
								nw = _this.option.area[0];
								nh = _this.option.area[1];
							}
							nw > $(window).width() ? nw = $(window).width() - 100 : nw;
							nh > $(window).height() ? nh = $(window).height() - 100 : nh;
							$(this).css({
								width: nw + 'px',
								height: nh + 'px'
							});
							_this.publicAPI.pop.call(_this, _this.option.poptype);
							loaded = 1;
						});
					} else if(this.option.type == 1 && (this.option.page.dom || this.option.page.html) ){
						if (nw && nh) {
							$(".layer_outwrap_" + this.option.zIndex + " .layer_content").css({
								width: nw + 'px',
								height: nh + 'px'
							});
						}
						this.publicAPI.pop.call(_this, this.option.poptype);
						$(".layer_outwrap_" + this.option.zIndex + " .layer_content").perfectScrollbar();
					} else {
						this.publicAPI.pop.call(_this, this.option.poptype);
					}
				}
			});
			newlayer.render('append'); //渲染骨架，通过配置分析模式来选择渲染那种类型的骨架
			return newlayer;
		}
	});
	module.exports = layer;
});