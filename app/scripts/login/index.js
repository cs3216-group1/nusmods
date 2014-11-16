'use strict';

var App = require('../app');

var navigationItem = App.request('addNavigationItem', {
  name: 'Login',
  icon: 'code',
  url: ''
});
