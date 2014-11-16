'use strict';

var localforage = require('localforage');
var Promise = require('bluebird'); // jshint ignore:line

module.exports = {
  setItemToDB: function (key, value, callback) {
    sdk.post('me/app/' + key, { 'data': value }, function (response) {
      localforage.setItem(key, value).then(function (val) {
        if (callback) {
          callback();
          return;
        }
      });
    });
  },
  getItemFromDB: function (key, callback) {
    sdk.get('me/app/' + key, function (response) {
      console.log('response is ');
      console.log(response);
      if (response === '') {
        response = '{\"status\": \"absent\"}';
      }
      response = JSON.parse(response);
      var value = response.data;
      if (response.status === 'absent') {
        return;
      }
      localforage.setItem(key, value).then(function (val) {
        if (callback) {
          callback(value);
          return;
        }
      });
    });
  },

  getFriendsListFromDB: function(callback){
    sdk.get('me/friends',function(response){
      if(callback){
        response = JSON.parse(response);
        callback(response['friends']);
      }
    });
  },

  getUserInfoFromDB: function(userID, key, callback){
    var baseURL = userID + '/app/';
    if(key){
      baseURL += key;
    }

    sdk.get(baseURL,function(response){
      console.log(response);
      response = JSON.parse(response);
      callback(response['data']);
    });
  }
};
