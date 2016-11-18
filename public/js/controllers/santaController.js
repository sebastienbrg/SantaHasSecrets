
// create the controller and inject Angular's $scope
scotchApp.controller('santaController',['$scope', '$http', 'Data', '$location', function($scope, $http, Data, $location) {
    var participants = [];
    var globalAssignments = {};

    if(Data.appToken == ""){
        console.log("AppToken is not set ");
        $location.path("/login");
        return;
    }
    
    $scope.participant = Data.participant;

    function loadParticipants(){
        $http.get("/api/participants").success(function (response)
        {
            $scope.participants= response;
            $scope.loadAssignments();
            $scope.showMyAssignments();   
            console.log(response);
        });
    };
    loadParticipants();
    
    $scope.setGlobalAssignments = function(assignments){
        $scope.globalAssignments = assignments;
        assignments.some(function(userAss)
            { 
                if(userAss.name == $scope.participant){
                    $scope.userAssignements = userAss;
                    if(userAss.assignments.length > 0)
                    {
                        console.log(userAss);
                        $scope.isDone = (userAss.assignments[userAss.assignments.length -1].state =="FINAL");
                    }
                    else{
                        $scope.isDone = false;
                    }
                    console.log("$scope.isDone " + $scope.isDone);
                     return true;
                }
                return false;
            });
        
        console.log(assignments);
    };
       

    $scope.loadAssignments = function(participantName)
    {
        console.log("participant is " + $scope.participant);

        $http.get("/api/assignments/" + Data.appToken).success(function(response)
        {
            $scope.setGlobalAssignments(response);  
            $scope.loadMessages();          
        });
    }; 


    $scope.addANewAssignment = function(token)
    {
        if($scope.participant == undefined)
            return;
        $http.get("/api/assignment/" + Data.appToken).success(function(response)
        {
            $scope.setGlobalAssignments(response);
        });
    };


    $scope.disconnect = function()
    {
        Data.appToken = "";
        localStorage.setItem("AppToken", "")
        $scope.participant = "";
        $location.path("/login");
    }
    $scope.showMyAssignments = function(){
        $("#myAssNav").addClass("active");
        $("#AssListNav").removeClass("active");
        $("#Messages").removeClass("active");
        $("#myAssignments").show();
        $("#otherAssignments").hide();
        $("#MessagesDiv").hide();
    };
    $scope.showOthersAssignments = function(){
        $("#myAssNav").removeClass("active");
        $("#AssListNav").addClass("active");
        $("#Messages").removeClass("active");
        $("#myAssignments").hide();
        $("#otherAssignments").show();
        $("#MessagesDiv").hide();
    };
    $scope.showMessages = function(){
        $("#myAssNav").removeClass("active");
        $("#AssListNav").removeClass("active");
        $("#Messages").addClass("active");
        $("#myAssignments").hide();
        $("#otherAssignments").hide();
        $("#MessagesDiv").show();
    };

    $scope.sendMessageMonPetitCadeau = function()
    {
        var msgContent = $("#messageContentPetit").val();   
        var msg = { "from" : "Moi", "content" : msgContent, "to" : "myPetitCadeau"};
        $scope.sendMessage(msg);    
        $scope.messages.monPetitCadeau.push(msg);
        $("#messageContentPetit").val("");
    }
    $scope.sendMessageMonGrosCadeau = function()
    {
        var msgContent = $("#messageContentGros").val();   
        var msg = { "from" : "Moi", "content" : msgContent, "to" : "myGrosCadeau"};
        $scope.sendMessage(msg);    
        $scope.messages.monGrosCadeau.push(msg);
        $("#messageContentGros").val("");
    }
    $scope.sendMessage = function(msg)
    {
        
        $http.post("/api/newMessage/" + Data.appToken,{ "msg" : msg});
    }

    $scope.getMonPetitCadeau = function()
    {
        if($scope.userAssignements == undefined)
            return "";
        return $scope.userAssignements.assignments[$scope.userAssignements.assignments.length -1].petitCadeau;
        
    }
    $scope.getMonGrosCadeau = function()
    {
        if($scope.userAssignements == undefined)
            return "";
        return $scope.userAssignements.assignments[$scope.userAssignements.assignments.length -1].grosCadeau;
        
    }

    $scope.loadMessages = function()
    {
        console.log("Loading messages");

        $http.get("/api/messages/" + Data.appToken).success(function(response)
        {
            console.log("Messages : " , response);
            $scope.messages = response;            
        });
    }; 

    //$scope.messages = { "monPetitCadeau" : [ { "content" : "message 1", "from" : "Moi"}, { "content" : "message 2", "from" : "Other"}] };

}]);