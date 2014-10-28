'use strict';

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  initialize: function() {
    // _.extend(this, new Backbone.Picky.Selectable(this));
    // this.selected = false;

    console.log("An Event is Initialized");
  }
});
