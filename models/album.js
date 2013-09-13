var mongodb = require('./db'),
	common = require('../common/common');



var model = {
	title: "",
	description: "",
	cover: "",
	created: 0,
	modifyed: "",
	isdel: 0,
	comments: 0,
	isprivacy: 0,
	views: 0,
	user: {
		id: "",
		social_account_type: ""
	}
};
var Album = {
	save: function(album, callback) {

		album = common.extend(1, model, album);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('albums', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(album, {
					safe: true
				}, function(err, album) {
					mongodb.close();
					callback(err, album);
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

			db.collection('albums', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var album = common.extend(1, doc, obj);
						collection.update(condition, album, function(err, album) {
							mongodb.close();
							callback(err, album);
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

			db.collection('albums', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					mongodb.close();
					if (doc) {
						var album = common.extend(1, model, doc);
						callback(err, album);
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

			db.collection('albums', function(err, collection) {
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
	deleteAlbum: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('albums', function(err, collection) {
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

module.exports = Album;