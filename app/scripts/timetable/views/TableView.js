'use strict';

var $ = require('jquery');
var LessonView = require('./LessonView');
var EventView = require('./EventView');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var template = require('../templates/table.hbs');
var AddEventModal = require('../templates/add_event_modal.hbs');

module.exports = Marionette.CompositeView.extend({
  id: 'timetable',
  tagName: 'table',
  // childView: LessonView,
  childViewOptions: function () {
    return {
      parentView: this,
      timetable: this.collection,
      skippedLessons: this.options.skippedLessons
    };
  },
  template: template,

  events: {
    'mousemove': 'mouseMove',
    'mouseleave': 'mouseLeave'
  },

  ui: {
    colgroups: 'colgroup',
    'addEvent': 'tbody tr td'
  },

  initialize: function(){
    this.$el.on('dblclick','tbody tr td',function(element){

      var tbodyID = $(this.parentElement.parentElement).attr('id');
      var tdID = $(this).attr('class');
    });
  },

  getChildView: function(item){
    if(item.get('ViewType') === 'lesson'){
      return LessonView;
    }else if(item.get('ViewType') === 'event'){
      return EventView;
    }
   
  },

  mouseMove: function(evt) {
    if (!this.colX) {
      this.colX = this.$('#times > th + th')
        .map(function() { return $(this).offset().left; })
        .get();
    }

    var currCol = this.ui.colgroups.eq(_.sortedIndex(this.colX, evt.pageX));
    if (!currCol.is(this.prevCol)) {
      if (this.prevCol) {
        this.prevCol.removeAttr('class');
      }
      currCol.addClass('hover');
      this.prevCol = currCol;
    }
  },

  mouseLeave: function() {
    if (this.prevCol) {
      this.prevCol.removeAttr('class');
      this.prevCol = false;
    }
  },

  attachBuffer: function () {
  },

  attachHtml: function () {
  }
});
