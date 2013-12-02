var events = require('events');
var conf = require("./conf.js");
global.systemInstance = null;

var serviceLocator = {};
// Creating a global singleton
var system = (function (conf) {

	function System() {
		this.conf = conf;
		this.serviceLocator = serviceLocator(this);
	}

	// inherit
	(function (father) {
		// I am your Father!
		this.prototype = father;
		return this;
	}).call(System, new events.EventEmitter());

	System.prototype.getUuid = function () {
		for (var i = 0, a , b = a = ''; ++i < 36; b += (a += i) * 6.5 ? (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) : '-');
		return b
	};

	System.prototype.initRoutes = function(app) {
		var __this = this;
		this.routes = this.conf.routes.map(function(route) {
			var module = require(route);
			module.call(process, __this, app);
			return module;
		});
	};

	return System;
})(conf);

serviceLocator = (function(system) {

	function ServiceLocator() {
		this.store = {
			routes: [],
			hooks: {}
		};

		return this;
	}

	ServiceLocator.prototype.addService = function(route, service, callable) {
		if(route.indexOf("/route") == 0) {

		}
	};

	return ServiceLocator;
});

module.exports = __getInstance();

function __getInstance() {
	if (global.systemInstance == null) {
		return (global.systemInstance = new system());
	}
	return global.systemInstance;
}