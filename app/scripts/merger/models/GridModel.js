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
			var message = numOfClash + ' cannot make it';

			if(numOfClash === 1){
				var persons = _.map(this.GridInfo,function(value){
					return _.map(value, function(v,k){
						return k;	
					})	
				},this);

				return {message: persons[0] + ' cannot make it'};
				
			}

			// var persons = _.map(this.GridInfo,function(value){
			// 	_.map(value, function(v,k){
			// 		return k;	
			// 	})	
			// },this);

			// persons = _.uniq(persons);
			// var personString = '';

			// if(numOfClash <= 3){
			// 	_.each(persons,function(person){
			// 		personString += person + ', ';
			// 	});

			// 	personString = personString.substring(0,personString.length - 2);
			// }else{
			// 	_.each(_.range(3),function(index){
			// 		personString += persons[index] + ', ';
			// 	},persons);

			// 	personString = personString.substring(0,personString.length - 2);
			// 	personString += '...';
			// }

			return {
				message: message
				// persons: personString
			}
		}
	}

});