
var beerCtrl = require("../interceptor/beer.js");

module.export = (function(System, app) {

	app.post('/beers/list', function(req, res, next) {
		beerCtrl(System.redis, System.memcached)
			.list(req, res, function(token, err) {
				if (token) {
					res.send(token);
					res.end();
					return;
				}
				// TODO Reject
			});
	});
	
});