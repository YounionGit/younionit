var express=require("express");

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '192.168.25.106',
    user     : 'webuser',
    password : '1234',
    database : 'youniondb'
});

connection.connect();