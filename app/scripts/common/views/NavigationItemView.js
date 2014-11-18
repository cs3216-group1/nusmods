'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/navigation_item.hbs');
var logoutTemplate = require('../templates/logout_item.hbs');
var loginTemplate = require('../templates/login_item.hbs');

module.exports = Marionette.ItemView.extend({
  tagName: 'li',
  template: template,

  modelEvents: {
    'selected deselected': 'render'
  },

  initialize: function () {
    if (this.model.get('url') === 'logout') {
      this.template = logoutTemplate;
      this.$el.attr('class', 'dropdown');
      var displayedName = this.model.get('name');
      if (displayedName.length > 18) {
        displayedName = displayedName.substring(0,15) + '...';
      }
      this.model.set('displayedName', displayedName);
    }
    if (this.model.get('url') === 'login') {
      this.template = loginTemplate;
    }
  },

  onRender: function () {
    this.$el.toggleClass('active', this.model.selected);
  }

});
