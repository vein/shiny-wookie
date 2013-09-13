var mongodb = require('./db'),
	common = require('../common/common');

//信息中心，收件箱模型

var model = {
	title: "", //消息标题，可由消息模板控制
	body: "", //消息主体，可由消息模板控制
	appname: "", //所属应用名称
	time: "",
	readed: 0, //是否已读
	outkey: "", //外键，一般是消息所对应app下的某个id,目前可以是私信id和评论id
	user: {
		id: "",
		social_account_type: ""
	},
	isdel: 0,
};
var Message = {
	save: function(message, callback) {

		message = common.extend(model, message);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('messages', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(message, {
					safe: true
				}, function(err, message) {
					mongodb.close();
					callback(err, message);
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

			db.collection('messages', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var message = common.extend(doc, obj);
						collection.update(condition, message, function(err, message) {
							mongodb.close();
							callback(err, message);
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

			db.collection('messages', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var message = common.extend(model, doc);
						callback(err, message);
					} else {
						callback(err, null);
					}
				});
			});
		});
	},

	getList: function(condition, callback) {
		condition = condition || {};
		var start = condition['start'] || 0,
			count = condition['count'] || 10,
			sort = condition['sort'] || null;
		condition['start'] && (delete condition['start']);
		condition['count'] && (delete condition['count']);
		condition['sort'] && (delete condition['sort']);
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('messages', function(err, collection) {
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
	},
	deleteMessage: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('messages', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.remove(condition, function(err, docs) {
					mongodb.close();
					callback(err, docs);
				});
			});
		});
	}
};

module.exports = Message;