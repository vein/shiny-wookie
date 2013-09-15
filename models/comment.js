var mongodb = require('./db'),
	common = require('../common/common');

//评论模型

var model = {
	title: "", //评论标题，可由消息模板控制
	body: "", //评论主体，可由消息模板控制
	parentid: "",
	app:{
		name:"",
		outkey:""
	},
	user: {
		id: "",
		social_account_type: ""
	},
	admit: 0, //审核是否通过
	time: "",
};
var Comment = {
	save: function(comment, callback) {

		comment = common.extend(1, model, comment);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('comments', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(comment, {
					safe: true
				}, function(err, comment) {
					mongodb.close();
					callback(err, comment);
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

			db.collection('comments', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var comment = common.extend(1, doc, obj);
						collection.update(condition, comment, function(err, comment) {
							mongodb.close();
							callback(err, comment);
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

			db.collection('comments', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var comment = common.extend(1, model, doc);
						callback(err, comment);
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

			db.collection('comments', function(err, collection) {
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
	deleteComment: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('comments', function(err, collection) {
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

module.exports = Comment;