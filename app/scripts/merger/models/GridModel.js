'use strict';

var Backbone = require('backbone');
var _ = require('underscore');



module.exports = Backbone.Model.extend({
	idAttribute: 'GridID',
	initialize:function(){
		this.GridID = this.get("GridID");
		this.GridInfo = [];
	},

	addInfo:function(info){
		this.GridInfo.push(info);
		this.trigger('change');
	},

	numOfClash: function(){
		return this.GridInfo.length;
	},

	clashColor: function(){
		var numOfClash = this.numOfClash();
		if(numOfClash == 0){
			return 2;
		}else if(numOfClash == 1){
			return 1;
		}else{
			return 0;
		}
	},

	emptyGrid: function(){	
		if(this.GridInfo.length){
			this.GridInfo = [];
			this.trigger('change');
		}
	},

	toJSON: function(){
		var numOfClash = this.numOfClash();
		if(numOfClash === 0){
			return {
				message: 'Free Slots!'
			};
		}else{
			var persons = _.map(this.GridInfo,function(value){
					return {name: _.map(value, function(v,k){
						return k;	
					})};	
				},this);

			// if(numOfClash === 1){
			// 	return {persons:persons};
			// }else if(numOfClash === 2){
			// 	return {persons:persons};
			// }else if (numOfClash ===3){
			// 	return {persons:persons}; 
			// }else{
			// 	return {persons:persons}; 
			// }
			return {persons: persons};
		}
	}

});