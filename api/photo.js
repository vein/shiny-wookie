var Photo = require('../models/photo');
var api = {
	getSetByDate: function(option, callback) { //option = {year,month,day,count,start,extra}
		var condition = {}, now = new Date();
		option = option || {};
		option['year'] = option['year'] || now.getFullYear();
		option['month'] = option['month'] || (now.getMonth() + 1);
		option['day'] = option['day'] || now.getDate();

		condition.uploaded = {
			"$lt": new Date(option['year'], option['month'], option['day'] + 1).getTime(),
			"$gt": new Date(option['year'], option['month'], option['day'] - 1).getTime()
		};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			uploaded: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Photo.getList(condition, callback);
	},
	getHotPhotos: function(option, callback) {//option = {count,start,extra}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			comments: -1,
			uploaded: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Photo.getList(condition, callback);
	},
	getLatestPhotos:function(option,callback){//option = {count,start,extra}
		var condition = {};
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			uploaded: -1
		};
		if(option['extra'] && typeof option['extra'] == "object"){
			for(name in option['extra']){
				condition[name] = option['extra'][name];
			}
		}
		Photo.getList(condition, callback);
	},
	setPrivacy:function(option,callback){
		Photo.update(option,{isprivacy:1},callback); 
	},
	removePrivacy:function(option,callback){
		Photo.update(option,{isprivacy:0},callback); 
	},
	add:function(photo,callback){
		Photo.save(photo,callback);
	},
	update:function(condition,photo,callback){
		Photo.update(condition,photo,callback); 
	},
	deleteAlbum:function(condition,callback){
		Photo.deleteAlbum(condition,callback);
	}
};
module.exports = api;