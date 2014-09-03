'use strict';

var _ = require('underscore');
var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/friends_timetable_item.hbs');
var TimetableView = require('../../timetable/views/TableView');
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var SelectedModulesController = require('../../common/controllers/SelectedModulesController');
var FriendsTimetableView = require('./friendsTimetableView');

module.exports = Marionette.LayoutView.extend({
  tagName: 'div',
  className: 'panel panel-default',
  template: template,
  regions: {
    friendTimetableRegion: '.friend-timetable'
  },
  events: {
    'click .js-delete-friend-timetable': 'deleteFriendTimetable'
  },
  onShow: function () {  
    this.generateTimetableFromQueryString(this.model.get('name'), 
                                          this.model.get('semester'), 
                                          this.model.get('queryString'));
  },
  generateTimetableFromQueryString: function (name, semester, queryString) { 
    var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(queryString);
    
    var selectedModulesController = new SelectedModulesController({
      name: name,
      semester: semester,
      personalTimetable: false
    });

    selectedModulesController.modulesChanged();

    _.map(selectedModules, function (module) {
      selectedModulesController.selectedModules.add({
        ModuleCode: module.ModuleCode,
        Semester: semester
      }, module);
    });

    var timetable = new TimetableView({collection: selectedModulesController.selectedModules.timetable});
    this.friendTimetableRegion.show(timetable);
  },
  deleteFriendTimetable: function () {
    this.model.collection.remove(this.model);
  }
});
