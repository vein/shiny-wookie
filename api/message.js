var Message = require('../models/message');

var api = {
	getMessages: function(option, callback) { //option = {userName,appName,count,start,extra}
		var condition = {};
		condition.user.id = option['userId'];
		option['appName'] && (condition.appname = option['appName']);
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			time: -1
		};
		if (option['extra'] && typeof option['extra'] == "object") {
			for (name in option['extra']) {
				condition[name] = option['extra'][name];
			}
		}
		Message.getList(condition, callback);
	},
	add: function(message, callback) {
		Message.save(message, callback);
	},
	setReaded: function(condition, callback) {
		Message.update(condition, {
			readed: 1
		}, callback);
	},
	deleteMessage: function(condition, callback) {
		Message.deleteAlbum(condition, callback);
	}
}

module.exports = api;