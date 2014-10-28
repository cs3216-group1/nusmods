'use strict';

var ExamCollection = require('../../timetable/collections/ExamCollection');
var LessonCollection = require('../collections/LessonCollection');
var Marionette = require('backbone.marionette');
var TimetableModuleCollection = require('../collections/TimetableModuleCollection');
var localforage = require('localforage');
var config = require('../config');

var EventCollection = require('../collections/EventCollection');

module.exports = Marionette.Controller.extend({
  initialize: function (options) {
    this.semester = options.semester;
    this.exams = new ExamCollection();
    this.timetable = new LessonCollection();
    this.selectedModules = new TimetableModuleCollection([], {
      exams: this.exams,
      timetable: this.timetable
    });
    this.eventCollection = new EventCollection();

    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);
    this.listenTo(this.eventCollection, 'add remove', this.modulesChanged);
  },

  modulesChanged: function () {
    if (!this.selectedModules.shared) {
      localforage.setItem(config.semTimetableFragment(this.semester) +
        ':queryString', this.selectedModules.toQueryString());
    }
  }
});
