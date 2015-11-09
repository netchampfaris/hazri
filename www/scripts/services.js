angular.module('hazri.services', ['firebase'])


    .factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
        var ref = new Firebase("https://hazri.firebaseio.com/");
        return $firebaseAuth(ref);
    }])


    .factory("FirebaseUrl", function () {
        return {
            root: "https://hazri.firebaseio.com/"
        };
    })

    .factory("AttendanceService", function ($q) {
    
        var getAttendances = function () {

            var deferred = $q.defer();

            localforage.getItem('attendances').then(function (data) {
                deferred.resolve(data);
            });

            return deferred.promise;
        };

        return {
            getAttendances: getAttendances
        }
    })

    .factory("DBService", function ($q, FirebaseUrl) {

        var getData = function () {

            var deferred = $q.defer();
            var ref = new Firebase("https://hazri.firebaseio.com/");
            ref.on("value",
            function (snapshot) {
                deferred.resolve(snapshot.val());
            }, function (error) {
                console.log(error.code);
                defer.reject();
            });
            return deferred.promise;
        };

        return {
            getData: getData
        }
    })

  .factory('$cordovaGoogleAds', ['$q', '$window', function ($q, $window) {

    return {
      setOptions: function (options) {
        var d = $q.defer();

        $window.AdMob.setOptions(options, function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      createBanner: function (options) {
        var d = $q.defer();

        $window.AdMob.createBanner(options, function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      removeBanner: function () {
        var d = $q.defer();

        $window.AdMob.removeBanner(function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      showBanner: function (position) {
        var d = $q.defer();

        $window.AdMob.showBanner(position, function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      showBannerAtXY: function (x, y) {
        var d = $q.defer();

        $window.AdMob.showBannerAtXY(x, y, function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      hideBanner: function () {
        var d = $q.defer();

        $window.AdMob.hideBanner(function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      prepareInterstitial: function (options) {
        var d = $q.defer();

        $window.AdMob.prepareInterstitial(options, function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      },

      showInterstitial: function () {
        var d = $q.defer();

        $window.AdMob.showInterstitial(function () {
          d.resolve();
        }, function () {
          d.reject();
        });

        return d.promise;
      }
    };
  }]);