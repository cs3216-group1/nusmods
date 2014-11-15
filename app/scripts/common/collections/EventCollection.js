'use strict';

var Backbone = require('backbone');
var Event = require('../models/EventModel');
var qs = require('qs');
var _ = require('underscore');

module.exports = Backbone.Collection.extend({
  model: Event,

  initialize: function (model,options) {
    this.timetable = options.timetable;
    this.on('add', this.onAdd, this);
    this.on('remove', this.onRemove, this);
  },

  onAdd: function(event) {

    if (!this.colors || !this.colors.length) {
      this.colors = [0, 1, 2, 3, 4, 5, 6, 7];
    }
    var color = this.colors.splice(Math.floor(Math.random() * this.colors.length), 1)[0];
    event.set('color', color);
    event.set('ViewType','event');
    event.set('display',true);

    this.timetable.add(event);
  },

  onRemove: function() {

  },

  toQueryString: function() {
    var qsArray = [];
    this.each(function (event) {
      var eventObject = {
        Title: event.get('Title'),
        StartTime: event.get('StartTime'), 
        EndTime: event.get('EndTime'), 
        DayAbbrev: event.get('DayAbbrev'),
        Venue: event.get('Venue'),
        Duration: event.get('Duration')
      };
      qsArray.push(eventObject);
    }, this);
    return qs.stringify({
      events: qsArray
    });
  },
}, {
  fromQueryStringToJSON: function (queryString) {
    return qs.parse(queryString).events;
  }
});
