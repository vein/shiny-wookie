var mongodb = require('./db'),
	common = require('../common/common');



var model = {
	body: "", //私信主体，可由消息模板控制
	time: "", //发布时间
	isdel: 0, //是否删除
	targetuser: {//对象用户
		id: "",
		social_account_type: ""
	},
	user:{
		id: "",
		social_account_type: ""
	}
};
var Pmsg = {
	save: function(pmsg, callback) {

		pmsg = common.extend(1, model, pmsg);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('pmsgs', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(pmsg, {
					safe: true
				}, function(err, pmsg) {
					mongodb.close();
					callback(err, pmsg);
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

			db.collection('pmsgs', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var pmsg = common.extend(1, doc, obj);
						collection.update(condition, pmsg, function(err, pmsg) {
							mongodb.close();
							callback(err, pmsg);
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

			db.collection('pmsgs', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var pmsg = common.extend(1, model, doc);
						callback(err, pmsg);
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

			db.collection('pmsgs', function(err, collection) {
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
	deletePmsg: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('pmsgs', function(err, collection) {
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

module.exports = Pmsg;