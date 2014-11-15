'use strict';

var Backbone = require('backbone');
var _ = require('underscore');
var Grid = require('../models/GridModel');

var dayAbbrevs = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat'
];

module.exports = Backbone.Collection.extend({
  model: Grid,
  initialize:function(){
  	_.each(dayAbbrevs,function(dayAbbrev){
  		_.each(_.range(0,32),function(index){
  			var GridID = dayAbbrev + index;
  			var grid = new Grid({GridID: GridID});
  			this.add(grid)
  		},this);
  	},this);
  },

  emptyGrids:function(){

    // _.each(dayAbbrevs,function(dayAbbrev){
    //   _.each(_.range(0,32),function(index){
    //     var GridID = dayAbbrev + index;
    //     var grid = this.get(GridID);
    //     grid.emptyGrid();
    //   },this);
    // },this);

    this.forEach(function(grid){
      grid.emptyGrid();
    })
  }
});
