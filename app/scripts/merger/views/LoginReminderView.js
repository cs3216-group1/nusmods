'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/LoginRemind.hbs');

module.exports = Marionette.ItemView.extend({
  template: template,

  events: {
    'click .remind-login': 'onClickReplace'
  },

  onClickReplace: function () {
    // this.collection.shared = false;
    // this.collection.timetable.trigger('change');
    // this.destroy();
  }
});
