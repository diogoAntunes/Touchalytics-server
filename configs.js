/*
	Configuration file:
	config.messages: messages returns to main server
	config.svm: svm parameters
	config.devices: devices supported
*/

var config = {}

config.messages = {};
config.svm = {};
config.ppi = {};
config.devices = {};

config.svm.trainingUsersMin = 2;
config.svm.trainingUsers = 5;
config.svm.trainingStrokes = 11;
config.svm.classificationStrokes = 3;

config.messages.classificationSuccess = 'YES';
config.messages.classificationFail = 'NO';
config.messages.noDataAuthentication = 'NOT_ENOUGH_DATA_AUTHENTICATION';
config.messages.noDataTraining = 'NOT_ENOUGH_DATA_TRAINING';

config.ppi.group1 = ['iPhone3,1', 'iPhone3,3', 'iPhone4,1', 'iPhone5,1', 'iPhone5,2', 'iPhone5,3', 'iPhone5,4', 'iPhone6,1', 'iPhone6,2', 'iPhone7,2', 'iPad4,4', 'iPad4,5'];
config.ppi.group2 = ['iPad1,1', 'iPad2,1'];
config.ppi.group3 = ['iPad3,1', 'iPad3,4', 'iPad4,1', 'iPad4,2'];
config.ppi.group4 = ['iPad2,5'];

config.devices.group1 = ['iPad1,1', 'iPad2,1', 'iPad2,5', 'iPad4,4', 'iPad4,5'];
config.devices.group2 = ['iPhone3,1', 'iPhone3,3', 'iPhone4,1', 'iPhone5,1', 'iPhone5,2', 'iPhone6,1', 'iPhone6,2', 'iPhone7,2', 'iPad3,1', 'iPad3,4', 'iPad4,1', 'iPad4,2', 'iPhone5,3', 'iPhone5,4'];
config.devices.group3 = ['iPhone7,1'];

module.exports = config;

/*
@"iPad1,1"   on iPad
@"iPad2,1"   on iPad 2
@"iPad3,1"   on 3rd Generation iPad
@"iPhone3,1" on iPhone 4 (GSM)
@"iPhone3,3" on iPhone 4 (CDMA/Verizon/Sprint)
@"iPhone4,1" on iPhone 4S
@"iPhone5,1" on iPhone 5 (model A1428, AT&T/Canada)
@"iPhone5,2" on iPhone 5 (model A1429, everything else)
@"iPad3,4" on 4th Generation iPad
@"iPad2,5" on iPad Mini
@"iPhone5,3" on iPhone 5c (model A1456, A1532 | GSM)
@"iPhone5,4" on iPhone 5c (model A1507, A1516, A1526 (China), A1529 | Global)
@"iPhone6,1" on iPhone 5s (model A1433, A1533 | GSM)
@"iPhone6,2" on iPhone 5s (model A1457, A1518, A1528 (China), A1530 | Global)
@"iPad4,1" on 5th Generation iPad (iPad Air) - Wifi
@"iPad4,2" on 5th Generation iPad (iPad Air) - Cellular
@"iPad4,4" on 2nd Generation iPad Mini - Wifi
@"iPad4,5" on 2nd Generation iPad Mini - Cellular
@"iPhone7,1" on iPhone 6 Plus
@"iPhone7,2" on iPhone 6
*/