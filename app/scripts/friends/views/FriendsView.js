'use strict';

var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var TimetableView = require('../../timetable/views/TableView');
var template = require('../templates/friends.hbs');
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var SelectedModulesController = require('../../common/controllers/SelectedModulesController');
var _ = require('underscore');

module.exports = Marionette.LayoutView.extend({
  template: template,
  regions: {
    timetableRegion: '#timetable-friend',
    timetableRegion2: '#timetable-friend2'
  },
  onShow: function () {
    this.selectedModules = App.request('selectedModules', 1);
    this.timetable = this.selectedModules.timetable;
    this.timetableRegion2.show(new TimetableView({collection: this.timetable}));
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
        that.insertFriendTimetable($('#name').val(), result.redirectedUrl);
      },
      error: function(xhr, status, error){
        console.log(status);
      }
    });
  },
  insertFriendTimetable: function (name, timetableUrl) {
    var urlFragments = timetableUrl.split('/');
    var queryFragments = urlFragments.slice(-1)[0].split('?');
    var semester = parseInt(queryFragments[0].slice(3));
    var timetableQueryString = queryFragments[1];

    var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(timetableQueryString);
    
    var selectedModulesController = new SelectedModulesController({
      semester: semester,
      personalTimetable: false
    });

    _.map(selectedModules, function (module) {
      selectedModulesController.selectedModules.add({
        ModuleCode: module.ModuleCode,
        Semester: semester
      }, module);
    });

    var timetable = new TimetableView({collection: selectedModulesController.selectedModules.timetable});
    this.timetableRegion.show(timetable);
  }
});
