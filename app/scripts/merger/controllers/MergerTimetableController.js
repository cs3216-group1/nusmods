'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var Promise = require('bluebird'); // jshint ignore:line
var TimetableModuleCollection = require('../../common/collections/TimetableModuleCollection');
var NUSMods = require('../../nusmods');
var LessonModel = require('../../common/models/LessonModel');
var LessonCollection = require('../../common/collections/LessonCollection');
var GridCollection = require('../collections/GridCollection');
var MemberCollection = require('../collections/MemberCollection');
var TimetableView = require('../views/TimetableView');
var _ = require('underscore');
var config = require('../../common/config');





var navigationItem = App.request('addNavigationItem', {
  name: 'Merger',
  icon: 'table',
  url: '/merger'
});


var semester = 1; //TODO: Hardcoded
var academicYear = '2014/2015';//academicYear.replace('-', '/');
var queryString = 'ACC2002[LEC]=B2&ACC2002[TUT]=B03&MA1101R[LAB]=B07&MA1101R[LEC]=SL1&MA1101R[TUT]=T06&CS5237[LEC]=1';


module.exports = Marionette.Controller.extend({
  // showTimetable: function(){
  //   console.log("show timetable");
  //   App.mainRegion.show(new TimetableView({}));
  // }
  initialize: function(){
    this.memberCollection = new MemberCollection();
    this.gridCollection = new GridCollection();

    this.listenTo(this.memberCollection,'add remove change',this._updateGrids);
    // this._updateGrids();
  },

  showTimetable: function () {

    navigationItem.select();

    var timetableView = new TimetableView({
      academicYear: academicYear,
      semester: semester,
      gridCollection: this.gridCollection,
      memberCollection:this.memberCollection
    });

    App.mainRegion.show(timetableView);

    // Promise.resolve().then(function () {
    //   if (queryString) {
    //     var selectedModules = App.request('selectedModules', semester);
    //     var timetable = selectedModules.timetable;
    //     timetable.reset();
    //     var selectedCodes = selectedModules.pluck('ModuleCode');
    //     var routeModules = TimetableModuleCollection.fromQueryStringToJSON(queryString);
    //     var routeCodes = _.pluck(routeModules, 'ModuleCode');
    //     _.each(_.difference(selectedCodes, routeCodes), function (code) {
    //       selectedModules.remove(selectedModules.get(code));
    //     });
    //     return Promise.all(_.map(routeModules, function (module) {
    //       var selectedModule = selectedModules.get(module.ModuleCode);
    //       if (selectedModule) {
    //         var selectedModuleLessons = selectedModule.get('lessons');
    //         if (selectedModuleLessons) {
    //           var lessonsByType = selectedModuleLessons.groupBy('LessonType');
    //           _.each(module.selectedLessons, function (lesson) {
    //             timetable.add(selectedModuleLessons.where({
    //               LessonType: lesson.LessonType,
    //               ClassNo: lesson.ClassNo
    //             }));
    //             delete lessonsByType[lesson.LessonType];
    //           });
    //           // Add lessons whose type did not exist in data when timetable last saved
    //           _.each(lessonsByType, function (lessonsOfType) {
    //             timetable.add(_.sample(lessonsOfType));
    //           });
    //         }
    //       } else {
    //         return App.request('addModule', semester, module.ModuleCode, module);
    //       }
    //     }));
    //   }
    // }).then(function () {
    //   App.mainRegion.show(new TimetableView({
    //     academicYear: academicYear,
    //     semester: semester,
    //     collection: this.collection
    //   }));
    // });
  },

  _updateGrids: function(){
    console.log("_updateGrids");
    this.gridCollection.emptyGrids();
    var mergingTimetables = [];
        

    this.memberCollection.each(function(member){
      if(member.get('display')){
        mergingTimetables.push(member);
      }
    })

    // mergingTimetables = App.request('mergingTimetables');

    var self = this;
    this._interpretMeringTimetableStrings(mergingTimetables).then(function(mergingTimetable){
      _.each(mergingTimetable,function(values){
        _.each(values,function(value){
          var person = value.person;
          var timetable = value.timetable;
          _.each(timetable,function(lesson){
            self._addLessonToMergingGrids(person, lesson);
          });
        });
      });
    });
  },

  _interpreteTimetableString: function(person, timetableString){
    var routeModules = TimetableModuleCollection.fromQueryStringToJSON(timetableString);
    var sem = 1;
    
    return Promise.all(_.map(routeModules,function(module){
      var module_id = module['ModuleCode'];
      return Promise.all([NUSMods.getModIndex(module_id), NUSMods.getTimetable(sem, module_id)])
      .then(function(values){
        var module_info = values[0];
        var module_timetable = values[1];
        var timetable = [];
        var lessons = new LessonCollection();
        _.each(_.groupBy(module_timetable,'LessonType'),function(group){
          _.each(_.groupBy(group, 'ClassNo'), function (lessonsData) {
            _.each(lessonsData,function(lessonData){
              var lesson = new LessonModel(_.extend({}, lessonData));
                    lessons.add(lesson);
            },this);
          },this);
        },this);
        _.each(module.selectedLessons, function (lesson) {
          var selectedLesson = lessons.where(lesson);
          timetable = timetable.concat(selectedLesson);
        }, this);
        
        return {person:person,timetable:timetable};
      });
    }));
  },

  _interpretMeringTimetableStrings: function(mergingTimetables){
    return Promise.all(_.map(mergingTimetables,function(mergingTimetable){
      var person = mergingTimetable.person;
      var timetableString = mergingTimetable.timetableString;

      return this._interpreteTimetableString(person,timetableString);
    },this));
  },

  _addLessonToMergingGrids: function(person, lesson){
    var indexes = this._getMappedGridIndexes(lesson);
    _.each(indexes,function(index){
      var temp = {};
      temp[person] = lesson;
      this._addInfoToGrid(index,temp);
    },this);
  },

  _addInfoToGrid: function(GridIndex,info){
    var grid = this._getGrid(GridIndex);
    grid.addInfo(info);
  },

  _getGrid: function(GridIndex){
    return this.gridCollection.get(GridIndex);
  },


  _getMappedGridIndexes: function(lesson){
    var indexes = _.map([lesson.get("StartTime"),lesson.get("EndTime")],function(time){
      var hour = time.slice(0,2);
      var minutes = time.slice(2);
      return (hour - 8) * 2 + minutes/30;
    });

    var startIndex = indexes[0];
    var endIndex = indexes [1];
    return _.map(_.range(startIndex,endIndex),function(index){
      return lesson.get("dayAbbrev") + index;
    });
  }
});
