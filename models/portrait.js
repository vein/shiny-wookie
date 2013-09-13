var mongodb = require('./db'),
	common = require('../common/common');



var model = {
	url: {
		social:"",
		local:""
	},
	type:"social",
	user: {
		id: "",
		social_account_type: ""
	}
};
var Portrait = {
	save: function(portrait, callback) {

		portrait = common.extend(1, model, portrait);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('portraits', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(portrait, {
					safe: true
				}, function(err, portrait) {
					mongodb.close();
					callback(err, portrait);
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

			db.collection('portraits', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var portrait = common.extend(1, doc, obj);
						collection.update(condition, portrait, function(err, portrait) {
							mongodb.close();
							callback(err, portrait);
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

			db.collection('portraits', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var portrait = common.extend(1, model, doc);
						callback(err, portrait);
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

			db.collection('portraits', function(err, collection) {
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
	deleteportrait: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('portraits', function(err, collection) {
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

module.exports = Portrait;