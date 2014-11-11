'use strict';

var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;
var Raven = require('raven');
var config = require('./common/config');
var _ = require('underscore');
var preferencesNamespace = config.namespaces.preferences + ':';

Raven.config('https://44876a16654343e5a30acfcaa5144806@app.getsentry.com/27278', {
  whitelistUrls: ['nusmods.com/scripts/']
}).install();

var Promise = require('bluebird'); // jshint ignore:line
var analytics = require('./analytics');
var localforage = require('localforage');
var queryDB = require('./common/utils/queryDB');
var preferencesNamespace = config.namespaces.preferences + ':';

var $body = $('body');

Promise.all(_.keys(config.defaultPreferences).map(function (property) {
  return localforage.getItem(preferencesNamespace + property).then(function (value) {
    // Migration from old preferences to new namespaced preferencs.
    if (!value) {
      value = config.defaultPreferences[property];
    }
    queryDB.setItemToDB(preferencesNamespace + property, value);
  });
}));

Promise.all(['theme', 'mode'].map(function (property) {
  return localforage.getItem(preferencesNamespace + property).then(function (value) {
    $body.addClass(property + '-' + value);
    $body.attr('data-' + property, value);
    if (property === 'mode' && value !== 'default') {
      $('#mode').attr('href', '/styles/' + value + '.min.css');
    }
  });
})).then(analytics.flush);

var App = require('./app');
App.start();
