'use strict';

var Backbone = require('backbone');
var Marionette = require('backbone.marionette');
var NUSMods = require('./nusmods');
var NavigationCollection = require('./common/collections/NavigationCollection');
var NavigationView = require('./common/views/NavigationView');
var Promise = require('bluebird'); // jshint ignore:line
var SelectedModulesController = require('./common/controllers/SelectedModulesController');
var TimetableModuleCollection = require('./common/collections/TimetableModuleCollection');
var EventCollection = require('./common/collections/EventCollection');
var _ = require('underscore');
var config = require('./common/config');
var localforage = require('localforage');
var queryDB = require('./common/utils/queryDB');
var $ = require('jquery');

require('qTip2');

// Set Backbone.History.initialRoute to allow route handlers to find out if they
// were called from the initial route.
var loadUrl = Backbone.History.prototype.loadUrl;
Backbone.History.prototype.loadUrl = function() {
  if (!Backbone.History.initialRoute) {
    Backbone.History.initialRoute = true;
  } else {
    Backbone.History.initialRoute = false;
    // No longer initial route, restore original loadUrl.
    Backbone.History.prototype.loadUrl = loadUrl;
  }
  return loadUrl.apply(this, arguments);
};

var App = new Marionette.Application();

App.addRegions({
  mainRegion: '.content',
  navigationRegion: 'nav',
  selectRegion: '.navbar-form',
  bookmarksRegion: '.nm-bookmarks'
});

var navigationCollection = new NavigationCollection();
var navigationView = new NavigationView({collection: navigationCollection});
App.navigationRegion.show(navigationView);

App.reqres.setHandler('addNavigationItem', function (navigationItem) {
  return navigationCollection.add(navigationItem);
});

App.reqres.setHandler('removeNavigationItem', function (navigationItem) {
  navigationCollection.remove(navigationCollection.findWhere({ 'url' : navigationItem}));
});

App.reqres.setHandler('findNavigationItem', function (navigationItem) {
  return navigationCollection.findWhere({ 'url' : navigationItem});
});

NUSMods.setConfig(config);

var selectedModulesControllers = [];

for (var i = 0; i < 5; i++) {
  selectedModulesControllers[i] = new SelectedModulesController({
    semester: i + 1
  });
}

App.reqres.setHandler('selectedModules', function (sem) {
  return selectedModulesControllers[sem - 1].selectedModules;
});
App.reqres.setHandler('addModule', function (sem, id, options) {
  return selectedModulesControllers[sem - 1].selectedModules.add({
    ModuleCode: id,
    Semester: sem
  }, options);
});
App.reqres.setHandler('removeModule', function (sem, id) {
  var selectedModules = selectedModulesControllers[sem - 1].selectedModules;
  return selectedModules.remove(selectedModules.get(id));
});
App.reqres.setHandler('isModuleSelected', function (sem, id) {
  return !!selectedModulesControllers[sem - 1].selectedModules.get(id);
});
App.reqres.setHandler('displayLessons', function (sem, id, display) {
  _.each(selectedModulesControllers[sem - 1].timetable.where({
    ModuleCode: id
  }), function (lesson) {
    lesson.set('display', display);
  });
});

App.reqres.setHandler('addEvent', function(sem,event) {
  return selectedModulesControllers[sem - 1].events.add(event);
});

var bookmarkedModulesNamespace = config.namespaces.bookmarkedModules + ':';

App.reqres.setHandler('getBookmarks', function (callback) {
  if (!callback) { 
    return; 
  }
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    callback(modules);
  });
});
App.reqres.setHandler('addBookmark', function (id) {
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    if (!_.contains(modules, id)) {
      modules.push(id);
    }
    queryDB.setItemToDB(bookmarkedModulesNamespace, modules);
  });
});

App.reqres.setHandler('deleteBookmark', function (id) {
  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    var index = modules.indexOf(id);
    if (index > -1) {
      modules.splice(index, 1);
      queryDB.setItemToDB(bookmarkedModulesNamespace, modules);
    }
  });
});

App.reqres.setHandler('loadUserModules',function(){
  console.log('loadd');
  for (var i = 0; i < 5; i++) {
    selectedModulesControllers[i] = new SelectedModulesController({
      semester: i + 1
    });
  }

  return _.map(_.range(1, 5), function(semester) {
    var semTimetableFragment = config.semTimetableFragment(semester);
    var url = semTimetableFragment + ':queryString';

    sdk.getLoginStatus(function(response){
      console.log(response);
      response = JSON.parse(response);
      var status = response['status'];

      if(status === 'connected'){
        return queryDB.getItemFromDB(url,function(savedQueryString){
          if ('/' + semTimetableFragment === window.location.pathname) {
            var queryString = window.location.search.slice(1);
            if (queryString) {
              if (savedQueryString !== queryString) {
                // If initial query string does not match saved query string,
                // timetable is shared.
                App.request('selectedModules', semester).shared = true;
              }
              // If there is a query string for timetable, return so that it will
              // be used instead of saved query string.
              return;
            }
          }
          var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(savedQueryString);

          return Promise.all(_.map(selectedModules, function (module) {
            return App.request('addModule', semester, module.ModuleCode, module);
          }));
        });
      }else{
        return localforage.getItem(semTimetableFragment + ':queryString')
          .then(function (savedQueryString) {
          if ('/' + semTimetableFragment === window.location.pathname) {
            var queryString = window.location.search.slice(1);
            if (queryString) {
              if (savedQueryString !== queryString) {
                // If initial query string does not match saved query string,
                // timetable is shared.
                App.request('selectedModules', semester).shared = true;
              }
              // If there is a query string for timetable, return so that it will
              // be used instead of saved query string.
              return;
            }
          }
          var selectedModules = TimetableModuleCollection.fromQueryStringToJSON(savedQueryString);

          return Promise.all(_.map(selectedModules, function (module) {
            return App.request('addModule', semester, module.ModuleCode, module);
          }));
        });
      }
    });


  });
});

App.on('start', function () {
  var AppView = require('./common/views/AppView');

  new Marionette.AppRouter({
    routes: {
      '*default': function () {
        Backbone.history.navigate('timetable', {trigger: true, replace: true});
      }
    }
  });

  // header modules
  require('./timetable');
  require('./modules');
  // require('ivle');
  require('./merger');
  require('./preferences');

  var login = require('./login');
  login();


  // footer modules
  require('./about');
  require('./help');
  require('./support');

  Promise.all(App.request('loadUserModules').concat([NUSMods.generateModuleCodes()])).then(function () {
    new AppView();

    Backbone.history.start({pushState: true});
  });


  // Promise.all(_.map(_.range(1, 5), function(semester) {
  //   var semTimetableFragment = config.semTimetableFragment(semester);
  //   return localforage.getItem(semTimetableFragment + ':events')
  //     .then(function (savedQueryString) {
  //     // var addedEvents = EventCollection.fromQueryStringToJSON(savedQueryString);
  //     // for testing purpose
  //     var addedEvents = [{Title: "Event Title 1",
  //                         StartTime: "0800",
  //                         EndTime: "1000",
  //                         DayAbbrev: 'wed',
  //                         Venue: 'LT 19',
  //                         Duration: 4
  //                         }];
  //     return Promise.all(_.map(addedEvents, function(event) {
  //       return App.request('addEvent', semester, event);
  //     }));
  //   });
  // }));

  localforage.getItem(bookmarkedModulesNamespace, function (modules) {
    if (!modules) {
      queryDB.setItemToDB(bookmarkedModulesNamespace, []);
    }
  });
});

module.exports = App;
