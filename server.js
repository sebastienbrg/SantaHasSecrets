var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');


var participants = ["Marceline", "Jean-Michel", "Caroline", "Olivier", "Sandrine", "Titof", "Cécile", "Seb"];
var incompatibilies = {"Marceline": ["Jean-Michel"],
					   "Caroline" : ["Olivier"],
					   "Sandrine" : ["Titof"],
					   "Cécile"  : ["Seb"],
					   "Jean-Michel": ["Marceline"],
					   "Olivier" : ["Caroline"],
					   "Titof" : ["Sandrine"],
					   "Seb"  : ["Cécile"] };


var loadAssignments = function()
{
	var file = './saves/data.json'
 
	jsonfile.readFile(file, function(err, readData) {
		if(err)
		{
			console.log("Erreur : " + err);
			assignments = {};
			return;
		}

  		assignments = readData;
	});
}
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
loadAssignments();


var saveAssignments = function()
{
	console.log("saving");

	var file = './saves/data.json'
 
	jsonfile.writeFile(file, assignments, function (err) {
		if(err)
  			console.error(err)
  		else
  			console.log("Saved the assignments!");
	});
}

var getUsedUsersForRound = function(round, petitCadeau) 
{
	var used = [];
	for(var i =0; i < participants.length; ++i)
	{
		var parti = participants[i];
		if(assignments[parti] != undefined && assignments[parti].length > round)
		{
			if(petitCadeau)
				used.push(assignments[parti][round].petitCadeau)
			else
				used.push(assignments[parti][round].grosCadeau)
		}
	}	
	return used;
}

var getCompatibilityList = function(user, round, petitCadeau)
{

	var alreadyUsed = getUsedUsersForRound(round, petitCadeau);

	console.log("Fetching compatibilityList for " + user + " On round " + round);
	var compatibilityList = [];
	for(var i =0; i < participants.length; ++i)
	{
		var parti = participants[i];
		console.log("Participant " + parti + "examine");
		if(user != parti)
		{
			//root incompatibility
			if(incompatibilies[user].indexOf(parti) == -1)
			{
				if(alreadyUsed.indexOf(parti) == -1)
					compatibilityList.push(parti);
			}
		}
	}
	return compatibilityList;
}

var getAssignment = function(user)
{
	if(assignments[user] == undefined)
		assignments[user] = [];

	var round = assignments[user].length;
	var compatibilityList = getCompatibilityList(user, round);

	var assign = {};
	if(compatibilityList.length < 2)
	{
		assign.petitCadeau = "IMPOSSIBLE";
		assign.grosCadeau = "IMPOSSIBLE";
	}
	else
	{
		assign.petitCadeau = compatibilityList[Math.floor(Math.random() *100) % compatibilityList.length];
		compatibilityList.slice(compatibilityList.indexOf(assign.petitCadeau), 1);
		assign.grosCadeau = compatibilityList[Math.floor(Math.random() *100) % compatibilityList.length];
	}

	console.log(assign);
	assignments[user][assignments[user].length] = assign;
	saveAssignments();
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