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
			var message = numOfClash + ' not available';

			var persons = _.map(this.GridInfo,function(value){
					return _.map(value, function(v,k){
						return k;	
					})	
				},this);

			if(numOfClash === 1){
				return {message: persons[0] + '\n' + ' not available'};
			}else if(numOfClash === 2){
				return {message: persons[0] + '\n' + persons[1] + '\n' + ' not available'};
			}else if (numOfClash ===3){
				return {message: persons[0] + '\n' + persons[1] + '\n' + persons[2] + '\n' + ' not available'}; 
			}else{
				return {message: persons[0] + '\n' + persons[1] + '\n' + persons[2] + '\n and other' + (persons - 3) + '\n' + ' not available'}; 
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