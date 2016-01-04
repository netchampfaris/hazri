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
        };
    })

    .factory("DBService", function ($q, FirebaseUrl, $cordovaToast) {
        var ref = new Firebase(FirebaseUrl.root);

        var fetchData = function () {
            var deferred = $q.defer();

            localforage.getItem('hazridata').then(function (data) {
                if (!data) {    //if no data then download it
                    console.log('no data');
                    var hazridata = {};
                    //firebase fetch
                    ref.limitToFirst(8).once("value",
                        function (snapshot) {

                            hazridata.departments = snapshot.val().departments;
                            hazridata.studentCount = snapshot.val().studentCount;
                            hazridata.students = snapshot.val().students;
                            hazridata.subjects = snapshot.val().subjects;
                            hazridata.teachers = snapshot.val().teachers;
                            console.log(hazridata);

                            localforage.setItem('hazridata', hazridata).then(function () {
                                console.log('firebase data retrieved successfully');
                                $cordovaToast.showShortBottom('Database downloaded successfully');
                                deferred.resolve();
                            });
                        }, function (error) {
                            console.log(error.code);
                            $cordovaToast.showShortBottom('Database download error');
                            deferred.resolve();
                        });
                }
                else {  //if data present, then check if up-to-date
                    console.log('yes data');
                    ref.limitToFirst(8).once("value",
                        function (snapshot) {
                            if(angular.equals(data.departments,snapshot.val().departments) &&
                               angular.equals(data.studentCount, snapshot.val().studentCount) &&
                               angular.equals(data.students, snapshot.val().students) &&
                               angular.equals(data.subjects, snapshot.val().subjects) &&
                               angular.equals(data.teachers, snapshot.val().teachers)
                            )
                                $cordovaToast.showShortBottom('Database is up-to-date');
                            else{
                                var hazridata = {};
                                hazridata.departments = snapshot.val().departments;
                                hazridata.studentCount = snapshot.val().studentCount;
                                hazridata.students = snapshot.val().students;
                                hazridata.subjects = snapshot.val().subjects;
                                hazridata.teachers = snapshot.val().teachers;
                                console.log(hazridata);
                                localforage.setItem('hazridata', hazridata).then(function () {
                                    $cordovaToast.showShortBottom('Database updated successfully');
                                });
                            }
                            deferred.resolve();
                        }, function (error) {
                            console.log(error.code);
                            deferred.resolve();
                        });
                }
            });
            return deferred.promise;
        };

        return {
            fetchData: fetchData
        };
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