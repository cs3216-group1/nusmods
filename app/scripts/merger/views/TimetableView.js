'use strict';

var App = require('../../app');
var Backbone = require('backbone');
var MembersView = require('./MembersView');
var ExportView = require('./ExportView');
var Marionette = require('backbone.marionette');
var SelectView = require('./SelectView');
var SemesterSelectorView = require('./SemesterSelectorView');
//var SharedTimetableControlsView = require('./SharedTimetableControlsView');
var ShowHideView = require('./ShowHideView');
var MergerTimetableView = require('./MergerTableView');
var TipsView = require('./TipsView');
var _ = require('underscore');
var LegendsView = require('./LegendsView');

//var UrlSharingView = require('./UrlSharingView');
var config = require('../../common/config');
var template = require('../templates/timetable.hbs');
var tips = require('../tips.json');

module.exports = Marionette.LayoutView.extend({
  template: template,

  regions: {
    membersRegion: '#exam-timetable',
    legendsRegion: '#merger-legends',
    exportRegion: '.export-region',
    selectRegion: '.select-region',
    semesterSelectorRegion: '.semester-selector-region',
    sharedTimetableControlsRegion: '.shared-timetable-controls-region',
    showHideRegion: '.show-hide-region',
    timetableRegion: '#timetable-wrapper',
    urlSharingRegion: '.url-sharing-region'
  },

  initialize: function (options) {
    this.academicYear = options.academicYear;
    this.semester = options.semester;
    this.gridCollection = options.gridCollection;
    this.memberCollection = options.memberCollection;
  },

  onShow: function() {
    this.selectedModules = App.request('selectedModules', this.semester);
    this.timetable = this.selectedModules.timetable;

    this.listenTo(this.selectedModules, 'add remove', this.modulesChanged);
    this.listenTo(this.timetable, 'change', this.modulesChanged);

    this.membersRegion.show(new MembersView({collection: this.memberCollection}));
    this.exportRegion.show(new ExportView({
      academicYear: this.academicYear,
      collection: this.selectedModules,
      exams: this.selectedModules.exams,
      semester: this.semester
    }));

    var selectView = new SelectView({
      semester: this.semester,
      members: this.memberCollection
    });

    selectView.on('superview:addMember',function(value){
      this.memberCollection.add(_.extend(value,{display: true}));
    },this);
    this.selectRegion.show(selectView);
    // if (this.selectedModules.shared) {
    //   this.sharedTimetableControlsRegion.show(new SharedTimetableControlsView({
    //     collection: this.selectedModules
    //   }));
    // }
    this.semesterSelectorRegion.show(new SemesterSelectorView({
      semester: this.semester
    }));
    this.showHideRegion.show(new ShowHideView());
    this.timetableRegion.show(new MergerTimetableView({collection: this.gridCollection}));
    // this.legendsRegion.show(new LegendsView());
    var tipsModel = new Backbone.Model({tips: tips});
    // this.tipsRegion.show(new TipsView({model: tipsModel}));

    // this.urlSharingRegion.show(new UrlSharingView({
    //   collection: this.selectedModules
    // }));
    // this.modulesChanged(null, null, {replace: true});

    // this.legendsRegion.show('slow/400/fast', function() {
      
    // });

  },

  modulesChanged: function (model, collection, options) {
    if (this.selectedModules.length) {
      Backbone.history.navigate(config.semTimetableFragment(this.semester) +
        '?' + this.selectedModules.toQueryString(), options);
    } else {
      Backbone.history.navigate(config.semTimetableFragment(this.semester), options);
    }
  }
});
