JWT Authentication API - Authenticate the user and returns a JWT to user.

How To Start
	command:-	node server.js
	
Available Users
	 {'username':'sulabha','password':'12345678'},
	 {'username':'kaushikp','password':'12345678'},
	 {'username':'gauravu','password':'12345678'}	
	 
	 
Available Urls
	(GET) - http://localhost:3131/
	
	(GET) - http://localhost:3131/api
	
	(POST) - http://localhost:3131/api/auth
		Command using curl:-	curl --data "username=sulabha&password=12345678" http://localhost:3131/api/auth
		
	(GET) - http://localhost:3131/api/users?token={token}	