var mongoose = require('mongoose').connect('mongodb://localhost/test');
var db = mongoose.connection;
var config = require('../configs');

var User;
var userSchema;

db.on('error', console.error.bind(console, 'connection error:'));

// Opens connection with mongoDB and saves the userSchema
db.once('open', function callback () {

	userSchema = mongoose.Schema({
		ident : Number,
		email: String,
		data: Array,
		deviceModel: String,
		numberOfExtractions: Number,
		model: String,
		dateOfExtraction: { type: Date, default: Date.now, required: true, unique: true }
	});

	User = mongoose.model('user', userSchema);
});



/*** USER OPERATIONS ***/
exports.saveNewUser = function(userData, userEmail, deviceModel, callback){
	console.log('mongodb.saveNewUser: saving user');

	User.count({}, function(err, count){
		var newUser = new User(({ ident: count+1, email: userEmail, data: userData, deviceModel: deviceModel, numberOfExtractions: 1, model: null}));
		
		newUser.save(function(err, newUser){
			if(err){
				return console.error('mongodb.saveNewUser: '+ err);
			}
			console.log('mongodb.saveNewUser: user saved');
			return callback(newUser);
		});
	})

};


exports.userUpdateData = function(user, newData){

	console.log('mongodb.userUpdateData: updating user strokes');
	
	newData.forEach(function(item){
		user.data.push(item);
	});
	
	user.save(function(err){
		if(err){
			console.error('mongodb.userUpdateData: Error updating user' + err);
		} else {
			console.log('mongodb.userUpdateData: User updated');
		}
	});
};

exports.getUserFromEmail = function(userEmail, callback){
	userFind(userEmail, function(err, user){
		if(err){
			return callback(err);
		}else{
			if(!user){
				return callback(null);
			} else {
				return callback(user);	
			}
		}
	});
};

exports.getUsersCount = function(callback){

	var numberOfUsers = 0;
	User.find({}, function(err, users){
		if(err){
			console.error('mongodb.getUsersCount: ' + error);
			return callback(null);
		} else {
			users.forEach(function(user){
				if(user.data.length >= config.svm.trainingStrokes){
					numberOfUsers++;
				}
			});
			return callback(numberOfUsers);
		}
	});

};

// Returns the user from DB with
// userID
exports.getUserFromID = function(userID, callback){
	User.findOne({ident: userID}, function (err, user){
		if(err) return callback(err);
		if(!user){
			return callback(null);
		}else{
			return callback(user);
		}
	});
};


/* ***************** */


/*** SVM MODEL OPERATIONS ***/
exports.saveLatestModel = function(user, latestModel){
	
	user.model = latestModel;
	user.save(function(err){
		if(err){
			console.error('mongodb.saveLatestModel: Error saving model');
		} else {
			console.log('mongodb.saveLatestModel: Model Updated');
		}
	});
};

// Returns the training set necessary to train the classifier
exports.getTrainingSet = function(user, callback){
	User.find({}, function(err, users){
		if(err){
			console.log('mongodb.getTrainingSet: ' + err);
			return callback(null);
		} else {
			var trainingSet = [];

			// user Training Data
			var userShuffleData = shuffle(user.data);
			for(var i=0; i<config.svm.trainingStrokes ; i++){
				trainingSet.push([userShuffleData[i], user.ident]);
				//console.log("Training stroke: " + i);
				//console.log(trainingSet[i]);
			}

			// otherUsers Training Data
			var randomUsers = shuffle(users);
			var auxCount = 0;
			for(var i=0; i<randomUsers.length; i++){
				if(randomUsers[i].ident != user.ident && randomUsers[i].data.length >= config.svm.trainingStrokes){
					if(auxCount < config.svm.trainingUsers){
						var shuffleData = shuffle(randomUsers[i].data);
						//console.log("User: " + randomUsers[i].ident)
						for(var j=0; j<config.svm.trainingStrokes; j++){
							trainingSet.push([shuffleData[j], randomUsers[i].ident]);		
						}
						auxCount++;
					} else {
						break;
					}
				}
			}
			return callback(trainingSet);
		}
	});
};


/*** Private functions ***/
function shuffle(array){

	var m = array.length, t, i;
	while (m > 0){
		i = Math.floor(Math.random() * m--);
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}
	return array;
}

function userFind(userID, callback){
	User.findOne({email: userID}, function (err, user){
		if(err) return callback(err);
		if(!user){
			return callback(null);
		}else{
			console.log('mongodb.userFind: ' + user.email);
			return callback(null, user);
		}
	});
}



