'use strict';

var localforage = require('localforage');

module.exports = {
  setItem: function (key, value, callback) {
    sdk.post('me/app/' + key, { 'data': value }, function (response) {
      localforage.setItem(key, value, function (value) {
        if (callback) {
          callback();
          return;
        }
      });
    });
  },
  getItemFromDB: function (key, callback) {
    sdk.get('me/app/' + key, function (response) {
      var value = JSON.parse(response).data;
      // localforage.setItem(key, value)
      if (callback) {
        callback(value);
        return;
      }
    });
  }
};
