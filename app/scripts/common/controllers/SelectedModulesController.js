'use strict';

var ExamCollection = require('../../timetable/collections/ExamCollection');
var LessonCollection = require('../collections/LessonCollection');
var Marionette = require('backbone.marionette');
var TimetableModuleCollection = require('../collections/TimetableModuleCollection');
var localforage = require('localforage');
var config = require('../config');

module.exports = Marionette.Controller.extend({
  initialize: function (options) {
    this.semester = options.semester;
    this.exams = new ExamCollection();
    this.timetable = new LessonCollection();
    this.selectedModules = new TimetableModuleCollection([], {
      exams: this.exams,
      timetable: this.timetable
    });
    if (options.personalTimetable) {
      this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
      this.listenTo(this.timetable, 'change', this.modulesChanged);
    }
  },

  modulesChanged: function () {
    if (!this.selectedModules.shared) {
      localforage.setItem(config.semTimetableFragment(this.semester) +
        ':queryString', this.selectedModules.toQueryString());
    }
  }
});
