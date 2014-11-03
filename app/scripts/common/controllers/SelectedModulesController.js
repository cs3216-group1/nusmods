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
    this.saveOnChange = typeof options.saveOnChange !== 'undefined' ? options.saveOnChange : true;
    this.exams = new ExamCollection();
    this.timetable = new LessonCollection();
    this.skippedLessons = {};
    this.selectedModules = new TimetableModuleCollection([], {
      exams: this.exams,
      timetable: this.timetable,
      skippedLessons: this.skippedLessons,
      getSkippedLessons: this.getSkippedLessons
    });

    this.events = new EventCollection();

    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);
    this.listenTo(this.timetable, 'skip', this.skippedChanged);
    this.listenTo(this.events, 'add remove', this.eventsChanged);
    if (this.saveOnChange) {
      this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
      this.listenTo(this.timetable, 'change', this.modulesChanged);
    }
  },

  modulesChanged: function () {
    if (!this.selectedModules.shared) {
      var url = config.semTimetableFragment(this.semester) + ':queryString';
      var url2 = 'timetable/sem' + this.semester;
      localforage.setItem(url, this.selectedModules.toQueryString()).then(function (value) {
        sdk.post('me/app/' + url2, {'data': value}, function (response) {
          //
        });
      });
    }
  },

  skippedChanged: function () {
    if (!this.selectedModules.shared) {
      var url = config.semTimetableFragment(this.semester) + ":skippedLessons";
      var url2 = 'skipped/sem' + this.semester;
      localforage.setItem(url, qs.stringify(this.skippedLessons)).then(function (value) {
        sdk.post('me/app/' + url2, {'data': value}, function (response) {
          //
        });
      });
    }
  },

  eventsChanged: function () {
    if (!this.selectedModules.shared) {
      var url = config.semTimetableFragment(this.semester) + ":events";
      localforage.setItem(url, this.events.toQueryString());
    }
  },

  getSkippedLessons: function () {
    var thisSemester = this.semester;
    var skippedLessons = this.skippedLessons;
    // localforage.removeItem(config.semTimetableFragment(thisSemester) + ":skippedLessons");return;
    return localforage.getItem(config.semTimetableFragment(thisSemester) + ":skippedLessons").then(function (str) {
      if (str) {
        var collection = qs.parse(str);
        _.each(collection, function (lesson) {
        }, this);
        _.extend(skippedLessons, collection);
        return;
      } else {
        return;
      }
    })
  }

});
