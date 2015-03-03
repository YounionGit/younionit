
var pathAbsolute = __dirname;

var express=require("express");
var bodyParser  =  require("body-parser");

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '192.168.25.106',
    user     : 'webuser',
    password : '1234',
    database : 'youniondb'
});

connection.connect();

var app = express();
app.use(express.static(__dirname));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


app.listen(8080);


app.get("/users/list", function(req, res){
    connection.query("select * from tb_controle_horarios", function(err, rows, result){
        if (err) throw err;

        res.send(rows);
    });
});

app.get("/index", function(req, res){

    res.sendFile('index.html', { root: pathAbsolute });
});

app.post("/login", function(req, res){

    var login = req.body.username;
    var password = req.body.password;

    var sql = "select * from tb_usuarios where login='"+login+"' and senha ='"+password+"' ";
    connection.query(sql,
        function(err, rows, result){
        if (err) throw err;
        
        var resposta = {};
        resposta.success = false;
        for (var i in rows) {
        	resposta.success = true;
        	resposta.currentUser = rows[i];
        }        
        res.send(resposta);
    });

});


app.post("/authentication/access", function(req, res){
	//define os links que devem ter restrições
	var path = req.body.path;
	
	 var access = //path === '/controles' ||
     	path === '/politicas' ||
     	path === '/boletim' ||
     	path === '/email';
	 
	 res.send(access); 
});
