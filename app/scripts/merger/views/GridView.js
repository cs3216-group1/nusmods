'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var tableRowTemplate = require('../templates/table_row.hbs');
var template = require('../templates/lesson.hbs');
var tooltipTemplate = require('../templates/tooltip.hbs');
require('jquery-ui-touch-punch');
require('jquery-ui/draggable');
require('jquery-ui/droppable');

var GridView = Marionette.ItemView.extend({
  className: 'grid',
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
    this.currentClashColor = 'color' + this.model.clashColor();
    this.model.on('change',this.GridModelChanged,this);
    // _.bindAll(this, 'drop', 'out', 'over', 'revert', 'start');
    // this.$el.data('lessonView', this);
  },

  onRender: function() {
    var nextClashColor = 'color' + this.model.clashColor();

    if(nextClashColor !== this.currentClashColor){
      this.$el.removeClass(this.currentClashColor);
      this.currentClashColor = nextClashColor;
    }
    this.$el.addClass(nextClashColor);

    // if (this.model.get('isDraggable')) {
    //   this.$el.addClass('ui-draggable');
    // }
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
    // if (this.model.get('display')) {
      this.attach();
    // }

    return this;
  },

  attach: function() {
    if (this.model.get('GridID').slice(0,3) === 'sat') {
      this.options.parentView.$('#sat').show();
    }
    var rows = this.options.parentView.$('#' + this.model.get('GridID').slice(0,3) + ' > tr');

    for (var i = 0; i <= rows.length; i++) {
      var row = rows[i];
      // if (i === rows.length) {
      //   row = this.tableRow.clone()
      //     .appendTo(this.options.parentView.$('#' + this.model.get('dayAbbrev')));
      //   $(rows[0]).children().first().attr('rowspan', i + 1);
      // }
      var index = this.model.get('GridID').slice(3);
      var hourIndex = Math.floor(index/2) + 8;
      hourIndex = (Math.floor(hourIndex/10) != 0)? hourIndex: '0' + hourIndex;

      var minuteIndex = ((index - 2 * Math.floor(index/2)) == 1)? '30':'00';

      var tdStart = $(row).children('.h' + hourIndex +
        '.m' + minuteIndex + ':empty');
      if (tdStart.length) {
        // var endTime = this.model.get('EndTime');
        // var tdAfterEnd = tdStart.nextAll('.h' + endTime.slice(0, 2) +
        //   '.m' + endTime.slice(2));
        // 0000 EndTime has never been seen but just in case.
        // if (tdAfterEnd.length || endTime === '0000') {
          // this.detached = tdStart.nextUntil(tdAfterEnd, 'td:empty');
          // if (this.detached.length === this.model.get('duration') - 1) {
            // tdStart.attr('colspan', this.model.get('duration')).html(this.$el);
            // this.detached.detach();
            tdStart.html(this.$el);
            break;
      }
    }
  },

  GridModelChanged: function(){

    var nextClashColor = 'color' + this.model.clashColor();

    if(nextClashColor !== this.currentClashColor){
      this.$el.removeClass(this.currentClashColor);
      this.currentClashColor = nextClashColor;
    }
    this.$el.addClass(nextClashColor);
    console.log('GridModelChanged');
    console.log(this.model.toJSON());
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
  }

});

module.exports = GridView;
