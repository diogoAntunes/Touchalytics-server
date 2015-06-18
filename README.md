# Thouchalytics for Node.js

[Touchalytics](http://www.mariofrank.net/touchalytics/) Node.js implementation.

In my Msc thesis i created a proof-of-concept using the theoretical work from Mark Frank on Touchalytics.
Touchalytics objective is to create a user fingerprint based on his usage of a smartphone device. By calculating a
set of biometric features using the strokes performed on a mobile device, and inserting it on a classifier, we are able to distinguish from various users.

I divided this implementation in two parts, a client-side and a server-side, this is the server-side in Node.js.

## Server.js
Handles the network connections by implementing a Rest API, and controls the program flow.

## Configs.js
Contains the various configurations variables.

## Extract.js
Performs the calculations of the biometric features using the various strokes received from the user mobile device.

## Classifier.js
Utilizes Support-Vector-Machines to train/classify users.

## MongoDB.js
All the functions related to storage of data.




