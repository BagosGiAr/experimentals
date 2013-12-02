var System = require("../lib/system.js");
var beerDAO = require("../models/beerDAO.js");

if (typeof setImmediate === "undefined") {
	require('setimmediate');
}
module.exports = (function(redis, memcached) {

	var beer = beerDAO(redis, memcached);

	function __privateFunc() {

	}

	return {
		list: function(req, res, callback) {
			return beer.list(req)
				.then(function(beers) {
					setimmediate(callback.bind(null, beers));
				});
		}
	};
});