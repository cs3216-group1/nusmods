'use strict';

var $ = require('jquery');
var Backbone = require('backbone');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var TimetableView = require('../../timetable/views/TableView');
var template = require('../templates/friends.hbs');
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var SelectedModulesController = require('../../common/controllers/SelectedModulesController');
var FriendsTimetableView = require('./friendsTimetableView');
var _ = require('underscore');

module.exports = Marionette.LayoutView.extend({
  template: template,
  regions: {
    friendsTimetableRegion: '#friends-timetables'
  },
  onShow: function () {
    var that = this; 
    localforage.getItem('timetable:friends', function (data) {
      that.friendsTimetableCollection = new Backbone.Collection(data);
      var friendsTimetableView = new FriendsTimetableView({collection: that.friendsTimetableCollection});
      that.friendsTimetableRegion.show(friendsTimetableView);
    });
  },
  events: {
    'click .js-add-friend-timetable': 'getFinalTimetableUrl'
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
        that.insertFriendTimetableFromUrl($('#name').val(), result.redirectedUrl);
      },
      error: function(xhr, status, error){
        console.log(status);
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
  } 
});
