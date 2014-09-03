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
    // this.selectedModules = App.request('selectedModules', 1);
    // this.timetable = this.selectedModules.timetable;
    
    // localforage.getItem('friendTimetable', function (data) {
    //   if (data) {
    //     that.insertFriendTimetableFromQueryString(data.name, data.semester, data.queryString);
    //   }
    // });
    var that = this;
    var friendsTimetableList = [
      { 
        name: 'Yen Ling',
        semester: 1,
        queryString: 'CM1401[LEC]=SL1&CM1401[TUT]=FR1&LSM1101[LAB]=SB1&LSM1101[LEC]=SL1&LSM1101[TUT]=ST1&LSM1102[LAB]=SB1&LSM1102[LEC]=SL1&LSM1102[TUT]=ST1&CS1010S[LEC]=1&CS1010S[REC]=2&CS1010S[TUT]=4&SP2171[LEC]=SL1&SP2173[LAB]=SB1&SP2173[LEC]=SL1&SP2173[TUT]=ST1'
      },
      { name: 'Jenna',
        semester: 1,
        queryString: 'SSD1203[LEC]=1&SSD1203[TUT]=1&CS4243[LEC]=1&CS4243[LAB]=4&CS3241[LEC]=1&CS3241[TUT]=3&CS3241[LAB]=3&HR2002[TUT]=E32&HR2002[LEC]=E4&CS3244[LEC]=1&CS3244[TUT]=4&CG4001='
      }
    ];

    var friendsTimetableCollection = new Backbone.Collection(friendsTimetableList);
    var friendsTimetableView = new FriendsTimetableView({collection: friendsTimetableCollection});
    this.friendsTimetableRegion.show(friendsTimetableView);
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

    this.insertFriendTimetableFromQueryString(name, semester, timetableQueryString);
  } 
});
