'use strict';

var $ = require('jquery');
var MemberView = require('./MemberView');
var Marionette = require('backbone.marionette');
var template = require('../templates/members.hbs');
var _ = require('underscore');

var EmptyView = Marionette.ItemView.extend({
  tagName: 'tr',
  template: _.template('<td colspan="4" class="empty-timetable">No members added.</td>')
});

module.exports = Marionette.CompositeView.extend({
  tagName: 'table',
  className: 'table table-bordered table-condensed',
  childView: MemberView,
  childViewContainer: 'tbody',
  emptyView: EmptyView,
  template: template,
  childViewOptions: function () {
    return {
      parentView: this,
    };
  },
  collectionEvents: {
    'add remove': function() {
      $('#clash').toggleClass('hidden', !this.collection.clashCount);
    }
  },
  childEvents: {
    'remove:member': function(event){
      var person = $($(event.$el[0]).children()[0]).html();
      var modelToDelete = this.collection.where({person:person});
      this.collection.remove(modelToDelete);
    },
    'toggle:display': function(event){
      var person = $($(event.$el[0]).children()[0]).html();    
      var memberModel = this.collection.where({person:person})[0];
      var newDisplay = !memberModel.get('display');
      memberModel.set('display',newDisplay);
    }
  },

  initialize: function(){
    this.on('childView:removeMember',function(childView,msg){
    });
  }
});
