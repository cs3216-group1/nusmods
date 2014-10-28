'use strict';

var Backbone = require('backbone');
var Event = require('../models/EventModel');

module.exports = Backbone.Collection.extend({
  model: Event
});
