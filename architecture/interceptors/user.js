var System = require("../lib/system.js");
var userDAO = require("../models/userDAO.js");

if (typeof setImmediate === "undefined") {
	require('setimmediate');
}
module.exports = (function(redis, memcached) {

	var user = userDAO(redis, memcached);

	function __privateFunc() {

	}

	return {
		list: function(req, res, callback) {
			return user.list(req)
				.then(function(users) {
					setimmediate(callback.bind(null, users));
				});
		}
	};
});