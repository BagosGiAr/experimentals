
var Q = require("q");
var System = require("../lib/system.js");
var pledge = require("../lib/pledge.js");

if (typeof setImmediate === "undefined") {
	require('setimmediate');
}

module.export = (function(redis, memcached) {

	function __privateFunc() {

	}

	return {
		list: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				deferred.resolve([]);
			});
		},
		load: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				deferred.resolve([]);
			});
		},
		delete: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				deferred.resolve({});
			});
		},
		get: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				deferred.resolve({});
			});
		},
		put: function(args) {
			var __this = this;
			return pledge(function(deferred) {
				deferred.resolve({});
			});
		},
	};
});