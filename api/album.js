var Album = require('../models/album');
var api = {
	getSetByDate: function(option, callback) { //option = {year,month,day,count,start,extra}
		var condition = {}, now = new Date();
		option = option || {};
		option['year'] = option['year'] || now.getFullYear();
		option['month'] = option['month'] || (now.getMonth() + 1);
		option['day'] = option['day'] || now.getDate();

		condition.created = {
			"$lt": new Date(option['year'], option['month'], option['day'] + 1).getTime(),
			"$gt": new Date(option['year'], option['month'], option['day'] - 1).getTime()
		};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			created: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Album.getList(condition, callback);
	},
	getHotAlbums: function(option, callback) {//option = {count,start}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			comments: -1,
			created: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Album.getList(condition, callback);
	},
	getLatestAlbums:function(option,callback){//option = {count,start}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			created: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Album.getList(condition, callback);
	},
	setPrivacy:function(option,callback){
		Album.update(option,{isprivacy:1},callback); 
	},
	removePrivacy:function(option,callback){
		Album.update(option,{isprivacy:0},callback); 
	},
	add:function(album,callback){
		Album.save(album,callback);
	},
	update:function(condition,album,callback){
		Album.update(condition,album,callback); 
	},
	deleteAlbum:function(condition,callback){
		Album.deleteAlbum(condition,callback);
	}
};

module.exports = api;