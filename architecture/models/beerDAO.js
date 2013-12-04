var Q = require("q");
var crypto = require('crypto');
var System = require("../lib/system.js");
var pledge = require("../lib/pledge.js");

if (typeof setImmediate === "undefined") {
	require('setimmediate');
}

module.export = (function(redis, memcached) {

	var md5 = crypto.createHash('md5');

	return {
		list: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				redis.hmget("itemsDB", args.keys || [], function(err, json) {
					var tmp = JSON.parse(json);
					if(err || !json) {
						deferred.reject(err || "Not found keys");
						return;
					}
					deferred.resolve(tmp);
				});
			});
		},
		load: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				if(args.random) {
					deferred.then(function(arr, next) {
						redis.srandmember("itemsDB", 10, function(err, keys) {
							__this.list({
								keys: keys;
							}).then(function(items) {
						    	next(items);
							});
						});
					});
					deferred.resolve([]);
					return;
				}
				if(args.cats) {
					args.cats.forEach(function(cat) {
						deferred.then(function(items, next) {
							redis.smembers("cats:"+cat+":items", function(err, keys) {
								next( (items || []).concat(keys) );
							})
						});
					});
				}
				if(args.tags) {
					args.tags.forEach(function(tag) {
						deferred.then(function(items, next) {
							redis.smembers("tags:"+tag+":items", function(err, keys) {
								next( (items || []).concat(keys) );
							})
						});
					});
				}
				deferred.then(function(items, next) {
					var arr = [];
					var l = items.length;
					for (var i = 0; i < l; i++) {
						for (var j = i + 1; j < l; j++) {
							if (items[i] === items[j])
								j = ++i;
						}
						arr.push(items[i]);
				    }
				    next(arr);
				})
				.then(function(keys, next) {
					__this.list({
						keys: arr;
					}).then(function(items) {
				    	next(items);
					});
				});

				deferred.resolve([]);
			});
		},
		delete: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				redis.hget("itemsDB", args.key, function(err, json) {
					var tmp = JSON.parse(json);
					if(err || !json) {
						deferred.reject(err || "Not found " + args.key);
						return;
					}
					redis.hdel("itemsDB", args.key);
					deferred.resolve(tmp);
				});
			});
		},
		get: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				redis.hget("itemsDB", args.key, function(err, json) {
					var tmp = JSON.parse(json);
					if(err || !json) {
						deferred.reject(err || "Not found " + args.key);
						return;
					}
					deferred.resolve(tmp);
				});
			});
		},
		put: function(args) {
			var __this = this;
			var item = {
				key: md5.update(args.title || '').digest('hex'),
				title: args.title || false,
				geolocation: args.geolocation || false,
				cats: args.cats || false,
				tags: args.tags || false,
				meta: args.meta || false
			};
			return pledge(function(deferred) {
				redis.hget("itemsDB", item.key, function(err, json) {
					var tmp = JSON.parse(json);
					if(err) {
						deferred.reject(err);
						return;
					}
					tmp = {
						key: item.key,
						title: item.title || tmp.title || '',
						geolocation: item.geolocation || tmp.geolocation || { lat: 0, lon: 0 },
						cats: (Array.isArray(item.cats) ? tmp.cats.concat(item.cats) : (tmp.cats || [])),
						tags: (Array.isArray(item.tags) ? tmp.tags.concat(item.tags) : (tmp.tags || [])),
						meta: item.meta || tmp.meta || {}
					};
					redis.hset("itemsDB", tmp.key, JSON.stringify(tmp));
					deferred.resolve(tmp);
				});
			});
		}
	};
});