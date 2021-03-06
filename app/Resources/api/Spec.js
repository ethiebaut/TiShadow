var p = require('/api/PlatformRequire');
var log = require('/api/Log');
var jasmine = require('/lib/jasmine').jasmine;
var TiShadowReporter = require('/api/TiShadowReporter');
var JUnitXMLReporter = require('/api/JUnitXMLReporter');

//jasmine.getEnv().addReporter(new TiShadowReporter());


function loadSpecs(name, base, filter) {
  var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/spec/" + base);
  var files = dir.getDirectoryListing();
  if (!files) {
    return;
  };
  files.forEach(function(file) {
    if (file.match(/_spec.js$/)) {
      p.require("/spec/" + base + "/" + (file.replace(".js", "")));
    } else if (filter === {} || filter[file]) {
      loadSpecs(name, base + "/" + file, filter);
    }
  });
};

exports.run = function (name, junitxml, maintain_cache) {
  //For a new environment reset
  jasmine.currentEnv_ = new jasmine.Env();
  if (junitxml) {
    jasmine.getEnv().addReporter(new JUnitXMLReporter());
  } else {
    jasmine.getEnv().addReporter(new TiShadowReporter());
  }
  var filter_file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + name + "/spec/specs"); 
  var filter = {};
  if (filter_file.exists()) {
    filter_file.read().text.split("\n").forEach(function(dir) {
      filter[dir.trim()] = 1;
    });
  }
  if (!maintain_cache) {
    p.clearCache();
    require("/api/Localisation").clear();
  }
  loadSpecs(name, "", filter);
  jasmine.getEnv().execute();
};

exports.runNoClearCache = function (name, junitxml) {
  exports.run(name, junitxml, true);
};

