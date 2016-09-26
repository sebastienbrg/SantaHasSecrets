// create the module and name it scotchApp
        // also include ngRoute for all our routing needs    

    var scotchApp = angular.module('scotchApp', ['ngRoute', 'ngResource']);
    scotchApp.factory('Data', function(){

        return { appToken : localStorage.getItem("AppToken")};
    });
    // configure our routes
    scotchApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/santa', {
                templateUrl : 'partials/santa.html',
                controller  : 'santaController'
            })

            // route for the about page
            .when('/login', {
                templateUrl : 'partials/login.html',
                controller  : 'loginController'
            })
            .otherwise(
            {
              templateUrl : 'partials/login.html',
                controller  : 'loginController'  
            });
    });    

    //$('.datepicker').pickadate();