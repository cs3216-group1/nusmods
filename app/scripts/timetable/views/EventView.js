'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var tableRowTemplate = require('../templates/table_row.hbs');
var template = require('../templates/event.hbs');
var tooltipTemplate = require('../templates/tooltip.hbs');
require('jquery-ui-touch-punch');
require('jquery-ui/draggable');
require('jquery-ui/droppable');

var EventView = Marionette.ItemView.extend({
  className: 'lesson',
  template: template,
  tooltipTemplate: tooltipTemplate,
  tableRow: $(tableRowTemplate()),

  modelEvents: {
    'change:display': function (model, display) {
      if (display) {
        this.attach();
      } else {
        this.remove();
      }
    }
  },

  initialize: function(options) {
    this.options = options;

    _.bindAll(this, 'drop', 'out', 'over', 'revert', 'start', 'skip');
    this.$el.data('lessonView', this);
  },

  onRender: function() {
    this.$el.addClass('color' + this.model.get('color'));
    this.$el.qtip({
      content: this.tooltipTemplate(this.model.toJSON()),
      position: {
        my: 'left center',
        at: 'right center'
      },
      show: {
        effect: function() {
          $(this).fadeTo(200, 0.85);
        }
      }
    });
    // if (this.options.droppables) {
    //   this.$el.droppable({
    //     activeClass: 'active',
    //     addClasses: false,
    //     hoverClass: 'hover',
    //     drop: this.drop,
    //     over: this.over,
    //     out: this.out
    //   });
    // } else if (this.model.get('isDraggable')) {
    //   this.$el.draggable({
    //     addClasses: false,
    //     appendTo: '#timetable-wrapper',
    //     cursor: 'move',
    //     helper: function() {
    //       return $(this).clone()
    //         .width($(this).outerWidth())
    //         .height($(this).outerHeight());
    //     },
    //     opacity: 0.4,
    //     revert: this.revert,
    //     start: this.start,
    //     zIndex: 3
    //   });
    // }
    if (this.model.get('display')) {
      this.attach();
    }
    return this;
  },

  attach: function() {
    this.$el.dblclick(this.skip);
    if (this.model.get('skipped')) {
      this.$el.fadeTo('slow', 0.2);
    }
    if (this.model.get('DayAbbrev') === 'sat') {
      this.options.parentView.$('#sat').show();
    }
    var rows = this.options.parentView.$('#' + this.model.get('DayAbbrev') + ' > tr');
    for (var i = 0; i <= rows.length; i++) {
      var row = rows[i];
      if (i === rows.length) {
        row = this.tableRow.clone()
          .appendTo(this.options.parentView.$('#' + this.model.get('DayAbbrev')));
        $(rows[0]).children().first().attr('rowspan', i + 1);
      }
      var startTime = this.model.get('StartTime');
      var tdStart = $(row).children('.h' + startTime.slice(0, 2) +
        '.m' + startTime.slice(2) + ':empty');

      if (tdStart.length) {
        var endTime = this.model.get('EndTime');
        var tdAfterEnd = tdStart.nextAll('.h' + endTime.slice(0, 2) +
          '.m' + endTime.slice(2));
        // 0000 EndTime has never been seen but just in case.
        if (tdAfterEnd.length || endTime === '0000') {
          this.detached = tdStart.nextUntil(tdAfterEnd, 'td:empty');
          if (this.detached.length === this.model.get('Duration') - 1) {
            tdStart.attr('colspan', this.model.get('Duration')).html(this.$el);
            this.detached.detach();
            break;
          }
        }
      }
    }
  },

  out: function() {
    this.$el.qtip('hide');
    var group = this.model.get('ClassNo');
    _.each(this.options.droppables, function(lessonView) {
      if (lessonView.model.get('ClassNo') === group) {
        lessonView.$el.removeClass('hover');
      }
    });
  },

  over: function() {
    this.$el.qtip('show');
    var group = this.model.get('ClassNo');
    _.each(this.options.droppables, function(lessonView) {
      if (lessonView.model.get('ClassNo') === group) {
        lessonView.$el.addClass('hover');
      }
    });
  },

  drop: function() {
    this.$el.qtip('hide');
    _.each(this.options.droppables, function(lessonView) {
      lessonView.remove();
    });
    this.options.timetable.remove(this.options.timetable.where({
      ModuleCode: this.model.get('ModuleCode'),
      LessonType: this.model.get('LessonType')
    }));
    this.model.get('sameGroup').each(function(lesson) {
      this.options.timetable.add(lesson);
    }, this);
    this.options.timetable.trigger('change');
  },

  revert: function(droppable) {
    $('body').css('cursor', 'auto');
    if (droppable) {
      return false;
    } else {
      _.each(this.options.droppables, function(lessonView) {
        lessonView.remove();
      });
      return true;
    }
  },

  start: function() {
    if (this.model.get('skipped')) {
      this.skip();
    }
    var group = this.model.get('ClassNo');
    this.options.droppables = [];
    this.model.get('sameType').each(function(lesson) {
      if (lesson.get('ClassNo') !== group) {
        this.options.droppables.push((new LessonView({
          model: lesson,
          droppables: this.options.droppables,
          parentView: this.options.parentView,
          timetable: this.options.timetable
        })).render());
      }
    }, this);
  },

  skip: function() {
    var value = this.model.pick('ModuleCode', 'LessonType', 'ClassNo', 'DayText', 'StartTime');
    if (this.model.get('skipped')) {
      this.$el.fadeTo('slow', 1);
      var filter = _.matches(value);
      for (var key in this.options.skippedLessons) {
        if (this.options.skippedLessons.hasOwnProperty(key) && filter(this.options.skippedLessons[key])) {
          delete this.options.skippedLessons[key];
        }
      }
    } else {
      this.$el.fadeTo('slow', 0.2);
      var newKey = 0;
      _.each(this.options.skippedLessons, function (value, key, list) {
        newKey = Math.max(newKey, key);
      }, this);
      ++newKey;
      this.options.skippedLessons[newKey] = value;
    }
    this.model.set('skipped', !this.model.get('skipped'));
    this.options.timetable.trigger('skip');
  },

  remove: function(detach) {
    var skippedChanged = !_.every(this.options.skippedLessons, function (value, key, list) {
      return (this.options.timetable.where(value).length != 0);
    }, this);
    if (skippedChanged) {
      if (this.model.get('skipped')) {
        this.skip();
      }
    }
    var tr = this.$el.parent()
      .removeAttr('colspan')
      .after(this.detached)
      .parent();
    if (detach) {
      this.$el.detach();
    } else {
      this.$el.remove();
      tr.nextAll().find('.lesson').each(function() {
        $(this).data('lessonView').remove(true).attach();
      });
    }
    if (!tr.find('.lesson').length && tr.index() > 1) {
      tr.remove();
    }
    return this;
  }

});

module.exports = EventView;
