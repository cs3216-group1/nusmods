'use strict';

var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
//var localforage = require('localforage');
var template = require('../templates/chatroom.hbs');
//var themePicker = require('../../common/themes/themePicker');
var config = require('../../common/config');


module.exports = Marionette.LayoutView.extend({
  template: template,
  // ui: {
  //   faculty: '#faculty',
  //   student: 'input:radio[name="student-radios"]',
  //   mode: 'input:radio[name="mode-radios"]',
  //   theme: '#theme-options'
  // },
  initialize: function () {
    // // TODO: Populate default values of form elements for first time users.
    // _.each(this.ui, function (selector, item) {
    //   localforage.getItem(preferencesNamespace + item, function (value) {
    //     if (value) {
    //       $(selector).val([value]);
    //     }
    //   });
    // });

    // localforage.getItem(ivleNamespace + 'ivleModuleHistory', function (value) {
    //   if (value) {
    //     $('#ivle-status-success').removeClass('hidden');
    //   }
    // });

    // this.ivleDialog = null;
  },

});
