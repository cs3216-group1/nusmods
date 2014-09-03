'use strict';

var _ = require('underscore');
var Marionette = require('backbone.marionette');
var FriendTimetableItemView = require('./FriendTimetableItemView');
var template = require('../templates/friends_timetable.hbs');

var EmptyView = Marionette.ItemView.extend({
  template: _.template('<div><p>No timetables added.</p></div>')
});

module.exports = Marionette.CompositeView.extend({
  childView: FriendTimetableItemView,
  childViewContainer: 'div',
  emptyView: EmptyView,
  template: template
});
