var Event = require('../models/event');
var api = {
	getSetByDate: function(option, callback) { //option = {year,month,day,count,start}
		var condition = {}, now = new Date();
		option = option || {};
		option['year'] = option['year'] || now.getFullYear();
		option['month'] = option['month'] || (now.getMonth() + 1);
		option['day'] = option['day'] || now.getDate();

		condition.published = {
			"$lt": new Date(option['year'], option['month'], option['day'] + 1).getTime(),
			"$gt": new Date(option['year'], option['month'], option['day'] - 1).getTime()
		};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = {
			published: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Event.getList(condition, callback);
	},
	getHotEvents: function(option, callback) {//option = {count,start}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = {
			comments: -1,
			published: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Event.getList(condition, callback);
	},
	getLatestEvents:function(option,callback){//option = {count,start}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = {
			published: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Event.getList(condition, callback);
	},
	setPrivacy:function(option,callback){
		Event.update(option,{isprivacy:1},callback); 
	},
	removePrivacy:function(option,callback){
		Event.update(option,{isprivacy:0},callback); 
	},
	add:function(event,callback){
		Event.save(event,callback);
	},
	update:function(condition,event,callback){
		Event.update(condition,event,callback); 
	},
	deleteEvent:function(condition,callback){
		Event.deleteEvent(condition,callback);
	}
};

module.exports = api;