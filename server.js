var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');

var participants = ["Marceline", "Jean-Michel", "Caroline", "Olivier", "Sandrine", "Titof", "Cécile", "Seb"];

var assignments = {
	"Jean-Michel" : [
		{ 
			petitCadeau : participants[0],
			grosCadeau : participants[2]
		},
		{ 
			petitCadeau : participants[5],
			grosCadeau : participants[4]
		}
		]
		};


var getAssignment = function(user)
{
	if(assignments[user] == undefined)
		assignments[user] = [];

	var index1 = (Math.random() *100) % participants.length;
	var index2 = Math.floor((Math.random() *100) % participants.length);
	console.log("Index 1 : " + index1 + " Index 2 : " + index2);

	var assign = { 
			petitCadeau : participants[Math.floor((Math.random() *100) % participants.length)],
			grosCadeau : participants[Math.floor((Math.random() *100) % participants.length)]
		};
	console.log(assign);
	assignments[user][assignments[user].length] = assign;
}

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.static('public'));


app.get('/api/participants', function(req, res)
{
	console.log("Returning all participants");
	res.json(participants);	
});


app.get('/api/assignment/:user', function(req, res)
{	
	if(req.params.user)
	{
		console.log("Adding one assignment");
		console.log("user : " + req.params.user);
		getAssignment(req.params.user);
		
		res.json(assignments[req.params.user]);		
	}
	else
	{
		console.log('Returning  no assignment');
	}	
});

app.get('/api/assignments/:user', function(req, res)
{
	res.json(assignments[req.params.user]);
});







var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});