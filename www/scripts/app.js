

angular.module('hazri', ['ionic', 'firebase', 'hazri.controllers', 'hazri.services', 'ionic-material'])

.run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        //if (window.cordova && window.cordova.plugins.Keyboard) {
        //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //}
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }


        //for solving windows phone issues
        Firebase.INTERNAL.forceWebSockets(); 


        Auth.$onAuth(function (authData) {
            if (authData) {
                console.log("Logged in as:", authData.uid);
                $location.path('/select');
            } else {
                console.log("Logged out");
                $location.path('/login');
            }
        });


        $rootScope.logout = function () {
            console.log("Logging out from the app");
            Auth.$unauth();
        }


        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });

       

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
        controller: 'LoginCtrl',
        resolve: {
            // controller will not be loaded until $waitForAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $waitForAuth returns a promise so the resolve waits for it to complete
                    return Auth.$waitForAuth();
                }]
        }
    })
    .state('signup', {
        url: "/signup",
        templateUrl: "templates/signup.html",
        controller: 'LoginCtrl'
    })

    .state('select', {
        url: "/select",
        templateUrl: "templates/select.html",
        controller: 'SelectCtrl',
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
                }]
        }
    })

    .state('attendance', {
        url: "/attendance",
        templateUrl: "templates/attendance.html",
        controller: 'AttendanceCtrl',
        params: {
            "selected": null
        },
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
                }]
        }
    })

    .state('viewAttendance', {
        url: "/viewattendance",
        templateUrl: "templates/view_attendance.html",
        controller: 'ViewAttendanceCtrl',
        params: {
            "selected": null,
            "totalStudents":0
        },
        resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
                }]
        }
    })




    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');

});