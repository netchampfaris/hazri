

angular.module('hazri', ['ionic', 'firebase', 'hazri.controllers'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

    });
})

.config(function ($stateProvider, $urlRouterProvider) {
    
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // State to represent Login View
    .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'
    })
    .state('signup', {
        url: "/signup",
        templateUrl: "templates/signup.html",
        controller: 'LoginCtrl'
    })


    .state('select', {
        url: "/select",
        templateUrl: "templates/select.html",
        controller: 'SelectCtrl'
    })

    .state('attendance', {
        url: "/attendance",
        templateUrl: "templates/attendance.html",
        controller: 'AttendanceCtrl'
    })





    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});