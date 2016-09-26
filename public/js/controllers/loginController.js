// create the controller and inject Angular's $scope
scotchApp.controller('loginController',['$scope', '$http', 'Data', '$location', function($scope, $http, Data, $location) {
 
	var participants = [];
    var participant = undefined;
    var requestPwd = false;
    
    if(Data.appToken != ""){
    	console.log("AppToken is set to " + Data.appToken)
        $location.path("/santa");
    }
    console.log("appToken : " + Data.appToken)
    var typedPwd = "";
    var reTypedPwd = "";
    var errorMsg = "";

    $http.get("/api/participants").success(function (response)
    {
        $scope.participants= response;
        console.log(response);
    });

    $scope.selectedParticipant = function(participant)
    {
        $scope.participant = participant;
    	$http.get("/api/participantHasPw/" + participant).success(function (response)
	    {
	        $scope.requestPwd = (response == 0);
	        console.log("Received (participant has psw)"  + response);
	    });
    };

    $scope.createPassword = function()
    {
		if($scope.typedPwd.length == 0 )
			$scope.errorMsg = "Le mot de passe doit être renseigné !";
		else if($scope.typedPwd != $scope.reTypedPwd)
			$scope.errorMsg = "T'as tapé 2 mots de passe différents !";
		else
		{
			$scope.errorMsg = "";

			$http.post("/api/createPassword/" + $scope.participant + "/" + $scope.typedPwd).success(function (response)
		    {
		        $scope.requestPwd = false;
		        console.log("Ok, passwd cretaed");
		    });
		}
    };

    $scope.login = function($rootScope)
    {
		$http.get("/api/login/" + $scope.participant + "/" + $scope.typedPwd ).success(function (response)
	    {
	    	if(response.ok != 1)
	    	{
    			$scope.typedPwd = "";
    			$scope.reTypedPwd = "";
				$scope.errorMsg = " Mauvais mdp !"
	    	}
	    	else
			{
				$scope.errorMsg = "";
				Data.appToken = response.appToken;
				localStorage.setItem("AppToken",response.appToken);
				$location.path("/santa");
			}
	        console.log("Received "  + response.appToken);
	    });
    }
 }]);