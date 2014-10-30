'use strict';

var ExamCollection = require('../../timetable/collections/ExamCollection');
var LessonCollection = require('../collections/LessonCollection');
var Marionette = require('backbone.marionette');
var TimetableModuleCollection = require('../collections/TimetableModuleCollection');
var localforage = require('localforage');
var config = require('../config');
var qs = require('qs');
var localforage = require('localforage');
var _ = require('underscore');

var EventCollection = require('../collections/EventCollection');

module.exports = Marionette.Controller.extend({
  initialize: function (options) {
    this.semester = options.semester;
    this.exams = new ExamCollection();
    this.timetable = new LessonCollection();
    this.skippedLessons = {};
    this.getSkippedLessons();
    this.selectedModules = new TimetableModuleCollection([], {
      exams: this.exams,
      timetable: this.timetable,
      skippedLessons: this.skippedLessons
    });

    this.events = new EventCollection();

    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);
    this.listenTo(this.timetable, 'skip', this.skippedChanged);
    this.listenTo(this.events, 'add remove', this.eventsChanged);
  },

  modulesChanged: function () {
    if (!this.selectedModules.shared) {
      localforage.setItem(config.semTimetableFragment(this.semester) +
        ':queryString', this.selectedModules.toQueryString());
    }
  },

  skippedChanged: function () {
    localforage.setItem(config.semTimetableFragment(this.semester) + ":skippedLessons", qs.stringify(this.skippedLessons));
  },

  eventsChanged: function () {
    if (!this.selectedModules.shared) {
      localforage.setItem(config.semTimetableFragment(this.semester) + ":events", this.events.toQueryString());
    }
  },

  getSkippedLessons: function () {
    var thisSemester = this.semester;
    var skippedLessons = this.skippedLessons;
    // localforage.removeItem(config.semTimetableFragment(thisSemester) + ":skippedLessons");return;
    localforage.getItem(config.semTimetableFragment(thisSemester) + ":skippedLessons", function (str) {
      if (str) {
        var collection = qs.parse(str);
        _.each(collection, function (lesson) {
        }, this);
        _.extend(skippedLessons, collection);
      } else {
        return;
      }
    });
  }

});
