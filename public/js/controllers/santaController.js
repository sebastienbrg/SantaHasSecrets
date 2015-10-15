
// create the controller and inject Angular's $scope
scotchApp.controller('santaController',['$scope', '$http',  function($scope, $http) {
    
    var participants = [];
    var participant = undefined;
    var assignments = {};

    $http.get("/api/participants").success(function (response)
    {
        $scope.participants= response;
        console.log(response);
    });
  $scope.setParticipant = function(participantName)
    {
        $scope.participant = participantName;
        console.log("participant is " + $scope.participant);
        //window.location.replace("#about");

        $http.get("/api/assignments/" + $scope.participant).success(function(response)
        {
            $scope.assignments = response;
            console.log(response);
        });
    }; 

}]);