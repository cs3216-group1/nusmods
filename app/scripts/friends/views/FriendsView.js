'use strict';

var Marionette = require('backbone.marionette');
var template = require('../templates/friends.hbs');

module.exports = Marionette.LayoutView.extend({
  template: template
});
