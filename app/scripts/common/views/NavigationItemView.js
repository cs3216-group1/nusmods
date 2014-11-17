'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/navigation_item.hbs');
var authTemplate = require('../templates/auth_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,

  modelEvents: {
    'selected deselected': 'render'
  },

  initialize: function () {
    if (this.model.get('url') === 'logout') {
     this.template = authTemplate;
     this.$el.attr('class', 'dropdown');
    }
  },

  onRender: function () {
    this.$el.toggleClass('active', this.model.selected);
  }

});
