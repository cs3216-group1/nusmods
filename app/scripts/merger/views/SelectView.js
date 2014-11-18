'use strict';

var $ = require('jquery');
var App = require('../../app');
var Marionette = require('backbone.marionette');
var Mousetrap = require('Mousetrap');
var NUSMods = require('../../nusmods');
var analytics = require('../../analytics');
var template = require('../templates/select.hbs');
var Backbone = require('backbone');
var queryDB = require('../../common/utils/queryDB');
var config = require('../../common/config');


require('select2');

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'select2-selecting': 'onSelect2Selecting'
  },

  ui: {
    'input': 'input'
  },

  initialize: function (options) {
    this.semester = options.semester;
    this.members = options.members;
  },

  onSelect2Selecting: function (event) {
    event.preventDefault();

    var userID = event.val.userID;
    var name = event.val.name;
    var semTimetableFragment = config.semTimetableFragment(this.semester);
    var timetableURL = semTimetableFragment + ':queryString';

    var self = this;
    queryDB.getUserInfoFromDB(userID,timetableURL,function(timetableString){  
      var skippedLessonsURL = semTimetableFragment + ':skippedLessons';
      queryDB.getUserInfoFromDB(userID,skippedLessonsURL, function(skippedLessons){
        self.trigger('superview:addMember',
          {
            person:name,
            timetableString:timetableString,
            skippedLessons: skippedLessons
        });
      });
    });


    this.ui.input.select2('focus');
  },

  onShow: function () {
    var PAGE_SIZE = 50;
    var semester = this.semester;
    var self = this;


    this.ui.input.select2({
      multiple: true,
      query: function (options) {
        queryDB.getFriendsListFromDB(function(friendsList){

          var data = friendsList;

          var i,
            results = [],
            pushResult = function (i) {
              var code = data[i].userId;
              var name = data[i].name;
              if(self.members.where({person:name}).length === 0){
                results.push({
                  id: {userID: code, name: name},
                  text: data[i].name
                });
              }
              
              return results.length;
            };
          var re = new RegExp(options.term, 'i');
          for (i = options.context || 0; i < data.length; i++) {
            pushResult(i);
          }
          options.callback({
            context: i,
            more: i < data.length,
            results: results
          });

        });
        
      }
    });

    Mousetrap.bind('.', function (ev) {
      analytics.track('Search', 'Keyboard', 'Timetable Search');
      $('.timetable-input .select2-input').focus();
      ev.preventDefault();
      return false;
    });
  }
});
