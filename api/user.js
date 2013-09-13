var User = require('../models/user');

var api = {
	getUsers: function(option, callback) { //option = {count,start,extra}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {};
		if (option['extra'] && typeof option['extra'] == "object") {
			for (name in option['extra']) {
				condition[name] = option['extra'][name];
			}
		}
		User.getList(condition, callback);
	},
	get:function(option,callbak){
		User.get(user, callback);
	},
	add: function(user, callback) {
		User.save(user, callback);
	},
	toDie:function(condition,callback){
		User.update(condition, {isdie:1}, callback);
	},
	update: function(condition, user, callback) {
		User.update(condition, user, callback);
	}
}

module.exports = api;