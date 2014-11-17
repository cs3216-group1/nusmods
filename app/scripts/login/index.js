'use strict';

var App = require('../app');
var queryDB = require('../common/utils/queryDB');

var navigationItem;

module.exports = function () {
  sdk.getLoginStatus(function (response) {
    response = JSON.parse(response);
    var status = response['status'];
    App.request('removeNavigationItem', 'login');
    App.request('removeNavigationItem', 'logout');
    if (status == 'connected') {
      sdk.get('/me/userinfo', function (info) {
        info = JSON.parse(info);
        navigationItem = App.request('addNavigationItem', {
          name: info.info.name,
          icon: 'user',
          url: 'logout'
        });
      });
    } else {
      navigationItem = App.request('addNavigationItem', {
        name: 'Login',
        icon: 'paper-plane',
        url: 'login'
      });
    }
  });
}
