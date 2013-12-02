
var userCtrl = require("../interceptor/user.js");

module.export = (function(System, app) {

	app.post('/users/list', function(req, res, next) {
		userCtrl(System.redis, System.memcached)
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