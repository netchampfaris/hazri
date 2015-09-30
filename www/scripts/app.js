angular.module('hazri', ['ionic', 'firebase', 'hazri.controllers', 'hazri.services', 'hazri.filters', 'ngCordova','pickadate' ,'angular.filter'])

.run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicPopup, $state, $ionicHistory, $cordovaGoogleAds) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        //if (window.cordova && window.cordova.plugins.Keyboard) {
        //    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        //}
        //if (window.StatusBar) {
        //    // org.apache.cordova.statusbar required
        //    StatusBar.styleDefault();
        //}

        if (window.StatusBar) {
            if (ionic.Platform.isAndroid()) {
                StatusBar.backgroundColorByHexString("#388E3C");
            } else {
                StatusBar.styleLightContent();
            }
        }

        if (AdMob) {
            var admobid = {};
            if (/(android)/i.test(navigator.userAgent)) { // for android
                admobid = {
                    banner: 'ca-app-pub-7044182556888101/2854065270',
                    interstitial: 'ca-app-pub-7044182556888101/9603446074'
                };
            } else if (/(ipod|iphone|ipad)/i.test(navigator.userAgent)) { // for ios
                admobid = {
                    banner: 'ca-app-pub-xxx/zzz',
                    interstitial: 'ca-app-pub-xxx/kkk'
                };
            } else { // for windows phone
                admobid = {
                    banner: 'ca-app-pub-7044182556888101/1800977670',
                    interstitial: 'ca-app-pub-xxx/kkk'
                };
            }
            console.log("showing ads");
            if (AdMob) AdMob.createBanner({
                adId: admobid.banner,
                position: AdMob.AD_POSITION.BOTTOM_CENTER,
                autoShow: true
            });

        }

        
        //for solving windows phone issues
        Firebase.INTERNAL.forceWebSockets();


        Auth.$onAuth(function (authData) {
            if (authData) {
                console.log("Logged in as:", authData.uid);
                $location.path('/main');
            } else {
                console.log("Logged out");
                $location.path('/login');
            }
        });

        $rootScope.logout = function () {
            var confirmPopup = $ionicPopup.confirm({
            title: 'Logout ?',
            template: '',
            okType: 'default-primary-color text-primary-color',
            okText: 'Logout'
            });
            confirmPopup.then(function (res) {
                if (res) {
                    console.log("Logging out from the app");
                    Auth.$unauth();
                } else {
                    console.log("logout cancelled");
                }
            });
        }

        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });
    });


    $ionicPlatform.registerBackButtonAction(function (event) {
        if ($state.current.name == "main" || $state.current.name == "login") {
            $ionicPopup.confirm({
                title: 'Exit Hazri',
                template: 'Are you sure you want to exit?',
                okText: 'Exit',
                okType: 'accent-color text-primary-color'
            }).then(function (res) {
                if (res) {
                    ionic.Platform.exitApp();
                }
            })
        }
        else
            $ionicHistory.goBack();
    }, 101);
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
    
    .state('main', {
        url: "/main",
        templateUrl: "templates/dashboard.html",
        controller: 'MainCtrl',
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

    .state('details', {
        url: "/details",
        templateUrl: "templates/details.html",
        controller: 'DetailCtrl',
        params: {
            "att":null
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
            "totalStudents":0,
            "bStart":null,
            "bEnd":null
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

})


.directive('scrollWatch', function ($rootScope) {
    return function (scope, elem, attr) {
        var start = 0;
        var threshold = 150;

        elem.bind('scroll', function (e) {
            if (e.detail.scrollTop - start > threshold) {
                $rootScope.slideHeader = true;
            } else {
                $rootScope.slideHeader = false;
            }
            if ($rootScope.slideHeaderPrevious >= e.detail.scrollTop - start) {
                $rootScope.slideHeader = false;
            }
            $rootScope.slideHeaderPrevious = e.detail.scrollTop - start;
            $rootScope.$apply();
        });
    };
});