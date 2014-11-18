'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');

var navigationItem = App.request('addNavigationItem', {
  name: 'Chatroom',
  icon: 'fa fa-comments',
  url: '/chatroom'
});

var controller = {
  showChatroom: function () {
    var ChatroomView = require('./views/ChatroomView');
    navigationItem.select();
    App.mainRegion.show(new ChatroomView());
  }
};

App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: controller,
    appRoutes: {
      'chatroom': 'showChatroom'
    }
  });
});
