'use strict';

var $ = require('jquery');
var App = require('../../app');
var Backbone = require('backbone');
var Mousetrap = require('Mousetrap');
var NUSMods = require('../../nusmods');
var SelectView = require('./SelectView');
var BookmarksView = require('./BookmarksView');
var _ = require('underscore');
var analytics = require('../../analytics');
var attachFastClick = require('fastclick');
var config = require('../../common/config');
var queryDB = require('../utils/queryDB');
var login = require('../../login');
var ivleTool = require('../utils/ivleTool');

// var corsify = require('../../cors/corsify');
var themePicker = require('../themes/themePicker');
require('bootstrap/alert');
require('qTip2');
require('../jquery.spotlight.js');

var preferencesNamespace = config.namespaces.preferences + ':';
var ivleNamespace = config.namespaces.ivle + ':';
var bookmarkedModulesNamespace = config.namespaces.bookmarkedModules + ':';


module.exports = Backbone.View.extend({
  el: 'body',

  events: {
    'click a[href]:not([data-bypass])': 'hijackLinks',
    'click a[href="login"]': 'cloudLogin',
    'click a[href="logout"]': 'cloudLogout',
    'click a[href="sync"]': 'syncWithIvle'
  },

  hijackLinks: function (event) {
    /* jshint maxlen: 140 */
    // Ref: https://github.com/backbone-boilerplate/backbone-boilerplate/blob/85723839dbab6787d69eedcbbea05e1d59960eff/app/app.js#L52

    // Do not hijack if modifier key was pressed when the event fired.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }

    // Get the absolute anchor href.
    var $link = $(event.currentTarget);
    var href = { prop: $link.prop('href'), attr: $link.attr('href') };
    // Get the absolute root.
    var root = location.protocol + '//' + location.host + '/';

    // Ensure the root is part of the anchor href, meaning it's relative.
    if (href.prop.slice(0, root.length) === root) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      event.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events. The Router's internal `navigate` method
      // calls this anyways.  The fragment is sliced from the root.
      this.navigateWithScrollTop(href.attr, true);
    }
  },

  initialize: function () {
    $.ajaxSetup({
      cache: true
    });

    // [Override](http://craigsworks.com/projects/qtip2/tutorials/advanced/#override)
    // default tooltip settings.
    $.fn.qtip.defaults.position.my = 'bottom center';
    $.fn.qtip.defaults.position.at = 'top center';
    $.fn.qtip.defaults.position.viewport = true;
    $.fn.qtip.defaults.show.solo = true;
    $.fn.qtip.defaults.style.classes = 'qtip-bootstrap';

    NUSMods.getLastModified().then(function (lastModified) {
      $('#correct-as-at').text((new Date(lastModified)).toString().slice(0, 21));
    });

    // function activateCORS() {
    //   $('.cors-round-text').html(corsify.determineRound(Date.now()));
    //   $('.cors-round-container').addClass('animated bounceInUp shown').alert();
    // }

    // activateCORS();

    App.selectRegion.show(new SelectView());

    $('.container').removeClass('hidden');

    Mousetrap.bind('/', function(ev) {
      analytics.track('Search', 'Keyboard', 'Main Search');
      $('#s2id_autogen2').focus();
      ev.preventDefault();
      return false;
    });

    var keyboardNavigationMappings = {
      t: '/timetable',
      m: '/modules',
      p: '/preferences',
      '?': '/help'
    };

    var that = this;
    
    _.each(keyboardNavigationMappings, function (value, key) {
      Mousetrap.bind(key, function () {
        analytics.track('Navigation', 'Keyboard', value.slice(1));
        that.navigateWithScrollTop(value, true);
      });
    });

    var modulePageRegex = /^\/modules\/[^\/]{6,10}/;

    var keyboardAnchorMappings = {
      c: '#cors',
      s: '#schedule',
      e: '#prerequisites',
      r: '#reviews'
    };

    _.each(keyboardAnchorMappings, function (value, key) {
      Mousetrap.bind(key, function () {
        var section = value.slice(1);
        analytics.track('Module ' + section, 'Visit - Keyboard', section);
        if (modulePageRegex.test(window.location.pathname)) {
          location.hash = value;
        }
      });
    });
    
    Mousetrap.bind(['x'], function () {
      var newMode = themePicker.toggleMode();
      analytics.track('event', 'Mode', 'Change mode using keyboard', newMode);
      if (modulePageRegex.test(window.location.pathname) && window.DISQUS) {
        window.DISQUS.reset({
          reload: true,
          config: function () {
            /* jshint camelcase: false */
            this.page.identifier = window.disqus_identifier;
            this.page.title = window.disqus_title;
            this.page.url = window.disqus_url;
          }
        });
      }
    });

    Mousetrap.bind(['left', 'right'], function (e) {
      var newTheme = themePicker.selectNextTheme(e.keyCode === 37 ? 'Left' : 'Right');
      analytics.track('Theme', 'Change theme using keyboard', newTheme, e.keyCode === 37 ? 1 : 0);
      return false;
    });

    $('.nm-bookmark-button').qtip({
      content: '<div class="nm-bookmarks"></div>',
      hide: {
        fixed: true,
        delay: 300
      },
      events: {
        show: function() {
          analytics.track('Bookmarks', 'Display bookmark');
          App.request('getBookmarks', function (modules) {
            var modulesList = [];
            _.each(modules, function (module) {
              modulesList.push({'module': module});
            });
            var bookmarksCollection = new Backbone.Collection(modulesList);
            var bookmarksView = new BookmarksView({collection: bookmarksCollection});
            App.bookmarksRegion.show(bookmarksView);
          });
        }
      }
    });

    attachFastClick(document.body);
  },

  navigateWithScrollTop: function (location, trigger) {
    Backbone.history.navigate(location, {trigger: trigger});
    // Hack: Scroll to top of page after navigation
    setTimeout(function () {
      window.scrollTo(0, 0);
    }, 0);
  },

  navigateAway: function () {
    window.location.search = '';
    Promise.all(App.request('loadUserModules',true)).then(function () {
      Backbone.history.navigate('timetable', {trigger: true, replace: true});
    });
  },

  syncWithIvle: function (event) {
    var that = this;
    var url = '/ivle/Timetable_Student?AcadYear=' + config.academicYear + '&Semester=' + config.semester;
    sdk.get(url, function (ivleRes) {
      ivleRes = JSON.parse(ivleRes).ivleResponse.Results;
      ivleTool.generateNusmodsLink(ivleRes, function (err, result) {
        var key = config.semTimetableFragment(config.semester) + ':queryString';
        queryDB.setItemToDB(key, result, function () {
          that.navigateAway();
        });
      });
    });
  },

  cloudLogin: function () {
    var that = this;
    sdk.login(function () {
      queryDB.getItemFromDB(bookmarkedModulesNamespace);
      queryDB.getItemFromDB(preferencesNamespace + 'notNewUser', function (response) {
        if (response) {
          that.navigateAway();
        } else {
          queryDB.setItemToDB(preferencesNamespace + 'notNewUser', true);
          that.syncWithIvle(false);
        }
      });

    });
  },

  cloudLogout: function () {
    // queryDB.setItemToDB(preferencesNamespace + 'notNewUser', false);
    var that = this;
    sdk.logout(function () {
      that.navigateAway();
      login();
    });
  }
});
