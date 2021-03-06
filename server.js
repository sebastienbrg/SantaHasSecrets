var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jsonfile = require('jsonfile');
var md5 = require('md5');

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var participants = [];
var incompatibilies = {};
var activationKeys = {};

function loadParticipants(){
	var file = './saves/participants.json'
 
	jsonfile.readFile(file, function(err, readData) {
		if(err)
		{
			console.log("Erreur : " + err);
			participants = [];
			incompatibilies= {};
			return;
		}
  		participants = readData.participants;
  		incompatibilies = readData.incompatibilies;
  		activationKeys = readData.activationCodes;
		participants.sort();
	});
}
var allMessages = [];
function loadMessages(){
	var file = './saves/messages.json'
 
	jsonfile.readFile(file, function(err, readData) {
		if(err)
		{
			console.log("Erreur : " + err);
			return;
		}
  		allMessages = readData;
	});
}
loadParticipants();
loadMessages();

var tokens = [];
var passWords = {};

var loadPasswords = function()
{
	var file = './saves/pswd.json'
 
	jsonfile.readFile(file, function(err, readData) {
		if(err)
		{
			console.log("Erreur : " + err);
			passWords = {};
			return;
		}
  		passWords = readData;
	});
};
loadPasswords();

var loadAssignments = function()
{
	console.log("loadAssignments");
	var file = './saves/data.json'
 
	jsonfile.readFile(file, function(err, readData) {
		if(err)
		{
			console.log("Erreur : " + err);
			assignments = {};
			return;
		}

  		participants.forEach(function(parti)
  		{
  			if(readData[parti] == undefined)
  				assignments[parti] = [];
  			else
  			{
				var assigns = [];
				for(var i = 0;i < readData[parti].length; ++i)
				{
					assigns.push({ num: (i+1), petitCadeau : decrypt(readData[parti][i].petitCadeau),
									grosCadeau : decrypt(readData[parti][i].grosCadeau)});
				}
				assignments[parti] = assigns;
  			}
  		});
		setAssignmentsStatus();
	});
};
var assignments = {};
var finalAssignment = {};

var setAssignmentsStatus = function()
{

	var maxRound = -1;
	//Get the number of rounds fully completed
	participants.forEach(function(parti)
	{
		if(assignments[parti] == undefined)
			maxRound = 0;
		else if(maxRound > assignments[parti].length || maxRound == -1)
			maxRound = assignments[parti].length;
	});
	console.log("setAssignmentsStatus " + maxRound);

	var finalRound = -1;
	//for all ended rounds, see if impossible or final
	for(var round = 0; round< maxRound; ++round)
	{
		var seenImpossible = false;
		participants.forEach(function(parti)
		{
			if(assignments[parti][round].petitCadeau == "IMPOSSIBLE"
				|| assignments[parti][round].grosCadeau == "IMPOSSIBLE")
				seenImpossible = true;
		});
		//If impossible, set impossible
		if(seenImpossible )
		{
			participants.forEach(function(parti)
			{
				assignments[parti][round].state = "IMPOSSIBLE";
			});
		}
		else // if not impossible => final
		{
			participants.forEach(function(parti)
			{
				assignments[parti][round].state = "FINAL";
				finalAssignment[parti] = { "petitCadeau" : assignments[parti][round].petitCadeau,
											"grosCadeau" : assignments[parti][round].grosCadeau};
				console.log("found a final round " + round);
				finalRound = round;
			});
			break;
		}
	}
	// If there is a final round, the others are useless
	if(finalRound > -1)
	{
		participants.forEach(function(parti)
		{
			for(var round = finalRound + 1; round < assignments[parti].length; ++round)
			{
				assignments[parti][round].state = "EXTRA";

			}
			console.log("splicing tab");
			assignments[parti] = assignments[parti].splice(0,finalRound+1);
		});
	}
};

loadAssignments();


var getGlobalAssignments = function (userName)
{
	var globalAssignments = [];
	for(var i = 0; i < participants.length; ++i)
	{
		var parti = participants[i];
		var assigns = { "name": parti };
		assigns.assignments = [];
		if(parti == userName)
		{
			assigns.assignments = assignments[parti];
		}
		else
		{
			for(var j = 0; j< assignments[parti].length; ++j)
			{
				var a = {};
				a.petitCadeau = "Surprise !";
				a.grosCadeau = "Surprise !";
				assigns.assignments.push(a);
			}
		}
		globalAssignments.push(assigns);
	}
	return globalAssignments;
};



