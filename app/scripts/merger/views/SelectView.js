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

var data = [
            {
              person:'wenbo',
              timetableString:'ACC2002[LEC]=B2&ACC2002[TUT]=B03&MA1101R[LAB]=B07&MA1101R[LEC]=SL1&MA1101R[TUT]=T06&CS5237[LEC]=1'
            },
            {
              person:'siyue',
              timetableString: 'ACC1002X[LEC]=X3&ACC1002X[TUT]=X16&ACC3603[SEC]=C1&MA1104[LEC]=SL1&MA1104[TUT]=T03'
            },
            {
              person:'dat',
              timetableString: 'CS2101[SEC]=3&CS2103T[TUT]=T3&CS5234[LEC]=1&ST2334[LEC]=SL1&ST2334[TUT]=T4&GEM2900[LEC]=SL1&CS3216[LEC]=1&CS3216[TUT]=2'
            },
            {
              person:'jishnu',
              timetableString: 'FMA1201L[SEM]=1&CS3216[LEC]=1&CS3216[TUT]=1'
            }
          ];

var mtimetable = {
  wenbo: 'ACC2002[LEC]=B2&ACC2002[TUT]=B03&MA1101R[LAB]=B07&MA1101R[LEC]=SL1&MA1101R[TUT]=T06&CS5237[LEC]=1',
  siyue: 'ACC1002X[LEC]=X3&ACC1002X[TUT]=X16&ACC3603[SEC]=C1&MA1104[LEC]=SL1&MA1104[TUT]=T03',
  dat: 'CS2101[SEC]=3&CS2103T[TUT]=T3&CS5234[LEC]=1&ST2334[LEC]=SL1&ST2334[TUT]=T4&GEM2900[LEC]=SL1&CS3216[LEC]=1&CS3216[TUT]=2',
  jishnu: 'FMA1201L[SEM]=1&CS3216[LEC]=1&CS3216[TUT]=1'
}


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

    queryDB;
  },

  onSelect2Selecting: function (event) {
    event.preventDefault();

    var userID = event.val.userID;
    var name = event.val.name;
    var semTimetableFragment = config.semTimetableFragment(this.semester);
    var url = semTimetableFragment + ':queryString';

    var self = this;
    queryDB.getUserInfoFromDB(userID,url,function(timetableString){  
      self.trigger('superview:addMember',{person:name,timetableString:timetableString});
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
