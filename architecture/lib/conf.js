var conf = function () {
	var conf = {};
	return (function (conf) {
		'use strict';

		confIOC = require("../conf/ioc.conf.json");
		var confSet = require("../conf/config.json");
		var def = confSet["defaultSet"];
		var tmpConf = confSet[def];
		var tmpIOC = confIOC[def];
		process.argv.forEach(function (val) {
			if (val.split("mode").length > 1) {
				var mode = val.split(":");
				tmpConf = confSet[mode[1]];
				tmpIOC = confIOC[mode[1]];
			}
		});

		for (var prop in tmpConf) {
			conf[prop] = tmpConf[prop];
		}
		for (var prop in tmpIOC) {
			conf[prop] = tmpIOC[prop];
		}

		return conf;
	})(conf || (conf = {}));
};

module.exports = conf();
global.conf = conf();