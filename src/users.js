exports.getAll=function(callback){
	var mongodb = require('mongodb');

var MongoClient = mongodb.MongoClient;

    // Connection URL. This is where your mongodb server is running.
var url = 'mongodb://kaushikp:password1@ds139985.mlab.com:39985/application';
var nodeArr=[];
    // Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        //HURRAY!! We are connected. :)
        console.log('Connection established to', url);

        // Get the documents collection
        var collection = db.collection('users');
		
        collection.find({},{first_name:1,last_name:1,email:1,user_name:1,id:1}).toArray(function (err, result) {
            if (err) {
                console.log(err);
            } else if (result.length) {
			console.log(result.length);
                callback(result);
            } else {
                console.log('No document(s) found with defined "find" criteria!');
            }
            //Close connection
           // db.close();
        });

       }
    });

};
exports.getCurrentUser=function(email,callback){
	exports.getAll(function(result){
		var alluser=result;
		var currentUser='';
		for(var index=0;index<alluser.length;index++){
			if(alluser[index].email===email)
				currentUser=alluser[index];
		}
		callback(currentUser);
	});
};

exports.validate=function(username,password,callback){
	exports.getAll(function(result){
		var alluser=result;
		var validUser='';
		for(var index=0;index<alluser.length;index++){
			if(alluser[index].user_name===username && password==="12345678"){
			validUser=alluser[index];
			validUser.IsLoggedIn=true;
			exports.update(validUser);
			}
		}
		callback(validUser);
	});
	
};

exports.update=function(loggedUser){
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://kaushikp:password1@ds139985.mlab.com:39985/application';

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } 
	else {
        console.log('Connection established to', url);
        var collection = db.collection('users');
		collection.save(loggedUser);
            if (err) {
                console.log(err);
            }  else {
                console.log(loggedUser.user_name+' updated');
            }
   }
});

};

function postData(callback){
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://kaushikp:password1@ds139985.mlab.com:39985/application';

MongoClient.connect(url, function (err, db) {
    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } 
	else {
	
	}
});
};