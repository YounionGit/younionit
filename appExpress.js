
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
	
	var id_user = req.body.user.id; 	
	var month = req.body.month;
	var year = req.body.year;
	
	//var sqlSelect = "select * from tb_controle_horarios where id_usuario = ?";
	var sqlSelect = "select DATE_FORMAT(data,'%d/%m/%Y') data, " +
			"TIME_FORMAT(hora_entrada,'%H:%i') hora_entrada, " +
			"TIME_FORMAT(hora_saida,'%H:%i') hora_saida,observacao, atividade, id_usuario, id, " +
			"TIME_FORMAT(TIME(hora_saida - hora_entrada),'%H:%i') total_Horas "+
			"from tb_controle_horarios " +
			"where DATE_FORMAT(data,'%c') = ? and DATE_FORMAT(data,'%Y') = ? " +
			"and id_usuario = ? " +
			"order by data, hora_entrada ";
	
    connection.query(sqlSelect, [month, year, id_user], 
		function(err, rows, result){
    		if (err) throw err;
    		//console.log(result);
    		res.send(rows);
    });
});

app.post("/horarios/fechamento/mes", function(req, res){
	var resposta = {};
	resposta.flag = false;
	resposta.currentDate = new Date(); 
	var currentMonth = new Date().getMonth()+1;
	var currentYear = new Date().getFullYear();
	
	var user = req.body.user.id;
	var month = req.body.month;
	var year = req.body.year;
	
	var sql = "SELECT * FROM tb_controle_fechamentos_mes f " +
			"left join tb_usuarios u on f.id_usuario = u.id_usuario "+
			"where u.id_usuario = ? " +
			"and f.mes = ? " +
			"and f.ano = ? ";
	
	
	 if(month == currentMonth && year == currentYear ){
		 resposta.flag = true;
		 res.send(resposta);
	 }else{
		 connection.query(sql, [user, month, year], 
				 function(err, rows, result){
			 if (err) throw err;	
			 
			 if(rows.length > 0) {
				 
				 if(rows[0].flag_mes_aberto === 1){
					 resposta.flag = true;
				 }else{
					 resposta.flag = false;
				 }
			 }
			 res.send(resposta);
		 });
	 }
	 
 });


app.get("/index", function(req, res){

    res.sendFile('index.html', { root: pathAbsolute });
});

app.post("/login", function(req, res){

    var login = req.body.username;
    var password = req.body.password;

    var sql = "select u.id_usuario, u.nome, u.senha, u.login, p.id id_perfil, p.nome perfil, p.descricao " +
    		"from tb_usuarios u " +
    		"left join tb_perfis p on p.id = u.id_perfil " +
    		"where u.login= ? and u.senha = ? " +
    		"and u.flag_ativo = 1 ";
    connection.query(sql,[login, password],
        function(err, rows, result){
        if (err) throw err;
        
        var resposta = {};
        resposta.success = false;
        for (var i in rows) {
        	resposta.success = true;
        	resposta.currentUser = convertUserToJson(rows[i]);
        }
        res.send(resposta);
    });

});

function convertUserToJson(user){
	var perfil = {};
	var currentUser = {perfil: perfil};
	currentUser.nome = user.nome;
	currentUser.id_usuario = user.id_usuario;
	currentUser.senha = user.senha;
	currentUser.login = user.login;
	currentUser.perfil.id = user.id_perfil;
	currentUser.perfil.descricao = user.descricao;
	currentUser.perfil.perfil = user.perfil;
	
	return currentUser;
}

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
	
	var update = horario.id !== undefined || horario.id > 0;
	if(update){
		var sqlUpdate = "UPDATE tb_controle_horarios " +
		"SET hora_entrada = ?, hora_saida = ?, sysdate = NOW(), observacao = ?, " +
		"data = STR_TO_DATE(?,'%d/%m/%Y'), atividade = ? WHERE id = ? and id_usuario= ?";

		connection.query(sqlUpdate,
				[horario.horaEntrada, horario.horaSaida, horario.observacao, horario.data, horario.atividade, horario.id, horario.id_usuario],
		function(err, result){
			if(err) throw err;
		
			res.send(result);
		});
		
	}else{//insert
		
		var sqlInsert = "INSERT INTO tb_controle_horarios " +
		"( hora_entrada, hora_saida, sysdate, id_usuario, observacao, data, atividade) " +
		"VALUES ( ?, ?, NOW(), ?, ?, STR_TO_DATE(?,'%d/%m/%Y'), ?)";

		connection.query(sqlInsert,
				[horario.horaEntrada, horario.horaSaida, horario.id_usuario, horario.observacao , horario.data, horario.atividade],
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
	
	 var access = path === '/controles' ||
     	path === '/politicas' ||
     	path === '/boletim' ||
     	path === '/email';
	 
	 res.send(access); 
});


app.post("/usuarios/list", function(req, res){
	
	var sql = "select u.id_usuario, u.nome, u.login, p.id id_perfil, p.nome perfil, u.flag_ativo ativo " +
			"from tb_usuarios u " +
			"left join tb_perfis p on p.id = u.id_perfil ";
	
	connection.query(sql,
	        function(err, result){
		if(err) throw err;
		
		res.send(result);
	});

});

app.post("/usuarios/list/typeahead", function(req, res){
	
	var nome = req.body.params.nome;
	
	var sql = "select u.id_usuario, u.nome, u.login, p.id id_perfil, p.nome perfil " +
			"from tb_usuarios u " +
			"left join tb_perfis p on p.id = u.id_perfil " +
			 "where u.nome like '%"+nome+"%' and u.flag_ativo = 1";
	
	connection.query(sql,
	        function(err, result){
		if(err) throw err;

		res.send(result);
	});

});


