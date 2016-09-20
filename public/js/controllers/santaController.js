
// create the controller and inject Angular's $scope
scotchApp.controller('santaController',['$scope', '$http', 'Data', '$location', function($scope, $http, Data, $location) {
    
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
            
            $scope.globalAssignments = response;
            response.some(function(userAss)
                { 
                    if(userAss.name == $scope.participant){
                         $scope.userAssignements = userAss;
                         return true;
                    }
                    return false;
                });
            
            console.log(response);
            console.log("User ass = ");
            console.log($scope.userAssignements);
        });
    }; 


    $scope.addANewAssignment = function(token)
    {
        if($scope.participant == undefined)
            return;
        $http.get("/api/assignment/" + $scope.appToken).success(function(response)
        {
            $scope.globalAssignments = response;
            console.log(response);
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