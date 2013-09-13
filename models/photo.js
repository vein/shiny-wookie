var mongodb = require('./db'),
	common = require('../common/common');



var model = {
	title: "",
	description: "",
	url: "",
	width:0,
	height:0,
	album:{
		id:"",
		name:""
	},
	cameraMake: "",
	cameraModel:"",
	size:"",
	uploaded: "",
	isdel: 0,
	comments: 0,
	isprivacy: 0,
	views: 0,
	user: {
		id: "",
		social_account_type: ""
	}
};
var Photo = {
	save: function(photo, callback) {

		photo = common.extend(1, model, photo);

		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}
			db.collection('photos', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.ensureIndex({
					'title': 1
				});
				collection.insert(photo, {
					safe: true
				}, function(err, photo) {
					mongodb.close();
					callback(err, photo);
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

			db.collection('photos', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					if (doc) {
						var photo = common.extend(1, doc, obj);
						collection.update(condition, photo, function(err, photo) {
							mongodb.close();
							callback(err, photo);
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

			db.collection('photos', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.findOne(condition, function(err, doc) {
					mongodb.close();
					if (doc) {
						var photo = common.extend(1, model, doc);
						callback(err, photo);
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

			db.collection('photos', function(err, collection) {
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
	deletePhoto: function(condition, callback) {
		condition = condition || {};
		mongodb.open(function(err, db) {
			if (err) {
				return callback(err);
			}

			db.collection('photos', function(err, collection) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.remove(condition, function(err, docs) {
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

module.exports = Photo;