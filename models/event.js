var mongodb = require('./db'),
	common = require('../common/common');



var model = {
	title: "", //事件标题，可由消息模板控制
	body: "", //事件主体，可由消息模板控制
	published: "", //发布时间
	modifyed: "", //修改时间
	isdel: 0, //是否删除
	comments: 0,
	isprivacy: 0, //是否设为隐私
	views: 0,
	user: {
		id: "",
		social_account_type: ""
	}
};
var Event = {
	save: function(event, callback) {

		event = common.extend(1, model, event);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('events', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(event, {
					safe: true
				}, function(err, event) {
					mongodb.close();
					callback(err, event);
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

			db.collection('events', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var event = common.extend(1, doc, obj);
						collection.update(condition, event, function(err, event) {
							mongodb.close();
							callback(err, event);
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

			db.collection('events', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var event = common.extend(1, model, doc);
						callback(err, event);
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
		(condition['start'] || condition['start'] == 0) && (delete condition['start']);
		(condition['count'] || condition['count'] == 0) && (delete condition['count']);
		(condition['sort'] || condition['sort'] == 0) && (delete condition['sort']);
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('events', function(err, collection) {
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
	deleteEvent: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('events', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				condition._id && (condition._id = collection.pkFactory.createFromHexString(condition._id));
				collection.remove(condition, function(err, docs) {
					mongodb.close();
					callback(err, docs);
				});
			});
		});
	}
};

module.exports = Event;