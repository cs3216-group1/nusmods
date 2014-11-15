'use strict';

var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  initialize: function () {
  	this.person = this.get("person");
  	this.timetableString = this.get("timetableString");
  	this.display = this.get("display");  
  }
});
