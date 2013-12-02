// Require dependencies
var express = require('express');
var io = require('socket.io');
var mysql = require('mysql');
var redis = require("redis");
var RedisStore = require('connect-redis')(express);
// var Q = require("q");
var ncache = require("./lib/ncache.js");
var pledge = require("./lib/pledge.js");
var http = require('http');
var crypto = require('crypto');
var Memcached = require('memcached');
var System = require("./lib/system.js");

if (typeof setImmediate === "undefined") {
	require('setimmediate');
}
// initiations of clients
var memcached = new Memcached("localhost:11211");
var redisClient = redis.createClient();
var port = (process.env.PORT || System.conf.port);
var app = express();
var server = http.createServer(app);
var memoryCache = ncache.mCache();
var mkeyCache = ncache.memcached({
	connection: memcached
});

// globalize
System.memoryCache = memoryCache;
System.mkeyCache = mkeyCache;
System.memcached = memcached;
System.redis = redis;

System.auth = express.basicAuth(function(user, pass, next) {
	pledge(function(deferred) {
		var md5 = crypto.createHash('md5');
		var userHash = md5.update(user).digest('hex');
		var passHash = md5.update(pass).digest('hex');
		memcached.get(userHash, function(err, ressult) {
			if (err) {
				console.error(err, ressult);
				next(err);
				return;
			}
			if (!ressult || passHash === md5.update(ressult || "").digest('hex')) {
				// user doesn't exists
				next({});
				return;
			}
			next(null, true);
		});
	});
});

//process.on("uncaughtException", function (err) {
//	console.log(err);
//	process.exit();
//});

//Setup Express
app.configure(function() {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(express.logger('dev'));
	app.use(express.responseTime());
	app.use(express.compress());
	app.use(express.json());
	app.use(express.urlencoded());

	app.use(express.cookieParser());
	app.use(express.session({
		secret: 'secret',
		store: new RedisStore({
			host: '127.0.0.1',
			port: 6379,
			db: 0,
			client: redis
		})
	}));

	app.disable('x-powered-by');
	app.use(function(req, res, next) {
		res.removeHeader("x-powered-by");
		next();
	});

	app.use('/', express.static(__dirname + '/public'));
	app.use(express.directory(__dirname + '/public'))
	app.use(express.static(__dirname + '/public'))

	app.use(__decodeReq); // token-session decode pattern
	app.use(app.router);
	app.use(function(req, res, next) {
		res.writeHead(404, {
			'Content-Type': 'application/json'
		});
		res.write(JSON.stringify({
			message: "Request Not Found"
		}));
		res.end();
	});
});

// SOLVES THE CORS PROBLEM
app.all('/*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "localhost");
	res.header("Access-Control-Allow-Headers", 'Content-Type, X-Requested-With');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
});

/**
 * handle OPTIONS requests from the browser
 */
app.options("*", function(req, res, next) {
	res.send(200);
});

// IOC routes' initiation
System.initRoutes(app);

app.listen(port);

//Setup Socket.IO
io.listen(server).sockets.on('connection', function(socket) {
	console.log('Client Connected on WS');
	socket.on('message', function(data) {
		console.log('WS received :', data);
		//socket.broadcast.emit('server_message', data);
		//socket.emit('server_message', data);
	});
	socket.on('disconnect', function() {
		console.log('Client Disconnected.');
	});
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

app.all('/status', function(req, res, next) {
	res.send({
		state: "running"
	});
	res.end();
});

console.log('Listening on http://0.0.0.0:' + port);


function __decodeReq(req, res, next) {
	// having an exchangable token, to protect transactions
	var token = (req.body.token || "");
	// returns a promise-like object, compatible with Q's promise
	// a then() chain can be used, as also to be handled 
	// by Q (if returned a Q-promise).
	return pledge(function(deferred) {
		memcached.get(token, function(err, ressult) {
			if (err) {
				console.error(err, ressult);
				if (typeof next === 'function') {
					next();
					return;
				}
				deferred.reject({
					status: 500,
					data: ""
				});
				return;
			}
			if (!ressult) {
				if (typeof next === 'function') {
					next();
					return;
				}
				// user not logged in
				deferred.reject({
					status: 400,
					data: "User is not logged in"
				});
				return;
			}
			var obj = JSON.parse(ressult);
			req.user = obj || {};
			req.user.uid = req.session.uid = req.body.uid = obj.uid || 0;
			req.user.ukey = req.body.ukey = obj.ukey || '';

			if (typeof next === 'function') {
				next();
				return;
			}
			deferred.resolve(req, res, next);
		});
	});
}