app.post("/controle/liberacao/bloquear", function(req, res){
	
	var data = req.body.data;
	var user = req.body.id_usuario;
	
	var month = data.split('/')[0];
	var year = data.split('/')[1];
	
	
	var sql = "SELECT * FROM tb_controle_fechamentos_mes f " +
	"where f.id_usuario = ? " +
	"and f.mes = ? " +
	"and f.ano = ? "; 
	
	
	 connection.query(sql, [user, month, year], 
			 function(err, rows, result){
		 if (err) throw err;	
		 
		 if(rows.length > 0) {
			 
		     updateFechamentoMes(user, month, year);				 
				
		 }else{
			 insertFechamentoMes(user, month, year);
				 
			 
		 }
		 res.send("success");
		
	 });
});	 

app.post("/controle/liberacao/salvar", function(req, res){
	
	var data = req.body.data;
	var user = req.body.id_usuario;
	
	var month = data.split('/')[0];
	var year = data.split('/')[1];
	
	
	var sql = "SELECT * FROM tb_controle_fechamentos_mes f " +
	"where f.id_usuario = ? " +
	"and f.mes = ? " +
	"and f.ano = ? "; 
	
	
	 connection.query(sql, [user, month, year], 
			 function(err, rows, result){
		 if (err) throw err;	
		 
		 if(rows.length > 0) {
			 
		     updateFechamentoMes(user, month, year);				 
				
		 }else{
			 insertFechamentoMes(user, month, year);
				 
			 
		 }
		 res.send("success");
		
	 });
});
//	console.log(sql);
//	connection.query(sql,
//	        function(err, result){
//		if(err) throw err;
//
//		res.send(result);
//	});
app.post("/usuarios/salvar", function(req, res){
	var usuario = req.body.usuario;
	
	var update = usuario.id_usuario !== undefined || usuario.id_usuario > 0;
	if(update){
		var sqlUpdate = "update tb_usuarios " +
				"set nome = ? , id_perfil = ? , login = ? , flag_ativo = ? ";
				if(usuario.senha !== undefined){
					sqlUpdate = sqlUpdate+" ,senha = '" +usuario.senha+"'";					
				}
				sqlUpdate = sqlUpdate+" where id_usuario = ? ";
		
		connection.query(sqlUpdate,
				[usuario.nome, usuario.perfil , usuario.login, usuario.ativo, usuario.id_usuario],
		function(err, result){
			if(err) throw err;
					
			res.send(result);			
		});
		
	}else{
		var sqlInsert = "insert into tb_usuarios " +
				"(nome, senha, id_perfil, login, flag_ativo) " +
				"values (?, ?, ?, ?, ?) ";
		
		connection.query(sqlInsert,
				[usuario.nome, usuario.senha, usuario.perfil , usuario.login, usuario.ativo],
		function(err, result){
			if(err) throw err;
					
			res.send(result);			
		});		
	}
});

function updateFechamentoMes(user, month, year, flag){
	var sql = "update tb_controle_fechamentos_mes f set f.flag_mes_aberto = ? " +
	"where f.id_usuario = ? " +
	"and f.mes = ? " +
	"and f.ano = ? "; 

	 connection.query(sql, [user, month, year], 
			 function(err, rows, result){
		 if (err) throw err;
		return "success";
	 });
}

function insertFechamentoMes(user, month, year){
	var sql = "insert into tb_controle_fechamentos_mes (id_usuario, mes, ano, flag_mes_aberto) " +
	"values (?, ?, ?, ?)";
	
	
	 connection.query(sql, [user, month, year, 1], 
			 function(err, rows, result){
		 if (err) throw err;
		return "success";
	 });
}

app.post("/usuarios/salvar", function(req, res){
	var usuario = req.body.usuario;
	
	var update = usuario.id_usuario !== undefined || usuario.id_usuario > 0;
	if(update){
		var sqlUpdate = "update tb_usuarios " +
				"set nome = ? , id_perfil = ? , login = ? , flag_ativo = ? ";
				if(usuario.senha !== undefined){
					sqlUpdate = sqlUpdate+" ,senha = '" +usuario.senha+"'";					
				}
				sqlUpdate = sqlUpdate+" where id_usuario = ? ";
		
		connection.query(sqlUpdate,
				[usuario.nome, usuario.perfil , usuario.login, usuario.ativo, usuario.id_usuario],
		function(err, result){
			if(err) throw err;
					
			res.send(result);			
		});
		
	}else{
		var sqlInsert = "insert into tb_usuarios " +
				"(nome, senha, id_perfil, login, flag_ativo) " +
				"values (?, ?, ?, ?, ?) ";
		
		connection.query(sqlInsert,
				[usuario.nome, usuario.senha, usuario.perfil , usuario.login, usuario.ativo],
		function(err, result){
			if(err) throw err;
					
			res.send(result);			
		});		
	}
});


app.post("/usuarios/apagar", function(req, res){
	var entity = req.body.entity;
	
	if(entity !== undefined){
		var sql = "update tb_usuarios u set u.flag_ativo = 0 " +
		"where u.id_usuario = ?";
		
		connection.query(sql,[entity.id_usuario],
				function(err, result){
			if(err) throw err;
						
			res.send("sucesso");
		});		
	}
	//res.send("Erro ao apagar usuário");
	
});
	
app.post("/usuarios/perfil/list", function(req, res){
	
	var sql = "select id, nome, descricao from tb_perfis";
	
	connection.query(sql,
	        function(err, result){
		if(err) throw err;
		
		res.send(result);
	});
	
});
