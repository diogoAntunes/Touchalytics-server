var math = require('mathjs');

exports.filter = function(b, a, vector){

	// Flag:
	// 1: return all
	// 0: remove first element
	N = vector.length;
	result = [];

	for(i = 0; i<N; i++){
		if(i == 0){
			result[i] = b[0] * vector[i];
		} else {
			//result[i] = ( b[0]/a ) * vector[i] + ( b[1] / a ) * vector[i-1] - ( a / a ) * result[i-1];
			result[i] = b[0] * vector[i] + b[1] * vector[i-1];
		}

	}

	return result;	
}

exports.circ_r = function(angleVector){

	var d = 0;
	var r = 0;
	
	var x = math.exp(math.multiply(angleVector, math.complex(0, 1)));
	
	x.forEach(function (value, index, matrix) {
		r = math.add(value, r);
	});

	r = math.abs(r) / 3;

	return r;
};

exports.circ_mean = function(angleVector){

	var dim = 1;
	//var w = math.ones(angleVector.length);

	//compute weighted sum of cos and sin of angles
	var r = math.exp(math.multiply(angleVector, math.complex(0, 1)));
	r = math.sum(r);
	
	//obtain mean by
	// The angle function can be expressed as angle(z) = imag(log(z)) = atan2(imag(z),real(z)).

	var mu = math.atan2(r.im, r.re);

	return mu;

};