'use strict';

var App = require('../app');
var Marionette = require('backbone.marionette');
var TimetableController = require('./controllers/MergerTimetableController');

console.log("scheduler init");
App.addInitializer(function () {
  new Marionette.AppRouter({
    controller: new TimetableController(),
    appRoutes: {
      'scheduler': 'showTimetable'
    }
  });
});
