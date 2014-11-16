'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var _ = require('underscore');
var Member = require('../models/MemberModel');
var config = require('../../common/config');
var queryDB = require('../../common/utils/queryDB');


module.exports = Backbone.Collection.extend({
  model: Member,
  initialize:function(){;
  	var semTimetableFragment = config.semTimetableFragment();
    var url = semTimetableFragment + ':queryString';

    var self = this;
    queryDB.getItemFromDB('',function(timetableString){  
    	console.log('hey, we are trying to get item');
    });
  }
});
