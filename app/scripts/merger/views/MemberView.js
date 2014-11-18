'use strict';

var App = require('../../app');
var Marionette = require('backbone.marionette');
var template = require('../templates/member.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'tr',
  template: template,

  events: {
    'click .remove': function (event) {
      event.preventDefault();

      this.trigger('remove:member');
    },
    'click .show-hide': function (event) {
      event.preventDefault();
      this.trigger('toggle:display');
    }
  },

  modelEvents: {
    change: 'render'
  },

  onRender: function () {
    this.$el.addClass('color' + this.model.get('color'));
    console.log(this.$el);
    console.log(this.model);
  }
});
