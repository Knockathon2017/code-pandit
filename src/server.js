var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config=require('./config');
var user = require('./users');
var port=3131;
app.set('secret',config.secret);
var apiRouter = express.Router();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

apiRouter.get('/',function(request,response){
	response.json({message:'TypTap sample authentication API.'});
});
app.get('/',function(request,response){
	response.send('TypTap sample authentication API.');
});
apiRouter.post('/auth',function(request,response){
	var username = request.username;
	var password=request.password;
	var validUser=user.validate(username,password,function(validUser){
		if(validUser==''){
			response.json({success:false,message:'UserName/Password is not valid.'});
		}
		else{		    
			var authToken=jwt.sign(validUser,app.get('secret'),{
				'expiresIn': 1440
			});
			response.json({token:authToken,success:true,message:'UserName/Password is valid.'});
			
		}
	});
});
// apiRouter.use(function(request,response,next){
	// var token = request.query.token;
	// if(token){
		// jwt.verify(token,app.get('secret'),function(error,jsonToken){
			// if(error)
				// return response.json({success:false,message:'Invalid token.'});
			// else{
				// request.jsonToken=jsonToken;
				// next();
			// }
		// });				
	// }
	// else{
		// return response.status(403).send({success:false,message:'No token provided.'});
	// }
// });
apiRouter.get('/users',function(request,response){
	user.getAll(function(result){
		response.json(result);
	});
});
apiRouter.post('/signout',function(request,response){
	var token = request.token;
	if(token){
		jwt.verify(token,app.get('secret'),function(error,jsonToken){
			if(error)
				return response.json({success:false,message:'Invalid token.'});
			else{
				user.getCurrentUser(email,function(user){
					user.IsLoggedIn=false;
					user.update(user);
				});
				request.jsonToken=jsonToken;
			}
		});				
	}
});
app.use('/api',apiRouter);
app.listen(port);
console.log("API started at "+port);