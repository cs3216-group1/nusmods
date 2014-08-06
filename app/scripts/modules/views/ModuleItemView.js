'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var analytics = require('../../analytics');
var template = require('../templates/module_item.hbs');

module.exports = Marionette.ItemView.extend({
  className: 'module-item',
  template: template,

  events: {
    'click .add-timetable': function(event) {
      var qtipContent;
      var currentTarget = $(event.currentTarget);
      var semester = currentTarget.data('semester');
      analytics.track('Timetable', 'Add module', 'From module finder', semester);
      if (App.request('isModuleSelected', semester, this.model.id)) {
        qtipContent = 'Already added!';
      } else {
        qtipContent = 'Added!';
        App.request('addModule', semester, this.model.id);
      }
      currentTarget.qtip({
        content: qtipContent,
        show: {
          event: false,
          ready: true
        },
        hide: {
          event: false,
          inactive: 1000
        }
      });
      return false;
    },
    'click .add-bookmark': function(event) {
      analytics.track('Bookmarks', 'Add bookmark', 'From module finder');
      App.request('addBookmark', this.model.id);
      $(event.currentTarget).qtip({
        content: 'Bookmarked!',
        show: {
          event: false,
          ready: true
        }
      });
    }
  }
});
