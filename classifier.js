var nodesvm = require('node-svm');
var fs = require('fs');
var so = require('stringify-object');

// Builds the classification model
// uses the multiclass mechanism of libsvm
exports.buildSVM = function(trainingSet, callback){

	console.log('Building SVM');

	// Get the parameters correct
	// using cross-fold classification
	var svm = new nodesvm.CSVC({
		C: [0.03125, 0.125, 0.5, 2, 8],
		// kernels parameters
		kernelType: 'RBF',  
		gamma: [0.03125, 0.125, 0.5, 2, 8],
		// training options
		nFold: 5,               
		normalize: true,  
		reduce: false,                    
		probability : true  
	});

	svm.train(trainingSet).progress(function(rate){
		//console.log('training progress: %d%', Math.round(rate*100));            
	})
	.spread(function(trainedModel, trainingReport){
		//console.log('SVM trained. \nReport:\n%s', so(trainingReport));
		return callback(JSON.stringify(trainedModel));
	});

};


// Classify a user
// 1. Restore the svm model; 
// 2. Stroke by stroke in the predictionSet, perform a prediction (Authentication);
// 3. Return the ID of the user predicted
exports.classify = function(predictionSet, model, callback){

	console.log('Classifying');
	
	var predictions = [];
	var svm = nodesvm.restore(JSON.parse(model));
	
	predictionSet.forEach(function(features){
		var prediction = svm.predictSync(features);
		//var prediction = svm.predictProbabilitiesSync(xpto);
		predictions.push(prediction);
	});

	return callback(maxOccurrence(predictions));

};


// Given an array, returns the max occurrence on that array:
// Example:
// array = [1, 2, 2, 2, 2, 1]
// returns 2
var maxOccurrence = function(array){
	if(array.length == 0)
		return null;
	var modeMap = {};
	var maxEl = array[0], maxCount = 1;
	for(var i = 0; i < array.length; i++){
		var el = array[i];
		if(modeMap[el] == null)
			modeMap[el] = 1;
		else
			modeMap[el]++;	
		if(modeMap[el] > maxCount){
			maxEl = el;
			maxCount = modeMap[el];
		}
	}
	return maxEl;
}
