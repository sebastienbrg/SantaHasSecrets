
// create the controller and inject Angular's $scope
scotchApp.controller('santaController',['$scope', '$http', 'Data', '$location', function($scope, $http, Data, $location) {
    
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
    var participants = [];
    $scope.participant = Data.user;
    var globalAssignments = {};
    $scope.appToken = Data.appToken;

    if(Data.appToken == "")
    {
        $location.path("/login");
    }

    console.log(" Token : " + Data.appToken + ", User : " + Data.user);

    $http.get("/api/participants").success(function (response)
    {
        $scope.participants= response;
        console.log(response);
    });

    $scope.loadAssignments = function(participantName)
    {
        console.log("participant is " + $scope.participant);

        $http.get("/api/assignments/" + $scope.appToken).success(function(response)
        {
            $scope.setGlobalAssignments(response);
            
        });
    }; 


    $scope.addANewAssignment = function(token)
    {
        if($scope.participant == undefined)
            return;
        $http.get("/api/assignment/" + $scope.appToken).success(function(response)
        {
            $scope.setGlobalAssignments(response);
        });
    };


    $scope.disconnect = function()
    {
        $scope.appToken = "";
        $scope.participant = "";
        $location.path("/login");
    }

    $scope.loadAssignments();

}]);