
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


app.post("/horarios/list", function(req, res){
	
	//var id_user = req.body.user.id; 
	
	var month = req.body.month;
	var year = req.body.year;
	console.log("mes e ano = "+ month + "---"+year );
	//var sqlSelect = "select * from tb_controle_horarios where id_usuario = ?";
	var sqlSelect = "select DATE_FORMAT(data,'%d/%m/%Y') data, " +
			"TIME_FORMAT(hora_entrada,'%H:%i') hora_entrada, " +
			"TIME_FORMAT(hora_saida,'%H:%i') hora_saida,observacao, atividade, id_usuario, id, " +
			"TIME_FORMAT(TIME(hora_saida - hora_entrada),'%H:%i') total_Horas "+
			"from tb_controle_horarios " +
			"where DATE_FORMAT(data,'%c') = ? and DATE_FORMAT(data,'%Y') = ? " +
			"order by data, hora_entrada ";
	
    connection.query(sqlSelect, [month, year], 
		function(err, rows, result){
    		if (err) throw err;
    		console.log(result);
    		res.send(rows);
    });
});

app.post("/horarios/fechamento/mes", function(req, res){
	
	var user = req.body.user;
	var month = req.body.month;
	var year = req.body.year;
	
	var sql = "SELECT f.flag_fechado FROM tb_controle_fechamentos_mes f " +
			"left join tb_usuarios u on f.id_usuario = u.id_usuario " +
			"where u.id_usuario = ? " +
			"and f.mes = ? " +
			"and f.ano = ? ";
	
	connection.query(sql, [user.id, month, year], 
			function(err, rows, result){
	    		if (err) throw err;
	    		console.log(result);
	    		res.send(rows[0]);
	    });
});



app.get("/index", function(req, res){

    res.sendFile('index.html', { root: pathAbsolute });
});

app.post("/login", function(req, res){

    var login = req.body.username;
    var password = req.body.password;

    var sql = "select * from tb_usuarios where login= ? and senha = ? ";
    connection.query(sql,[login, password],
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

app.post("/horarios/salvar", function(req, res){
	
	var horario = {
			id: req.body.entity.id,
			horaEntrada : req.body.entity.hora_entrada,
			horaSaida: req.body.entity.hora_saida,
			id_usuario: req.body.entity.id_usuario,
			sysdate: req.body.entity.sysdate,
			observacao: req.body.entity.observacao,
			data: req.body.entity.data,
			atividade: req.body.entity.atividade
			};
	
	console.log(horario);
	
	var update = horario.id !== undefined || horario.id > 0;
	if(update){
		var sqlUpdate = "UPDATE tb_controle_horarios " +
		"SET hora_entrada = ?, hora_saida = ?, sysdate = NOW(), observacao = ?, " +
		"data = STR_TO_DATE(?,'%d/%m/%Y'), atividade = ? WHERE id = ? and id_usuario= ?";

		connection.query(sqlUpdate,
				[horario.horaEntrada, horario.horaSaida, horario.observacao, horario.data, horario.atividade, horario.id, horario.id_usuario],
		function(err, result){
			if(err) throw err;
		
			console.log(result);	
			res.send(result);
		});
		
	}else{//insert
		
		var sqlInsert = "INSERT INTO tb_controle_horarios " +
		"( hora_entrada, hora_saida, sysdate, id_usuario, observacao, data, atividade) " +
		"VALUES ( ?, ?, NOW(), ?, ?, STR_TO_DATE(?,'%d/%m/%Y'), ?)";

		connection.query(sqlInsert,
				[horario.horaEntrada, horario.horaSaida, 1/*horario.id_usuario*/, horario.observacao , horario.data, horario.atividade],
		function(err, result){
			if(err) throw err;
		
			console.log(result);	
			res.send(result);
			
		});
	}
	
});

app.post("/horarios/apagar", function(req, res){
	var id_horarios = req.body.entity.id;
	
	var sqlDelete = "delete from tb_controle_horarios where id= ?";
	connection.query(sqlDelete,[id_horarios],
	        function(err, result){
		if(err) throw err;
		
		console.log(result);
		res.send(result);
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
