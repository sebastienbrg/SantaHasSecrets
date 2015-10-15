// create the module and name it scotchApp
        // also include ngRoute for all our routing needs
    var scotchApp = angular.module('scotchApp', ['ngRoute', 'ngResource', 'ui.bootstrap.datetimepicker']);

    // configure our routes
    scotchApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/home', {
                templateUrl : 'partials/home.html',
                controller  : 'santaController'
            })

            // route for the about page
            .when('/about', {
                templateUrl : 'partials/about.html',
                controller  : 'santaController'
            })

            // route for the contact page
            .when('/contact', {
                templateUrl : 'partials/contact.html',
                controller  : 'contactController'
            })
            .otherwise(
            {
              templateUrl : 'partials/home.html',
                controller  : 'santaController'  
            });
    });    

    scotchApp.controller('aboutController', function($scope) {
        $scope.message = 'Look! I am an about page.';
    });

    scotchApp.controller('contactController', function($scope) {
        $scope.message = 'Contact us! JK. This is just a demo.';
    });

    //$('.datepicker').pickadate();