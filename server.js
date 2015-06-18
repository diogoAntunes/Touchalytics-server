/* Dependencies */
var express = require('express'),
app = express(),
router = express.Router(),
bodyParser = require('body-parser');

/* Modules */
var mongodb = require('./database/mongodb'),
dataParser = require('./extract.js'),
classifier = require('./classifier'),
config = require('./configs');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set('port', (process.env.PORT || 5000));


// 1. dynauthserver
// in: Feature 1 to 6, userID, strokes
// out: message
app.post('/mSecure/dynauth', function(req, res){

	var userEmail = req.body.userEmail;
	var deviceModel = req.body.deviceModel;
	var devicePPI = 326;
	var deviceRender = 1;
	var currentNumberOfUsers;
	
	mongodb.getUsersCount(function(nUsers){
		currentNumberOfUsers = nUsers;
		console.log('Number of users available for training: ' + nUsers);
	});

	/* Device PPI */
	if(config.ppi.group1.indexOf(deviceModel) >= 0){
		devicePPI = 326;
	}
	if(config.ppi.group2.indexOf(deviceModel) >= 0){
		devicePPI = 132;
	}
	if(config.ppi.group3.indexOf(deviceModel) >= 0){
		devicePPI = 264;
	}
	if(config.ppi.group4.indexOf(deviceModel) >= 0){
		devicePPI = 163;
	}

	/* Device Render */
	if(config.devices.group1.indexOf(deviceModel) >= 0){
		deviceRender = 1;
	}
	if(config.devices.group2.indexOf(deviceModel) >= 0){
		deviceRender = 2;
	}
	if(config.devices.group3.indexOf(deviceModel) >= 0){
		deviceRender = 3;
		devicePPI = 401;
	}

	/* Calculate biometric features */
	dataParser.parse(req.body.strokes, devicePPI, deviceRender, function(rawFeatures){	
		dataParser.checkFeatures(rawFeatures, function(features){
			mongodb.getUserFromEmail(userEmail, function(user){
				/* User Found */
				if(user != null){
					console.log('User not null: ' + userEmail);
					/* user trained */
					if(user.model != null){
						console.log('User Model Found: ' + features.length);
						if(features.length >= config.svm.classificationStrokes){
							doClassification(user, features, res);
						} else {
							console.log('Not Enough Data to Authenticate');
							res.json({'message' : config.messages.noDataAuthentication});
						}
					} else { /* user not trained */
						console.log('User not trained: ' + (features.length + user.data.length));
						//console.log('Count: ' + currentNumberOfUsers);
						if((features.length + user.data.length) >= config.svm.trainingStrokes && currentNumberOfUsers >= config.svm.trainingUsersMin){
							mongodb.userUpdateData(user, features);
							doTraining(user, features, res);

						} else {
							mongodb.userUpdateData(user, features);
							console.log('Not Enough Data to Train');
							res.json({'message' : config.messages.noDataTraining});
						}
					}
					/* User Not Found */
				} else {
					console.log('New User with: ' + features.length + ' strokes');
					console.log('New User with: ' + userEmail + ' email');
					mongodb.saveNewUser(features, userEmail, deviceModel, function(user){
						if(features.length >= config.svm.trainingStrokes && currentNumberOfUsers >= config.svm.trainingUsersMin){
							doTraining(user, features, res);
						} else {
							console.log('Not Enough Data to Train');
							res.json({'message' : config.messages.noDataTraining});
						}
					});
				}
			});

});

});
});

function doClassification(user, features, res){
	console.log('Classification');

	classifier.classify(features, user.model, function(prediction){
		// Authentication Success
		if(user.ident == prediction){
			// Update the data
			mongodb.userUpdateData(user, features);
			console.log('Authentication Success');
			console.log('Real User: ' + user.ident);
			console.log('Prediction: ' + prediction);
			res.json({'message' : config.messages.classificationSuccess});
		} else {
			console.log('Authentication Failed');
			console.log('Real User: ' + user.ident);
			console.log('Prediction: ' + prediction);
			res.json({'message' : config.messages.classificationFail});
		}
	});
}

function doTraining(user, features, res){

	console.log('Training');
	// Train the user
	mongodb.getTrainingSet(user, function(trainingSet){
	//console.log(trainingSet);
		classifier.buildSVM(trainingSet, function(svmModel){
			mongodb.saveLatestModel(user, svmModel);
			console.log('Training Complete, next iteration will try to Authenticate');
			res.json({'message' : config.messages.noDataClassification});
		});
	});
}


// Starting the webServer
app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'));
});
