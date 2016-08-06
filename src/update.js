exports.getLatestUpdate=function(lastId,userId,newLogin,callback){

var sql = require('mssql');
var conn_str = "server=172.16.0.51;uid=gkumar;pwd=gaurav1990@#u2016;database=cc_au_gk";
	var query="";
	if(newLogin.toLowerCase()==="true")
		query="SELECT TOP 1 * FROM dbo.activity_updates_"+userId+" order by id desc";
	else
		query="SELECT TOP 1 * FROM dbo.activity_updates_"+userId+" where id>"+lastId+" order by id asc";
		
sql.connect(conn_str).then(function() {
    // Query

    new sql.Request().query(query).then(function(recordset) {
        callback(recordset);
    }).catch(function(err) {
        // ... query error checks
    });
	});
};