'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var TimetableView = require('../../timetable/views/TableView');
var template = require('../templates/friends.hbs');
var addFriendTimetableTemplate = require('../templates/add_friend_timetable.hbs');
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var SelectedModulesController = require('../../common/controllers/SelectedModulesController');
var FriendsTimetableView = require('./FriendsTimetableView');
var FriendTimetableItemView = require('./FriendTimetableItemView');
var _ = require('underscore');
require('bootstrap/tooltip');
require('bootstrap/popover');

module.exports = Marionette.LayoutView.extend({
  template: template,
  regions: {
    friendsTimetableRegion: '#friends-timetables',
    mergedTimetableRegion: '#merged-timetable'
  },
  ui: {
    'addButton': '.js-add-timetable-popover'
  },
  onShow: function () {
    var that = this; 
    localforage.getItem('timetable:friends', function (data) {
      that.friendsTimetableCollection = new Backbone.Collection(data);
      var friendsTimetableView = new FriendsTimetableView({collection: that.friendsTimetableCollection});
      that.friendsTimetableRegion.show(friendsTimetableView);
    });
    this.ui.addButton.popover({
      html: true,
      content: addFriendTimetableTemplate()
    });
  },
  events: {
    'click .js-add-friend-timetable': 'getFinalTimetableUrl',
    'click .js-merge-timetables': 'mergeTimetables'
  },
  getFinalTimetableUrl: function () {
    var that = this;
    var timetableUrl = $('#url').val();
    $.ajax({
      url: 'http://nusmods.com/redirect.php',
      type: 'GET',
      crossDomain: true,
      dataType: 'json',
      data: {
        timetable: timetableUrl
      },
      success: function(result){
        that.ui.addButton.popover('hide');
        that.insertFriendTimetableFromUrl($('#name').val(), result.redirectedUrl);
      },
      error: function(xhr, status, error){
        alert(status);
      }
    });
  },
  insertFriendTimetableFromUrl: function (name, timetableUrl) {
    var urlFragments = timetableUrl.split('/');
    var queryFragments = urlFragments.slice(-1)[0].split('?');
    var semester = parseInt(queryFragments[0].slice(3));
    var timetableQueryString = queryFragments[1];

    this.friendsTimetableCollection.add({
      name: name,
      semester: semester,
      queryString: timetableQueryString
    });

    var friendsTimetableData = _.pluck(this.friendsTimetableCollection.models, 'attributes');
    localforage.setItem('timetable:friends', friendsTimetableData);
  },
  mergeTimetables: function () {
    var mergedQueryString = _.pluck(_.pluck(this.friendsTimetableCollection.models, 'attributes'), 'queryString').join('&');
    // console.log(mergedQueryString);
    var model = new Backbone.Model({
      name: 'Merged Timetable',
      semester: 1,
      queryString: mergedQueryString
    });
    var friendTimetableItemView = new FriendTimetableItemView({
      model: model
    });
    this.mergedTimetableRegion.show(friendTimetableItemView);
  }
});
