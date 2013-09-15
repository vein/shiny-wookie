define(function(require, exports, module) {
	//加载类
	var functions = require('common/commonFunctions'),
		Router = require('common/router_new'),
		Styles = require('styles/main.css'),
		SlideView = require('modules/slideView'),
		LoveNav = require('modules/loveNav'),
		Layer = require('modules/layer');
	//生成对象
	router = new Router(), //加载路由分发器
	slideView = new SlideView(),
	loveNav = new LoveNav(),
	layer = new Layer();
	//配置滑屏	
	slideView.init({
			events: {
				"window|resize": "Wresize"
			},
			Wresize: function() {
				$('body').height($(window).height());
				$('body').width($(window).width());
				this.ContainerHeight = $(window).height();
				this.ContainerWidth = $(window).width();
				this.AnimateModel.css({
					marginTop: -this.ContainerHeight * this.currentViewIndex + "px"
				});
			}
		},
		function() {
			$('body').height($(window).height());
			$('body').width($(window).width());
		});
	//渲染基本模板布局
	slideView.render();
	//加载菜单
	slideView.addViews([{
		name: "loveNav",
		controller: "#!intro",
	}, {
		name: "index",
		controller: "#!index",
	}, {
		name: "aboutMe",
		controller: "#!aboutme",
	}]);
	//配置爱心菜单
	loveNav.init({
		option: {
			startAngle: 90,
			radius: 250,
			sparateAngle: 30,
			duration: 150,
			itemWidth: 52,
			itemHeight: 52
		}
	});
	//渲染基本模板布局
	loveNav.render();
	//增加菜单
	loveNav.addNavItems([{
		navName: "index",
		itemName: "首页",
		url: "#!index",
		beforeLink: function() {
			this.publicAPI.takeBackNav.call(this);
			slideView.getView('index')
		},
		bgImg: "./javascripts/styles/images/icon.png",
		bgX: -115,
		bgY: -161,
		itemWidth: 52,
		itemHeight: 52
	}, {
		navName: "event",
		itemName: "事件",
		bgImg: "./javascripts/styles/images/icon.png",
		bgX: -115,
		bgY: -92,
	}, {
		navName: "albums",
		itemName: "相册",
		bgImg: "./javascripts/styles/images/icon.png",
		bgX: -115,
		bgY: -19,
	}, {
		navName: "login",
		itemName: "登录",
		bgImg: "./javascripts/styles/images/icon.png",
		bgX: -186,
		bgY: -160,
	}, {
		navName: "ucenter",
		itemName: "配置",
		bgImg: "./javascripts/styles/images/icon.png",
		bgX: -186,
		bgY: -91,
	}]);

	layer.init();
	/*layer.layer({
		type:1,
		title:"消息",
		titleIcon:["./javascripts/styles/images/icon.png",-100,-313],
		poptype:"y_top_slide",
		page:{
			html:"<br>每当我看到那五彩缤纷的彩虹<br>我就想起和你在一起的岁月~<br><br>"
		}
	});*/

	//配置路由
	router.get("#!intro", function(req) {
		slideView.getView('loveNav');
		loveNav.begin();
	});
	router.get("#!aboutme", function(req) {
		slideView.getView('aboutMe');
		layer.alert({
			btns: 0,
			msg: "您确定要删除该项目吗？"
		});
	});
	router.get(/#!index(\/(.*))?/, function(req) {
		seajs.use('controllers/index', function(controller) {
			slideView.getView('index');
			controller.index();
		});
	});
	router.get(/#!event(\/(.*))?/, function(req) {
		seajs.use('controllers/event', function(controller) {
			controller.index();
		});
	});
	router.get(/#!photo(\/(.*))?/, function(req) {
		seajs.use('controllers/photo', function(controller) {
			controller.index();
		});
	});
	router.get(/#!album(\/(.*))?/, function(req) {
		seajs.use('controllers/album', function(controller) {
			controller.index();
		});
	});
	router.get(/#!user(\/(.*))?/, function(req) {
		seajs.use('controllers/user', function(controller) {
			controller.index();
		});
	});
	//启动路由分发器
	router.begin();
});