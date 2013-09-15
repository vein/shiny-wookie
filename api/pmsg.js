var Pmsg = require('../models/pmsg');

var api = {
	getChatsWithSomebody: function(option, callback) { //option = {targetUserName,userName,count,start,extra}
		var condition = {};
		condition.targetuser.id = {
			"$in": [option['targetUserId'], option['userId']]
		};
		condition.user.id = {
			"$in": [option['targetUserId'], option['userId']]
		};
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
		Pmsg.getList(condition, callback);
	},
	add: function(chat, callback) {
		Pmsg.save(chat, callback);
	},
	deletePmsg: function(condition, callback) {
		Pmsg.deleteAlbum(condition, callback);
	}
};

module.exports = api;