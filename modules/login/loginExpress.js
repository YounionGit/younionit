
var pathAbsolute = 'C:/Users/Younion/WebstormProjects/younionit/';

var express=require("express");

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '192.168.25.106',
    user     : 'webuser',
    password : '1234',
    database : 'youniondb'
});

connection.connect();

//var app = express();
// New call to compress contenta
//app.use(express.compress());
var app = express();

app.use('/css', express.static(pathAbsolute + '/css'));
app.use('/js', express.static(pathAbsolute + '/js'));
app.use('/modules', express.static(pathAbsolute + '/modules'));
app.use('/templates', express.static(pathAbsolute + '/templates'));
app.use('/img', express.static(pathAbsolute + '/img'));
app.use(express.static(__dirname));

//app.use(express.static(__dirname + '/app'));
app.listen(8080);