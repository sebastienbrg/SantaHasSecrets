
// create the controller and inject Angular's $scope
scotchApp.controller('welcomeController',['$scope', '$http', 'Data', '$location', function($scope, $http, Data, $location) {
    
    $scope.tokenLookedAt = false;
    $scope.timerDone = false;
    //Loading user info
    function getUserFromToken(){
        if(Data.appToken != "")
        {
            $http.get("/api/currentUser/"+Data.appToken).success(function (response)
            {
                $scope.tokenLookedAt = true;
                console.log("User from token : " + response);
                if(response == ""){
                    Data.appToken = "";
                    Data.participant = "";
                    localStorage.setItem("AppToken", "");
                }
                else{
                    Data.participant = response;
                }
                goToNextPageIfReady();
            });
        }
        else
        {
            console.log("No token");
            $scope.tokenLookedAt = true;
            goToNextPageIfReady();
        }
    };

    setTimeout(function(){
        $scope.timerDone = true;
        goToNextPageIfReady();
     }, 1000);

    function goToNextPageIfReady(){
        if($scope.tokenLookedAt && $scope.timerDone){
            if(Data.appToken == ""){
                console.log("Going to login");
                $location.path("/login");
                $scope.$apply();
            }
            else{
                console.log("Going to santa");
                $location.path("/santa");
                $scope.$apply();
            }
        }            
    };
    getUserFromToken();    

}]);