var saveAssignments = function()
{
	console.log("saving");

	var file = './saves/data.json';

	var cryptedAssignments = {};
	participants.forEach(function(parti)
	{
		var assi = [];
		for(var j = 0; j< assignments[parti].length; ++j)
		{
			var a = {};
			a.petitCadeau = encrypt(assignments[parti][j].petitCadeau);
			a.grosCadeau = encrypt(assignments[parti][j].grosCadeau);
			assi.push(a);
		}
		cryptedAssignments[parti] = assi;
	});
 
	jsonfile.writeFile(file, cryptedAssignments, function (err) {
		if(err)
  			console.error(err)
  		else
  			console.log("Saved the assignments!");
	});
};

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
};

var getCompatibilityList = function(user, round, petitCadeau)
{

	var alreadyUsed = getUsedUsersForRound(round, petitCadeau);

	//console.log("Fetching compatibilityList for " + user + " On round " + round);
	var compatibilityList = [];
	for(var i =0; i < participants.length; ++i)
	{
		var parti = participants[i];
		//console.log("Participant " + parti + "examine");
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
};

var getAssignment = function(user)
{
	if(assignments[user] == undefined)
		assignments[user] = [];

	var round = assignments[user].length;
	var compatibilityListPetitKdo = getCompatibilityList(user, round, true);
	var compatibilityListGrosKdo = getCompatibilityList(user, round, false);

	var assign = {};
	if(compatibilityListPetitKdo.length < 1 
		|| compatibilityListGrosKdo.length < 1)
	{
		assign.petitCadeau = "IMPOSSIBLE";
		assign.grosCadeau = "IMPOSSIBLE";
	}
	else
	{
		assign.petitCadeau = compatibilityListPetitKdo[Math.floor(Math.random() *100) % compatibilityListPetitKdo.length];
		//console.log("Compat List Petit: " + compatibilityListPetitKdo + " Taken : " + assign.petitCadeau);
		var index = compatibilityListGrosKdo.indexOf(assign.petitCadeau);
		//console.log("Compat List Petit: " + compatibilityListGrosKdo);
		if(index >= 0)
		{
			compatibilityListGrosKdo.splice(index, 1);
			//console.log("Compat List after petit: " + compatibilityListGrosKdo);
		}
		if(compatibilityListGrosKdo.length > 0)
			assign.grosCadeau = compatibilityListGrosKdo[Math.floor(Math.random() *100) % compatibilityListGrosKdo.length];
		else
		{
			assign.petitCadeau = "IMPOSSIBLE";
			assign.grosCadeau = "IMPOSSIBLE";
		}
	}

	//console.log(assign);
	assign.num = (assignments[user].length +1);
	assignments[user][assignments[user].length] = assign;
	saveAssignments();
	setAssignmentsStatus();
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

app.get('/api/currentUser/:token', function(req, res)
{
	var user = tokens[req.params.token];
	res.json(user);	
});

app.get('/api/assignment/:token', function(req, res)
{	
	var user = tokens[req.params.token];
	if(user)
	{
		console.log("Adding one assignment");
		console.log("user : " + user);
		getAssignment(user);
		
		res.json(getGlobalAssignments(user));	
	}
	else
	{
		console.log('Returning  no assignment');
	}	
});

function getUsersFinalGifts(username)
{
	var userIOfferSmall = "";
	var userIOfferBig = "";
	if(assignments[username] !== undefined)
	{
		assignments[username].forEach(function(round){
			if(round.state == "FINAL")
			{
				userIOfferSmall = round.petitCadeau;
				userIOfferBig = round.grosCadeau;
			}
		});
	}	
	return { "petitCadeau" : userIOfferSmall,
				"grosCadeau" : userIOfferBig};
}



function getMessages(username)
{

	var myFinalGifties = finalAssignment[username];
	console.log("Presents to :  ",myFinalGifties);
	var msgFinal = {"monPetitCadeau" : [], "monGrosCadeau" : []};
	if(myFinalGifties !== undefined)
	{
		var userThatHasMySmallPresentsBig ="";
		var userThatHasMyBigPresentsSmall ="";
		participants.forEach(function(participantName)
		{
			var ass = finalAssignment[participantName];
			if(ass.petitCadeau == myFinalGifties.grosCadeau)
			{
				userThatHasMySmallPresentsBig = participantName
			}
			if(ass.grosCadeau == myFinalGifties.petitCadeau)
			{
				userThatHasMyBigPresentsSmall = participantName;
			}
		});
		console.log("userThatHasMySmallPresentsBig", userThatHasMySmallPresentsBig);
		console.log("userThatHasMyBigPresentsSmall", userThatHasMyBigPresentsSmall);

		if(userThatHasMyBigPresentsSmall !== "" && userThatHasMySmallPresentsBig !== "")
		{
			console.log("All message", allMessages);
			var filtered = allMessages.filter(function(msg){
				return (msg.from == username || msg.to == username);
			});
			console.log("filtered", filtered);
			var anonymousMessages = filtered.map(function(msg){
				var anMsg = {};
				anMsg.content = msg.content;
				if(msg.from == username)
				{
					anMsg.from = "Moi";
					anMsg.myPetitCadeau =  (msg.to == userThatHasMySmallPresentsBig);
				}
				else {
					anMsg.from = "Other";
					anMsg.myPetitCadeau = (msg.from == userThatHasMySmallPresentsBig);
				}
				return anMsg;
			});
			console.log("anonymousMessages",anonymousMessages);
			anonymousMessages.forEach(function(msg){
				if(msg.myPetitCadeau)
				{
					msg.myPetitCadeau = undefined;
					msgFinal.monPetitCadeau.push(msg)
				}
				else
				{
					msg.myPetitCadeau = undefined;
					msgFinal.monGrosCadeau.push(msg)	
				}
			});
			console.log("anonymousMessages", anonymousMessages);
		}
	}
	return msgFinal;
}

app.get('/api/messages/:token', function(req, res)
{	
	var user = tokens[req.params.token];
	if(user)
	{
		console.log("Loading messages for user " + user);
		res.json(getMessages(user));	
	}
	else
	{
		console.log('Returning  no assignment');
	}	
});



app.get('/api/assignments/:token', function(req, res)
{
	var user = tokens[req.params.token];
	res.json(getGlobalAssignments(user));
});

var saveMessages = function()
{
	var file = './saves/messages.json';

	jsonfile.writeFile(file, allMessages, function (err) {
		if(err)
  			console.error(err)
  		else
  			console.log("Saved the messages!");
	});
};

app.get('/api/participantHasPw/:user', function(req, res)
{
	res.json((passWords[req.params.user] != undefined) ? 1 : 0);
});
app.post("/api/newMessage/:token", function(req, res)
{
	var user = tokens[req.params.token];

	var myFinalGifties = finalAssignment[user];
	var userToBeGifted = myFinalGifties.grosCadeau;
	var msg  = {"from" : user, "content" : req.body.msg.content};
	var toMyPetitCadeau = (req.body.msg.to == "myPetitCadeau");
	if(toMyPetitCadeau)
	{
		userToBeGifted = myFinalGifties.petitCadeau;
	}

	participants.forEach(function(participantName)
	{
		var ass = finalAssignment[participantName];
		if((toMyPetitCadeau && ass.grosCadeau == userToBeGifted)
			|| ( !toMyPetitCadeau && ass.petitCadeau == userToBeGifted))
		{
			msg.to = participantName;
		}
	});
	
	allMessages.push(msg);
	saveMessages();
	console.log("Recieved a message ", msg)
	res.send("OK");
});

app.post("/api/createPassword/:user/:pwd/:activationKey", function(req, res)
{

	if(activationKeys[req.params.user] === req.params.activationKey){
		passWords[req.params.user] = md5(req.params.pwd);
		var file = './saves/pswd.json'
	 
		jsonfile.writeFile(file, passWords, function (err) {
			if(err)
	  			console.error(err)
	  		else
	  			console.log("Saved the pwd!");
		});
		res.send("OK");
	}
	else{
		res.send("BadKey");
	}
});

app.get("/api/login/:user/:pwd", function(req, res)
{
	var answer = {};
	if(passWords[req.params.user] == undefined)
		answer.ok = 0;
	else
	{
		if(passWords[req.params.user] == md5(req.params.pwd))
		{
			answer.ok = 1;
			answer.appToken = "" + md5(req.params.user) + "_" + Date.now();
			tokens[answer.appToken] = req.params.user;
			console.log("password authentication ok for " + req.params.user);
		}
		else
		{
			answer.ok = 0;
		}
	}
	res.json(answer);
});

app.listen(process.env.PORT || 80, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

  