'use strict';

var App = require('../../app');
var $ = require('jquery');
var Marionette = require('backbone.marionette');
var _ = require('underscore');
var localforage = require('localforage');
var template = require('../templates/preferences.hbs');
var themePicker = require('../../common/themes/themePicker');
var config = require('../../common/config');
var queryDB = require('../../common/utils/queryDB');
var Backbone = require('backbone');

var preferencesNamespace = config.namespaces.preferences + ':';
var ivleNamespace = config.namespaces.ivle + ':';
var bookmarkedModulesNamespace = config.namespaces.bookmarkedModules + ':';

require('../../nuscloud');

module.exports = Marionette.LayoutView.extend({
  template: template,
  ui: {
    faculty: '#faculty',
    student: 'input:radio[name="student-radios"]',
    mode: 'input:radio[name="mode-radios"]',
    theme: '#theme-options'
  },
  initialize: function () {
    // TODO: Populate default values of form elements for first time users.
    _.each(this.ui, function (selector, item) {
      localforage.getItem(preferencesNamespace + item, function (hacky) {
        queryDB.getItemFromDB(preferencesNamespace + item, function (value) {
          if (value) {
            $(selector).val([value]);
          }
        });
      });
      queryDB.getItemFromDB(preferencesNamespace + item, function (value) {
        if (value) {
          $(selector).val([value]);
        }
      });
    });

    queryDB.getItemFromDB(ivleNamespace + 'ivleModuleHistory', function (value) {
      if (value) {
        $('#ivle-status-success').removeClass('hidden');
      }
    });

    this.ivleDialog = null;
  },
  events: {
    'click .random-theme': 'randomTheme',
    'change @ui.faculty, @ui.student, @ui.mode, @ui.theme': 'updatePreference',
    'keydown': 'toggleTheme',
    'click .connect-ivle': 'connectIvle',
    'click .login-button': 'cloudLogin',
    'click .logout-button': 'cloudLogout'
  },
  connectIvle: function () {
    var that = this;
    if (that.ivleDialog === null || that.ivleDialog.closed) {
      var w = 255,
          h = 210,
          left = (screen.width / 2) - (w / 2),
          top = (screen.height / 3) - (h / 2);
      var options = 'dependent, toolbar=no, location=no, directories=no, ' +
                    'status=no, menubar=no, scrollbars=no, resizable=no, ' +
                    'copyhistory=no, width=' + w + ', height=' + h +
                    ', top=' + top + ', left=' + left;

      window.ivleLoginSuccessful = function (token) {
        $('#ivle-status-success').addClass('hidden');
        $('#ivle-status-loading').removeClass('hidden');
        queryDB.setItemToDB(ivleNamespace + 'ivleToken', token);
        that.fetchModuleHistory(token);
        window.ivleLoginSuccessful = undefined;
      };

      var callbackUrl = window.location.protocol + '//' + window.location.host + '/ivlelogin.html';
      var popUpUrl = 'https://ivle.nus.edu.sg/api/login/?apikey=APILoadTest&url=' + callbackUrl;
      that.ivleDialog = window.open(popUpUrl, '', options);
    }
    else {
      that.ivleDialog.focus();
    }
  },
  fetchModuleHistory: function (ivleToken) {
    var that = this;
    $.get(
      'https://ivle.nus.edu.sg/api/Lapi.svc/UserID_Get',
      {
        'APIKey': 'APILoadTest',
        'Token': ivleToken
      },
      function (studentId) {
        $.get(
          'https://ivle.nus.edu.sg/api/Lapi.svc/Modules_Taken',
          {
            'APIKey': 'APILoadTest',
            'AuthToken': ivleToken,
            'StudentID': studentId
          },
          function (data) { that.saveModuleHistory(data); },
          'jsonp'
        );
      },
      'jsonp'
    );
  },
  saveModuleHistory: function (moduleHistory) {
    queryDB.setItemToDB(ivleNamespace + 'ivleModuleHistory', moduleHistory.Results);
    $('#ivle-status-success').removeClass('hidden');
    $('#ivle-status-loading').addClass('hidden');
  },
  randomTheme: function () {
    themePicker.selectRandomTheme();
  },
  updatePreference: function ($ev) {
    var $target = $($ev.target);
    $target.blur();
    var property = $target.attr('data-pref-type');
    var value = $target.val();
    this.savePreference(property, value);
  },
  savePreference: function (property, value) {
    if (property === 'faculty' && value === 'default') {
      window.alert('You have to select a faculty.');
      localforage.getItem(preferencesNamespace + property, function (value) {
        $('#faculty').val(value);
      });
      return;
    }
    queryDB.setItemToDB(preferencesNamespace + property, value);
    if (property === 'theme') {
      themePicker.applyTheme(value);
    } else if (property === 'mode') {
      themePicker.toggleMode();
    }
  },
  cloudLogin: function () {
    sdk.login(function () {
      _.each(config.defaultPreferences, function (value, key, list) {
        queryDB.getItemFromDB(preferencesNamespace + key);
      }, this);
      _.each(_.range(1, 5), function(semester) {
        queryDB.getItemFromDB(config.semTimetableFragment(semester) + ':skippedLessons');
        queryDB.getItemFromDB(config.semTimetableFragment(semester) + ':queryString');
      }, this);
      queryDB.getItemFromDB(bookmarkedModulesNamespace);

      Promise.all(App.request('loadUserModules',true)).then(function () {
        Backbone.history.navigate('timetable', {trigger: true, replace: true});
      });
    });
  },
  cloudLogout: function () {
    sdk.logout(function () {
      Promise.all(App.request('loadUserModules',true)).then(function () {
        Backbone.history.navigate('timetable', {trigger: true, replace: true});
      });
    });
  }
});
