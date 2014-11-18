'use strict';

var localforage = require('localforage');
var Promise = require('bluebird'); // jshint ignore:line

module.exports = {
  setItemToDB: function (key, value, callback) {
    sdk.getLoginStatus(function(response) {
      response = JSON.parse(response);
      var status = response['status'];
      if(status == 'connected'){
        sdk.post('me/app/' + key, { 'data': value }, function (response) {
          if (callback) {
            callback(response);
            return;
          }
        });
      } else {
        localforage.setItem(key, value).then(function (val) {
          if (callback) {
            callback(val);
            return;
          }
        });
      }
    });
  },
  getItemFromDB: function (key, callback) {
    sdk.getLoginStatus(function(response) {
      response = JSON.parse(response);
      var status = response['status'];
      if(status == 'connected'){
        sdk.get('me/app/' + key, function (response) {
          if (response === '') {
            response = '{\"status\": \"absent\"}';
          }
          response = JSON.parse(response);
          var value = response.data;
          if (response.status === 'absent') {
            if (callback) {
              callback();
            }
          } else {
            if (callback) {
              callback(value);
            }
          }
          return;
          
        });
      } else {
        localforage.getItem(key).then(function (value) {
          if (callback) {
            callback(value);
            return;
          }
        });
      }
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
      response = JSON.parse(response);
      callback(response['data']);
    });
  },
};
