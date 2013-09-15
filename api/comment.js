var Comment = require('../models/comment');

var api = {
	getComments: function(option, callback) { //option = {sourceId,sourceType,count,start,extra}
		var condition = {};
		condition.app.name = option['sourceId'];
		condition.app.outkey = option['sourceType'];
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			time: -1
		};
		if (option['extra'] && typeof option['extra'] == "object") {
			for (name in option['extra']) {
				condition[name] = option['extra'][name];
			}
		}
		Comment.getList(condition, callback);
	},
	getCommentFeedback: function(option, callback) { //option = {commentId,count,start,extra}
		var condition = {};
		condition.parentid = option['commentId'];
		condition.count = option['count'] || 10;
		condition.start = option['start'] || 0;
		condition.sort = option['sort'] || {
			time: -1
		};
		if (option['extra'] && typeof option['extra'] == "object") {
			for (name in option['extra']) {
				condition[name] = option['extra'][name];
			}
		}
		Comment.getList(condition, callback);
	},
	admitComment: function(option, callback) {
		Comment.update(condition, {
			admin: 1
		}, callback);
	},
	removeAdmit: function(option, callback) {
		Comment.update(condition, {
			admin: 0
		}, callback);
	},
	add: function(comment, callback) {
		Comment.save(comment, callback);
	},
	update: function(condition, comment, callback) {
		Comment.update(condition, comment, callback);
	},
	deleteComment: function(condition, callback) {
		Comment.deleteAlbum(condition, callback);
	}
}

module.exports = api;