var pathAbsolute = __dirname;
var express = require("express");
var bodyParser = require("body-parser");
var http = require('http'), inspect = require('util').inspect;
var multer = require('multer');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'webuser',
  password : 'youniondbpass69',
  database : 'youniondb'
});
connection.connect();
var app = express();
app.use(express.static(__dirname));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended : true
}));
app.listen(8080);
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  host   : 'smtplw.com.br',
  auth   : {
    user : 'trial',
    pass : 'kVeuasNV5331'
  },
  secure : false,
  port   : 587
});
//setup e-mail data with unicode symbols
var mailOptions = {
  from    : 'Fred Foo ✔ <cassiano.trevisan@younionit.com.br>', // sender address
  to      : 'cassiano.trevisan@younionit.com.br;marcelo@younionit.com.br;bruno@younionit.com.br', // list of receivers
  subject : 'Hello ✔', // Subject line
  text    : 'Hello world ✔', // plaintext body
  html    : '<b>Este email foi enviado diretamente do sistema younionit controles, porém de forma trial, a não ser que tenhamos um servidor smtp contrato e eu ainda nao saiba ✔</b>' // html body
};
// send mail with defined transport object
//transporter.sendMail(mailOptions, function(error, info){
//    if(error){
//        console.log(error);
//    }else{
//        console.log('Message sent: ' + info.response);
//    }
//});
//transporter.sendMail({
//    from: 'cassiano.r.trevisan@gmail.com',
//    to: 'cassiano.trevisan@younionit.com.br',
//    subject: 'hello',
//    text: 'hello world!'
//});
app.post("/horarios/list", function (req, res) {
  var id_user = req.body.user.id;
  var month = req.body.month;
  var year = req.body.year;
  //var sqlSelect = "select * from tb_controle_horarios where id_usuario = ?";
  var sqlSelect = "select DATE_FORMAT(data,'%d/%m/%Y') data, " + "TIME_FORMAT(hora_entrada,'%H:%i') hora_entrada, " + "TIME_FORMAT(hora_saida,'%H:%i') hora_saida,observacao, atividade, id_usuario, id, " + "TIME_FORMAT(TIME(hora_saida - hora_entrada),'%H:%i') total_Horas " + "from tb_controle_horarios " + "where DATE_FORMAT(data,'%c') = ? and DATE_FORMAT(data,'%Y') = ? " + "and id_usuario = ? " + "order by data, hora_entrada ";
  connection.query(sqlSelect, [month, year, id_user], function (err, rows, result) {
    if (err) throw err;
    res.send(rows);
  });
});
app.use(multer({
  dest                 : './uploads/',
  onFileUploadComplete : function (file, req, res) {
    console.log(res);
  },
  limits               : {
    fieldNameSize : 999999999,
    fieldSize     : 999999999
  },
  rename               : function (fieldname, filename, req, res) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now() + "_" + req.body.num_nota;//FIXME COLOCAR O NUM DA NOTA
  },
  onError              : function (e, next) {
    if (e) {
      console.log(e.stack);
    }
    next();
  }

}));
app.post("/reembolso/nota/salvar", function (req, res) {
  var nome_arquivo = '';
  if (req.files.file != undefined) {//o campo anexo nao e obrigatorio
    nome_arquivo = req.files.file.path;
  }
  var reembolsoNota = req.body;
  var sqlInsert = "INSERT INTO tb_reembolso_notas " + "(id_reembolso, num_nota, emissor, valor, imagem_nota, id_tipo_reembolso, descricao) " + "VALUES ( ?, ?, ?, ?, ?, ?, ?)";
  connection.query(sqlInsert, [reembolsoNota.id, reembolsoNota.num_nota, reembolsoNota.emissor, reembolsoNota.valor, nome_arquivo, reembolsoNota.tipo, reembolsoNota.descricao],//id status = 1 = solicitado
    function (err, result) {
      if (err) {
        res.send([]);
      }
      ;
      res.send(result);
    });
});
app.post("/reembolso/nota/delete", function (req, res) {
  var sql = "delete from tb_reembolso_notas  where id = ?";
  console.log(req.body);
  connection.query(sql, [req.body.id_nota], function (err, result) {
    if (err) {
      res.send([]);
    }
    ;
    res.send(result);
  });
});
app.post("/controle/reembolso/salvar", function (req, res) {
  var reembolso = {
    id          : req.body.entity.id,
    observacoes : req.body.entity.observacoes,
    id_usuario  : req.body.entity.id_usuario
  };
  var update = reembolso.id !== undefined || reembolso.id > 0;
  if (update) {
    var sqlUpdate = "UPDATE tb_reembolso " + "SET observacoes = ?, " + "data_requisicao = STR_TO_DATE(?,'%d/%m/%Y') WHERE id = ? and id_usuario= ?";
    connection.query(sqlUpdate, [reembolso.observacoes, new Date(), reembolso.id, reembolso.id_usuario], function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  } else {//insert
    var sqlInsert = "INSERT INTO tb_reembolso " + "(id_usuario, observacoes, data_requisicao, id_status) " + "VALUES ( ?, ?, NOW(), ?)";
    connection.query(sqlInsert, [reembolso.id_usuario, reembolso.observacoes, 1],//id status = 1 = solicitado
      function (err, result) {
        if (err) throw err;
        res.send(result);
      });
  }
});
app.post("/controle/reembolso/update", function (req, res) {
  var reembolso = req.body.entity;
  console.log(reembolso);
  var sqlUpdate = "UPDATE tb_reembolso " + "SET id_status = ?, data_pagamento = STR_TO_DATE(?,'%d/%m/%Y') " + "WHERE id = ?";
  connection.query(sqlUpdate, [reembolso.id_status, reembolso.data_pagamento, reembolso.id], function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/horarios/fechamento/mes", function (req, res) {
  var resposta = {};
  resposta.flag = false;
  resposta.currentDate = new Date();
  var currentMonth = new Date().getMonth() + 1;
  var currentYear = new Date().getFullYear();
  var user = req.body.user.id;
  var month = req.body.month;
  var year = req.body.year;
  var sql = "SELECT * FROM tb_controle_fechamentos_mes f " + "left join tb_usuarios u on f.id_usuario = u.id_usuario " + "where u.id_usuario = ? " + "and f.mes = ? " + "and f.ano = ? ";
  if (month == currentMonth && year == currentYear) {
    resposta.flag = true;
    res.send(resposta);
  } else {
    connection.query(sql, [user, month, year], function (err, rows, result) {
      if (err) throw err;
      if (rows.length > 0) {
        if (rows[0].flag_mes_aberto === 1) {
          resposta.flag = true;
        } else {
          resposta.flag = false;
        }
      }
      res.send(resposta);
    });
  }
});
app.get("/index", function (req, res) {
  res.sendFile('index.html', { root : pathAbsolute });
});
app.post("/login", function (req, res) {
  var login = req.body.username;
  var password = req.body.password;
  var sql = "select u.id_usuario, u.nome, u.senha, u.login, p.id id_perfil, p.nome perfil, p.descricao " + "from tb_usuarios u " + "left join tb_perfis p on p.id = u.id_perfil " + "where u.login= ? and u.senha = ? " + "and u.flag_ativo = 1 ";
  connection.query(sql, [login, password], function (err, rows, result) {
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
function convertUserToJson(user) {
  var perfil = {};
  var currentUser = {perfil : perfil};
  currentUser.nome = user.nome;
  currentUser.id_usuario = user.id_usuario;
  currentUser.senha = user.senha;
  currentUser.login = user.login;
  currentUser.perfil.id = user.id_perfil;
  currentUser.perfil.descricao = user.descricao;
  currentUser.perfil.perfil = user.perfil;
  return currentUser;
}
app.post("/horarios/salvar", function (req, res) {
  var horario = {
    id          : req.body.entity.id,
    horaEntrada : req.body.entity.hora_entrada,
    horaSaida   : req.body.entity.hora_saida,
    id_usuario  : req.body.entity.id_usuario,
    sysdate     : req.body.entity.sysdate,
    observacao  : req.body.entity.observacao,
    data        : req.body.entity.data,
    atividade   : req.body.entity.atividade
  };
  var update = horario.id !== undefined || horario.id > 0;
  if (update) {
    var sqlUpdate = "UPDATE tb_controle_horarios " + "SET hora_entrada = ?, hora_saida = ?, sysdate = NOW(), observacao = ?, " + "data = STR_TO_DATE(?,'%d/%m/%Y'), atividade = ? WHERE id = ? and id_usuario= ?";
    connection.query(sqlUpdate, [horario.horaEntrada, horario.horaSaida, horario.observacao, horario.data, horario.atividade, horario.id, horario.id_usuario], function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  } else {//insert
    var sqlInsert = "INSERT INTO tb_controle_horarios " + "( hora_entrada, hora_saida, sysdate, id_usuario, observacao, data, atividade) " + "VALUES ( ?, ?, NOW(), ?, ?, STR_TO_DATE(?,'%d/%m/%Y'), ?)";
    connection.query(sqlInsert, [horario.horaEntrada, horario.horaSaida, horario.id_usuario, horario.observacao , horario.data, horario.atividade], function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  }
});
app.post("/horarios/apagar", function (req, res) {
  var entity_id = req.body.entity.id;
  var sqlDelete = "delete from tb_controle_horarios where id= ?";
  connection.query(sqlDelete, [entity_id], function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/reembolso/apagar", function (req, res) {
  var entity_id = req.body.entity.id;
  var sqlDelete = "delete from tb_reembolso where id= ?";
  connection.query(sqlDelete, [entity_id], function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/authentication/access", function (req, res) {
  //define os links que devem ter restrições
  var path = req.body.path;
  var user = req.body.user;
  var acessoRestrito = false;
  //colaboradores
  if (path === '/controles' || path === '/politicas' || path === '/boletim' || path === '/email') {
    if (!user) {
      acessoRestrito = true;
    }
  } else //Admin
    if (path === '/controles/liberacao/edicao' || path === '/usuarios/cadastrar') {
      if (!user || user === undefined || user.perfil === undefined || user.perfil.perfil !== "admin") {
        console.log('acesso restrito true');
        acessoRestrito = true;
      }
    }
  res.send(acessoRestrito);
});
app.post("/usuarios/list", function (req, res) {
  var sql = "select u.id_usuario, u.nome, u.login, p.id id_perfil, p.nome perfil, u.flag_ativo ativo, u.email " + "from tb_usuarios u " + "left join tb_perfis p on p.id = u.id_perfil ";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/reembolso/list", function (req, res) {
  var id_user = req.body.user.id;
  var month = req.body.month;
  var year = req.body.year;
  var sql = "select r.id id, " + "DATE_FORMAT(r.data_pagamento,'%d/%m/%Y') data_pagamento, " + "sr.nome status, r.observacoes observacoes " + "from tb_reembolso r " + "left join tb_status_reembolso sr on sr.id = r.id_status " + "where DATE_FORMAT(data_requisicao,'%c') = ? and DATE_FORMAT(data_requisicao,'%Y') = ? " + "and r.id_usuario = ?";
  connection.query(sql, [month, year, id_user], function (err, rows, result) {
    if (err) throw err;
    res.send(rows);
  });
});
app.post("/reembolso/aprovacao/list", function (req, res) {
  var colaborador = req.body.colaborador.id_usuario;
  var de = req.body.de;
  var ate = req.body.ate;
  var sql = "select r.id id, " + "DATE_FORMAT(r.data_pagamento,'%d/%m/%Y') data_pagamento, " + "DATE_FORMAT(r.data_requisicao,'%d/%m/%Y') data_requisicao, " + "sr.nome status,sr.id id_status, r.observacoes observacoes " + "from tb_reembolso r " + "left join tb_status_reembolso sr on sr.id = r.id_status " + "where DATE_FORMAT(data_requisicao,'%d/%m/%Y') between ? and ? " + "and r.id_usuario = ?";
  connection.query(sql, [de, ate, colaborador], function (err, rows, result) {
    if (err) throw err;
    res.send(rows);
  });
});
app.post("/usuarios/list/typeahead", function (req, res) {
  var nome = req.body.params.nome;
  var sql = "select u.id_usuario, u.nome, u.login, p.id id_perfil, p.nome perfil " + "from tb_usuarios u " + "left join tb_perfis p on p.id = u.id_perfil " + "where u.nome like '%" + nome + "%' and u.flag_ativo = 1";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/controle/liberacao/bloquear", function (req, res) {
  var data = req.body.data;
  var user = req.body.id_usuario;
  var month = data.split('/')[0];
  var year = data.split('/')[1];
  updateFechamentoMes(user, month, year, 0);
  res.send("success");
});
app.post("/controle/liberacao/salvar", function (req, res) {
  var data = req.body.data;
  var user = req.body.id_usuario;
  var month = data.split('/')[0];
  var year = data.split('/')[1];
  var sql = "SELECT * FROM tb_controle_fechamentos_mes f " + "where f.id_usuario = ? " + "and f.mes = ? " + "and f.ano = ? ";
  connection.query(sql, [user, month, year], function (err, rows, result) {
    if (err) throw err;
    if (rows.length > 0) {
      updateFechamentoMes(user, month, year, 1);
    } else {
      insertFechamentoMes(user, month, year);
    }
    res.send("success");
  });
});
app.post("/usuarios/salvar", function (req, res) {
  var usuario = req.body.usuario;
  var update = usuario.id_usuario !== undefined || usuario.id_usuario > 0;
  if (update) {
    var sqlUpdate = "update tb_usuarios " + "set nome = ? , id_perfil = ? , login = ? , flag_ativo = ?, email = ? ";
    if (usuario.senhaMD5 !== undefined) {
      sqlUpdate = sqlUpdate + " ,senha = '" + usuario.senhaMD5 + "'";
    }
    sqlUpdate = sqlUpdate + " where id_usuario = ? ";
    connection.query(sqlUpdate, [usuario.nome, usuario.id_perfil , usuario.login, usuario.ativo, usuario.email, usuario.id_usuario], function (err, result) {
      if (err) {
        console.log(err);
      }
      ;
      res.send(result);
    });
  } else {
    var sqlInsert = "insert into tb_usuarios " + "(nome, senha, id_perfil, login, flag_ativo, email) " + "values (?, ?, ?, ?, ?, ?) ";
    connection.query(sqlInsert, [usuario.nome, usuario.senhaMD5, usuario.id_perfil , usuario.login, usuario.ativo, usuario.email], function (err, result) {
      if (err) {
        console.log(err);
        //if()
        res.send(err);
      }
      ;
      res.send(result);
    });
  }
});
function updateFechamentoMes(user, month, year, flag) {
  var sql = "update tb_controle_fechamentos_mes f set f.flag_mes_aberto = ? " + "where f.id_usuario = ? " + "and f.mes = ? " + "and f.ano = ? ";
  connection.query(sql, [flag, user, month, year], function (err, rows, result) {
    if (err) throw err;
    return "success";
  });
}
function insertFechamentoMes(user, month, year) {
  var sql = "insert into tb_controle_fechamentos_mes (id_usuario, mes, ano, flag_mes_aberto) " + "values (?, ?, ?, ?)";
  connection.query(sql, [user, month, year, 1], function (err, rows, result) {
    if (err) throw err;
    return "success";
  });
}
app.post("/usuarios/apagar", function (req, res) {
  var entity = req.body.entity;
  if (entity !== undefined) {
    var sql = "update tb_usuarios u set u.flag_ativo = 0 " + "where u.id_usuario = ?";
    connection.query(sql, [entity.id_usuario], function (err, result) {
      if (err) throw err;
      res.send("sucesso");
    });
  }
  //res.send("Erro ao apagar usuário");
});
app.post("/usuarios/perfil/list", function (req, res) {
  var sql = "select id, nome, descricao from tb_perfis";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/controle/reembolso/tipo/list", function (req, res) {
  var sql = "select id, nome, descricao from tb_tipo_reembolso";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/controle/reembolso/status/list", function (req, res) {
  var sql = "select id, nome, descricao from tb_status_reembolso";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/controle/reembolso/notas/list", function (req, res) {
  var sql = "select * from tb_reembolso_notas where id_reembolso = ?";
  connection.query(sql, [req.body.reembolso.id], function (err, result) {
    if (err) throw err;
    res.send(result);
  });
})
app.post("/usuarios/dados/list", function (req, res) {
  var id_usuario = req.body.usuario.id_usuario;
  var sql = 'select IFNULL(du.telefone_residencial, "") telefone_residencial, telefone_celular, endereco, bairro, municipio, cep, cpf, cnpj, razao_social, tipo_contratacao, rg, orgao_emissor_rg, ct_numero, ct_sic, data_nascimento, nome_banco, agencia_banco, conta_banco, numero_ctps, pis_ctps, serie_ctps, uf_ctps, cargo, u.*, t.id id_contratacao, IFNULL(t.nome, "") nome_contratacao, t.descricao descricao_contratacao, ' + "DATE_FORMAT(du.data_nascimento,'%d/%m/%Y') data_nascimento " + "from tb_usuarios u " + "left join tb_dados_usuario du on du.id_usuario = u.id_usuario " + "left join tb_tipo_contratacao t on t.id = du.tipo_contratacao " + "where u.id_usuario = ?";
  connection.query(sql, [id_usuario], function (err, result) {
    if (err) throw err;
    res.send(result[0]);
  });
});
app.post("/usuarios/dados/salvar", function (req, res) {
  var usuario = req.body.usuario;
  var sqlSelect = "select * from tb_dados_usuario where id_usuario = ?"
  connection.query(sqlSelect, [usuario.id_usuario], function (err, rows, result) {
    if (err) throw err;
    if (rows.length < 1) {
      insertDadosUsuario(usuario);
    }
    updateDadosUsuario(usuario);
    res.send("success");
  });
});
function updateDadosUsuario(usuario) {
  var sql = "update tb_dados_usuario u " + "SET u.telefone_residencial = ?, " + "u.telefone_celular = ?, " + "u.endereco = ?, " + "u.bairro = ?, " + "u.municipio = ?, " + "u.cep = ?, " + "u.cpf = ?, " + "u.cnpj = ?, " + "u.razao_social = ?, " + "u.tipo_contratacao = ?, " + "u.rg = ?, " + "u.orgao_emissor_rg = ?, " + "u.ct_numero = ?, " + "u.ct_sic = ?, " + "u.data_nascimento =  STR_TO_DATE('" + usuario.data_nascimento + "','%d/%m/%Y'), " + "u.nome_banco = ?, " + "u.agencia_banco = ?, " + "u.conta_banco = ?, " + "u.numero_ctps = ?, " + "u.pis_ctps = ?, " + "u.serie_ctps = ?, " + "u.uf_ctps = ?, " + "u.tipo_contratacao = ?, " + "u.cargo = ? " + "where u.id_usuario = ?";
  connection.query(sql, [usuario.telefone_residencial, usuario.telefone_celular, usuario.endereco, usuario.bairro, usuario.municipio, usuario.cep, usuario.cpf, usuario.cnpj, usuario.razao_social, usuario.tipo_contratacao, usuario.rg, usuario.orgao_emissor_rg, usuario.ct_numero, usuario.ct_sic, usuario.nome_banco, usuario.agencia_banco, usuario.conta_banco, usuario.numero_ctps, usuario.pis_ctps, usuario.serie_ctps, usuario.uf_ctps, usuario.id_contratacao, usuario.cargo, usuario.id_usuario], function (err, result) {
    if (err) {
      console.log(err);
    }
    return "success";
  });
};
function insertDadosUsuario(usuario) {
  var sqlInsert = "insert into tb_dados_usuario " + "(id_usuario) " + "values (?)";
  console.log(sqlInsert);
  connection.query(sqlInsert, [usuario.id_usuario], function (err, result) {
    if (err) throw err;
    return "success";
  });
};
app.post("/usuarios/dados/contratacao/list", function (req, res) {
  var sql = "select * from tb_tipo_contratacao t";
  connection.query(sql, function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
app.post("/usuarios/trocar/senha", function (req, res) {
  var sql = "update tb_usuarios set senha = ? where id_usuario = ?";
  console.log(req.body);
  connection.query(sql, [req.body.usuario.senhaMD5, req.body.usuario.id], function (err, result) {
    if (err) throw err;
    res.send(result);
  });
});
function replaceAll(string, find, replace) {
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}
function escapeRegExp(string) {
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}