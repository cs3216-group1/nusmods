'use strict';

var localforage = require('localforage');
var Promise = require('bluebird'); // jshint ignore:line

module.exports = {
  setItemToDB: function (key, value, callback) {
    // sdk.post('me/app/' + key, { 'data': value }, function (response) {
      localforage.setItem(key, value, function (value) {
        if (callback) {
          callback();
          return;
        }
      });
    // });
  },
  getItemFromDB: function (key, callback) {
    // sdk.get('me/app/' + key, function (response) {
      if (response === '') {
        response = '{\"status\": \"absent\"}';
      }
      response = JSON.parse(response);
      var value = response.data;
      if (response.status === 'absent') {
        return;
      }
      localforage.setItem(key, value, function (value) {
        if (callback) {
          callback();
          return;
        }
      })
    // });
  }
};
