'use strict';

var ExamCollection = require('../../timetable/collections/ExamCollection');
var LessonCollection = require('../collections/LessonCollection');
var Marionette = require('backbone.marionette');
var TimetableModuleCollection = require('../collections/TimetableModuleCollection');
var localforage = require('localforage');
var config = require('../config');

module.exports = Marionette.Controller.extend({
  initialize: function (options) {
    if (options.name) {
      this.name = options.name;
    }
    this.semester = options.semester;
    this.personalTimetable = options.personalTimetable;
    this.exams = new ExamCollection();
    this.timetable = new LessonCollection();
    this.selectedModules = new TimetableModuleCollection([], {
      exams: this.exams,
      timetable: this.timetable
    });
    
    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);
    
  },

  modulesChanged: function () {
    if (!this.selectedModules.shared && this.personalTimetable) {
      localforage.setItem(config.semTimetableFragment(this.semester) +
        ':queryString', this.selectedModules.toQueryString());
    } else {
      localforage.setItem('friendTimetable', {
        name: this.name,
        semester: this.semester,
        queryString: this.selectedModules.toQueryString()
      });
    }
  }
});
