
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
        $("#myAssignments").show();
        $("#otherAssignments").hide();
    };
    $scope.showOthersAssignments = function(){
        $("#myAssNav").removeClass("active");
        $("#AssListNav").addClass("active");
        $("#myAssignments").hide();
        $("#otherAssignments").show();
    };

}]);