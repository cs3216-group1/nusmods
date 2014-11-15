'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var _ = require('underscore');
var Member = require('../models/MemberModel');

module.exports = Backbone.Collection.extend({
  model: Member,
  initialize:function(){;
  	// this.mergedMembers = App.request('mergingTimetables');
  	// _.each(this.mergedMembers,function(member){
  	// 	this.add(member);
  	// },this);
  }
});
