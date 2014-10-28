'use strict';

var Backbone = require('backbone');
var Event = require('../models/EventModel');
var qs = require('qs');
var _ = require('underscore');

module.exports = Backbone.Collection.extend({
  model: Event,

  initialize: function () {
    this.on('add',this.onAdd, this);
    this.on('remove',this.onRemove,this);
  },

  onAdd: function(event){
  	
  },

  onRemove: function(){

  },

  toQueryString: function(){
  	var qsArray = [];
    this.each(function (event) {
      var eventObject = {title:event.get('Title'),
      					 start: event.get('Start'), 
      					 end: event.get('End'), 
      					 sem: event.get('Semester')};
      qsArray.push(eventObject);
    }, this);
    return qs.stringify({events: qsArray});
  },
},{
	fromQueryStringToJSON: function (queryString) {
	  	return qs.parse(queryString).events;
	}
});
