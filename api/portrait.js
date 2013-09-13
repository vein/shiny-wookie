var Portrait = require('../models/portrait');

var api = {
	get: function(condition, callback) {
		Portrait.get(condition, callback);
	},
	add: function(portrait, callback) {
		Portrait.save(portrait, callback);
	},
	update: function(condition, portrait, callback) {
		Portrait.update(condition, portrait, callback);
	}
}

module.exports = api;