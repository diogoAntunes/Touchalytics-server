/* Dependencies */
var math = require('mathjs'),
quants = require('quants'),
fs = require('fs');

/* Modules */
var util = require('./utils/utils');

exports.checkFeatures = function(features, callback){
	
	for(var i=0; i<features.length; i++){
		for(var j=0; j<features[i].length; j++){
			if(isNaN(features[i][j]) || !isFinite(features[i][j]) || features[i][j] == null){
				console.log('Correcting features: ' + features[i][j]);
				features[i][j] = 0;
			}

		}
	}
	return callback(features);

};

exports.parse = function(data, devicePPI, deviceRender, callback){
	
	console.log('Calculating Features');

	var columns = {
		"x" : 0,
		"y" : 1,
		"time" : 2,
		"area" : 3,
		"pressure" : 4,
		"orientation" : 5,
		"action" : 6
	};
	var trainingData = [];
	var percentileValues = [20, 50, 80];
	var a = 1;
	var b = [1, -1];

	//convert from inches to mm
	//render to pixel
	var pixels = 1/devicePPI;
	pixels = pixels * 25.4; 


	var nStrokes = Math.round(data.length);
	//var nStrokes = Math.round(data.stroke.length);
	
	for(var i = 0; i < nStrokes; i++){


	// number of measurements of stroke
	var npoints = Math.round(data[i].stroke.length);

	if(npoints < 3) continue;

	// preprocess
	col_time = data[i].stroke.map(function(value,index) { return value[columns.time]/1000; });

	col_x = data[i].stroke.map(function(value,index) { return parseInt(value[columns.x]); });
	col_y = data[i].stroke.map(function(value,index) { return parseInt(-value[columns.y]); });


	col_x_pixels = math.multiply(math.multiply(col_x, deviceRender), pixels);
	col_y_pixels = math.multiply(math.multiply(col_y, deviceRender), pixels);

	
	if(data[i].hasOwnProperty('features')){
		var dynauthFeatures = data[i].features;
		var feature1 = dynauthFeatures.feature1;
		var feature2 = dynauthFeatures.feature2;
		var feature3 = dynauthFeatures.feature3;
		var feature4 = dynauthFeatures.feature4;
		var feature5 = dynauthFeatures.feature5;
		var feature6 = dynauthFeatures.feature6;
	} else {
		/* Feature 1 */
		// time to next stroke (0 if last stroke in dataset)
		if(i != nStrokes-1){
			var feature1 = data[i+1].stroke[0][columns.time] - data[i].stroke[0][columns.time];
			feature1 = feature1/1000;
		} else {
			feature1 = 0;
		}
		/* Feature 2 */
		//time to last point of this stroke
		// ultimp tempo do stroke - 1º tempo do stroke
		var feature2 = data[i].stroke[npoints-1][columns.time] - data[i].stroke[0][columns.time];
		feature2 = feature2/1000;

		/* Feature 3 */
		// x-pos start
		var feature3 = col_x_pixels[0];

		/* Feature 4 */
		// y-pos start
		var feature4 = col_y_pixels[0];

		/* Feature 5 */
		// x-pos end
		var feature5 = col_x_pixels[col_x_pixels.length-1];

		/* Feature 6 */
		// y-pos end
		var feature6 = col_y_pixels[col_y_pixels.length-1];

	}

/* Feature 7 */
//full dist
var feature7 = math.sqrt( math.pow((feature6 - feature4), 2) + math.pow((feature5 - feature3), 2));
//console.log('Feature7: ' + feature7);

/* Displacements */
var xDisp = util.filter(b, a, col_x_pixels).slice(1);
var yDisp = util.filter(b, a, col_y_pixels).slice(1);
var tDelta = util.filter(b, a, col_time).slice(1);
var angle = math.atan2(yDisp, xDisp);

/* Feature 8 */
//Mean Resutlant Length
feature8 = util.circ_r(angle);

/* Feature 9-11 */
var pairwDist = math.sqrt( math.add(math.square(xDisp), math.square(yDisp)));
var v = math.dotDivide(pairwDist, tDelta);

var v2 = math.clone(v);
var feature9 = quants.prctile(v2, 20);
var feature10 = quants.prctile(v2, 50);
var feature11 = quants.prctile(v2, 80);

/* Feature 12-14 */
var acc = util.filter(b, a, v);
acc = math.dotDivide(acc, tDelta).slice(1);

var acc2 = math.clone(acc);
var feature12 = quants.prctile(acc2, 20);
var feature13 = quants.prctile(acc2, 50);
var feature14 = quants.prctile(acc2, 80);

/* Feature 15 */
// median velocity of last 3 points
var feature15 = math.median(v.slice(v.length-3));
//('Feature15: ' + feature15);

/* Feature 16 */
// largest deviation from end-to-end line

//max dist. beween direct line and true line (with sign)
var xvek = math.subtract(col_x_pixels, col_x_pixels[0]);
var yvek = math.subtract(col_y_pixels, col_y_pixels[0]);

var cross1 = [xvek[xvek.length-1], yvek[yvek.length-1], 0];
var perVek = math.cross(cross1, [0, 0, 1]);

if(perVek.length != 0){
	var mult1 = [perVek[0], perVek[1]];
	var mult2 = math.transpose([perVek[0], perVek[1]]);

	perVek = math.divide(perVek, math.sqrt(math.multiply(mult1, mult2)));
}

var rep1 = math.resize([], [xvek.length], perVek[0]);
var rep2 = math.resize([], [xvek.length], perVek[1]);

var projectOnLine = math.add(math.dotMultiply(xvek, rep1), math.dotMultiply(yvek, rep2));
var absProjectLine = math.abs(projectOnLine);

var feature16 = projectOnLine[absProjectLine.indexOf(math.max(absProjectLine))];


/* Feature 17-19 */
// Percentis deviation from end-to-end line
var projectOnLine2 = math.clone(projectOnLine);
var feature17 = quants.prctile(projectOnLine2, 20);
var feature18 = quants.prctile(projectOnLine2, 50);
var feature19 = quants.prctile(projectOnLine2, 80);

/* Feature 20 */
// Average direction

var feature20 = util.circ_mean(angle);

/* Feature 21 */
// direction of end-to-end line

var feature21 = math.atan2(feature6 - feature4, feature5 - feature3);

/* Feature 22 */
// Direction flag
var feature22 = 0;
var tmpangle = math.add(feature21, math.pi);
var compareValue = math.divide(math.pi, 4);

if(tmpangle <= compareValue){
	feature22 = 4; // direita
} else{
	if(tmpangle > compareValue && tmpangle <= 5*compareValue){
		if(tmpangle < 3*compareValue){
			feature22 = 1; // cima	
		} else {	
			feature22 = 2; // esquerda
		}
	} else {
		if(tmpangle < 7*compareValue){
			feature22 = 3; // baixo
		} else {
			feature22 = 4; // direita
		}
	}
}

/* Feature 23 */
// length of trajectory
var feature23 = math.sum(pairwDist);

/* Feature 24 */
//ratio between direct length and length of trajectory
var feature24 = math.divide(feature7, feature23);

/* Feature 25 */
//average velocity
var feature25 = math.divide(feature23, feature2);

/* Feature 26 */
// average acc over first 5 points
var feature26 = math.median(acc.slice(0, math.min([5, acc.length])));

/* Feature 27 */
// pressure in the middle of the stroke
// selecionar os pontos medios do stroke na pressure
var floor = math.floor(npoints/2);
var ceil = math.ceil(npoints/2);
var feature27;
if(floor == ceil){
	feature27 = parseFloat(data[i].stroke[floor-1][columns.pressure]);
} else {
	feature27Data = data[i].stroke.slice(floor, ceil+1)
	var auxDataPressure = [];
	var auxDataArea = [];
	
	for (var j = 0; j < feature27Data.length; j++) {
		auxDataPressure.push(parseFloat(feature27Data[j][columns.pressure]));
		auxDataArea.push(parseFloat(feature27Data[j][columns.area]));
	};
	feature27 = parseFloat(math.median(auxDataPressure));
}

/* Feature 28 */
// covered area in the middle of the stroke
var feature28;
if(floor == ceil){
	feature28 = parseFloat(data[i].stroke[floor-1][columns.area]);
} else {
	feature28 = parseFloat(math.median(auxDataArea));
}

// Creating features array
features = [
feature1, feature2,
feature3, feature4,
feature5, feature6,
feature7, feature8,
feature9, feature10,
feature11, feature12,
feature13, feature14,
feature15, feature16,
feature17, feature18,
feature19, feature20,
feature21, feature22,
feature23, feature24,
feature25, feature26,
feature27, feature28
];

// training
trainingData.push(features);


};
return callback(trainingData);

};
