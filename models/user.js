var mongodb = require('./db'),
	common = require('../common/common');


var model = {
	/*qq:{
		openid:""
	},
	sina:{
		openid:"",
		user:{}
	},
	renren:{
		openid:"",
		user:{} 
	},
	taobao:{
		openid:"",
		user:{}
	},
	douban:{
		openid:"",
		user:{}
	},
	huaban:{
		openid:"",
		user:{}
	},
	kaixin:{
		openid:"",
		user:{}
	},*/
	ralation_acount:[],//关联用户id
	info:{},//合并的用户资料
};
var User = {
	save: function(user, callback) {

		user = common.extend(model, user);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('users', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex('name', {
					unique: true
				});
				collection.insert(user, {
					safe: true
				}, function(err, user) {
					mongodb.close();
					callback(err, user);
				});
			});
		});
	},

	update: function(condition, obj, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('users', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var user = common.extend(doc, obj);
						collection.update({
							name: username
						}, user, function(err, user) {
							mongodb.close();
							callback(err, user);
						});
					} else {
						callback(err, null);
					}
				});
			});
		});
	},

	get: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('users', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var user = common.extend(model, doc);
						callback(err, user);
					} else {
						callback(err, null);
					}
				});
			});
		});
	},

	getList: function(condition, callback) {
		condition = condition || {};
		var start = condition['start'] || 0,count = condition['count'] || 10,sort = condition['sort'] || null;
		condition['start'] && (delete condition['start']);
		condition['count'] && (delete condition['count']);
		condition['sort'] && (delete condition['sort']);
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('users', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.find(condition).skip(start).limit(count).sort(sort).toArray(function(err, docs) {
					mongodb.close();
					if (err) {
						return callback(err, null);
					}
					var tempArray = [];

					docs.forEach(function(doc, index) {
						var temp = common.extend(1, model, doc);
						tempArray.push(temp);
					});
					callback(null, tempArray);
				});
			});
		});
	}
};

module.exports = User;