'use strict';

var $ = require('jquery');
var MemberView = require('./MemberView');
var Marionette = require('backbone.marionette');
var template = require('../templates/legends.hbs');
var _ = require('underscore');

module.exports = Marionette.CompositeView.extend({
  tagName: 'table',
  className: 'table table-bordered',
  childView: MemberView,
  childViewContainer: 'tbody',
  template: template,
  childViewOptions: function () {
    return {
      parentView: this,
    };
  },
  initialize: function(){

  }
});
