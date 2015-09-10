
angular.module('hazri.controllers', ['ionic', 'firebase', 'hazri.services'])

    .controller("LoginOptionCtrl", function () { })

    .controller("StudentCtrl", function () { })

.controller("LoginCtrl", function ($scope, $ionicModal, $state, $ionicLoading, $ionicHistory, $ionicPopup, $q) {
      var ref = new Firebase("https://hazri.firebaseio.com");


      $ionicModal.fromTemplateUrl('templates/signup.html', function (modal) {
          $scope.modal = modal;
      }, {
          scope: $scope,
          animation: 'slide-in-up'
      });

      $scope.login = function (user) {

          if (user && user.email && user.password) {

              var log = function () {
                  var deferred = $q.defer();
                  $ionicLoading.show({
                      template: 'Signing in<br><br><ion-spinner icon="android"></ion-spinner>'
                  });

                  ref.authWithPassword({
                      "email": user.email,
                      "password": user.password
                  }, function (error, authData) {
                      if (error) {
                          deferred.reject();
                      } else {
                          console.log("Authenticated successfully with payload:", authData);
                          $ionicHistory.nextViewOptions({
                              disableAnimate: true,
                              disableBack: true,
                              historyRoot: true
                          });
                          deferred.resolve();
                      }
                  });
                  return deferred.promise;
              };

              var promise = log();
              promise.then(function () {
                  $ionicLoading.hide();
              },
              function (reason) {
                  $ionicLoading.hide();
                  console.log(reason);
                  $scope.showAlert("Error", "Login Failed!");
              });
          }
          else {
              $scope.showAlert("Error","Enter email and password");
          }
      };

      /*****************************************/
      /* Commented out signup function for now */
      /*****************************************/
      //$scope.signup = function (user) {

      //    if (user && user.email && user.password) {

      //        var reg = function () {
                  
      //            var deferred = $q.defer();

      //            $ionicLoading.show({
      //                template: 'Signing up<br><br><ion-spinner icon="android"></ion-spinner>'
      //            });

      //            ref.createUser({
      //                email: user.email,
      //                password: user.password
      //            }, function (error, userData) {
      //                if (error) {
      //                    switch (error.code) {
      //                        case "EMAIL_TAKEN":
      //                            $scope.showAlert("Error","The new user account cannot be created because the email is already in use.");
      //                            break;
      //                        case "INVALID_EMAIL":
      //                            $scope.showAlert("Error", "The specified email is not a valid email.");
      //                            break;
      //                        default:
      //                            $scope.showAlert("Error", "Error creating user: ", error);
      //                    }
      //                    deferred.reject();
      //                } else {
      //                    deferred.resolve();
      //                }
      //            });
      //            return deferred.promise;
      //        };

      //        promise.then(function () {
      //            $ionicLoading.hide();
      //            $scope.showAlert("Successful", "Account created successfully");
      //            $scope.hideModal();
      //        }, function (reason) {
      //            $ionicLoading.hide();
      //            console.log(reason);
      //        });

      //    }
      //    else
      //        $scope.showAlert("Error","Enter email and password");

      //};

      $scope.hideModal = function () {
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
              title: 'Successful',
              template: 'Account created successfully. Now login.'
          });
          alertPopup.then(function (res) {
              $scope.modal.hide();
          });
      };

      $scope.showAlert = function (title,message) {
          
          var alertPopup = $ionicPopup.alert({
              title: title,
              template: message
          });
          alertPopup.then(function (res) {
              console.log('ok clicked alert');
          });
      };

 })

.controller("SelectCtrl", function ($ionicPlatform, $scope, $ionicLoading, $ionicModal,
    $ionicActionSheet, $ionicPopup, $q, $firebaseObject, FirebaseUrl, $filter,
    ionicMaterialInk, ionicMaterialMotion, $timeout) {

    var materialEffects = function () {

        $timeout(function () {
            ionicMaterialInk.displayEffect();
            ionicMaterialMotion.ripple();
        }, 0);
    }
    
    materialEffects();

    $ionicModal.fromTemplateUrl('templates/options_modal.html', function (modal) {
        $scope.modal = modal;
        
    }, {
        scope: $scope,
        animation: 'slide-in-right'
    });

    
    //initialize values
    $scope.options = [];
    $scope.selected = {};
    $scope.selected.date = '05-09-2015';
    
    $scope.showDeptOptions = function() {

        $scope.options = [
            { id: "ch", name: "dept", value: "Chemical" },
            { id: "cs", name: "dept", value: "Computer" },
            { id: "extc", name: "dept", value: "Electronics and Telecommunication" },
            { id: "is", name: "dept", value: "Instrumentation" },
            { id: "it", name: "dept", value: "Information Technology" },
            { id: "me", name: "dept", value: "Mechanical" },
        ];

        $scope.modal.show();
        materialEffects();
        

        //var getDept = function () {
        //    var defer = $q.defer();
        //    $ionicLoading.show({ template: 'Getting Dept list...' });
        //    var ref = new Firebase(FirebaseUrl.root);
        //    ref.child("departments").on("value",
        //    function (snapshot) {
        //        snapshot.forEach(function (data) {
        //            $scope.options.push({ id: data.key(), name:"dept", value: data.val().name });

        //        });

        //        defer.resolve();
        //    },
        //    function (error) {
        //        console.log(error);
        //        defer.reject();
        //    });
        //    return defer.promise;
        //};

        //var promise = getDept();
        //promise.then(function () {
        //    $ionicLoading.hide();
        //    console.log("success retrieving depts");
        //    $scope.modal.show();
        //}, function (reason) {
        //    $ionicLoading.hide();
        //    console.log("error: "+reason);
        //});

    };

    $scope.showYearOptions = function () {
        if ($scope.selected.dept) {
            $scope.options = [
                            { id: "fe", name: "year", value: "First Year" },
                            { id: "se", name: "year", value: "Second Year" },
                            { id: "te", name: "year", value: "Third Year" },
                            { id: "be", name: "year", value: "Final Year" }];
            $scope.modal.show();
            materialEffects();
        }
        else
            $scope.showAlert("Uh uh..", "Please select department first");

    };

    $scope.showSemOptions = function () {
        
        if ($scope.selected.year) {
            switch ($scope.selected.year.id) {
                case "fe": $scope.options = [{ id: 1, name: "semester", value: "Semester 1" }, { id: 2, name: "semester", value: "Semester 2" }]; break;
                case "se": $scope.options = [{ id: 3, name: "semester", value: "Semester 3" }, { id: 4, name: "semester", value: "Semester 4" }]; break;
                case "te": $scope.options = [{ id: 5, name: "semester", value: "Semester 5" }, { id: 6, name: "semester", value: "Semester 6" }]; break;
                case "be": $scope.options = [{ id: 7, name: "semester", value: "Semester 7" }, { id: 8, name: "semester", value: "Semester 8" }]; break;
            };
            $scope.modal.show();
            materialEffects();
        }
        else
            $scope.showAlert("Uh uh..", "Please select year field first");
    };

    $scope.showTypeOptions = function () {
        if ($scope.selected.semester) {
            $scope.options = [{ id: "th", name: "type", value: "Theory" }, { id: "pr", name: "type", value: "Practical" }, ];
            $scope.modal.show();
            materialEffects();
        }
        else
            $scope.showAlert("Uh uh..", "Please select semester field first");
    };

    $scope.showSubOptions = function () {
        console.log(JSON.stringify($scope.selected));
        $scope.options = [];

        if ($scope.selected.type) {
            
            var getSub = function () {

                var defer = $q.defer();
                $ionicLoading.show({ template: "Getting subject list..." });
                var ref = new Firebase(FirebaseUrl.root);
                ref.child("subjects").on("value",
                function (snapshot) {
                    snapshot.forEach(function (data) {
                        console.log(data.key()+" : "+ JSON.stringify(data.val()));
                        if ($scope.selected.dept.id == data.val().dept_id && $scope.selected.year.id == data.val().year && $scope.selected.semester.id == data.val().sem)
                            $scope.options.push({ id: data.key(), name: "subject", value: data.val().fullname });
                    });
                    defer.resolve();
                }, function (error) {
                    console.log(error.code);
                    defer.reject();
                });
                return defer.promise;
            };

            var promise = getSub();

            promise.then(function () {
                $ionicLoading.hide();
                console.log("success retrieving subjects");
                $scope.modal.show();
                materialEffects();
            }, function (reason) {
                $ionicLoading.hide();
                console.log(reason);
            });

        }
        else
            $scope.showAlert("Uh uh..", "Please select type field first");

    };

    $scope.showDateOptions = function () {
        $scope.selected.date = '05-09-2015';
    };

    $scope.setSelected = function (option) {

        $scope.selected[option.name] = { id:option.id , value:option.value };
        $scope.options = [];    //required to flush values
        $scope.modal.hide();

        console.log(JSON.stringify($scope.selected));

        //show button when all options are selected
        if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester && $scope.selected.type && $scope.selected.subject)
            $scope.allSelected = true;
    };
    
    $scope.showAlert = function (title, message) {

        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message
        });
        alertPopup.then(function (res) {
            console.log('ok clicked alert');
        });
    };


})

.controller('AttendanceCtrl', ["$scope", "$firebaseArray", "$stateParams","$q","$ionicLoading","$ionicPopup","$state","FirebaseUrl",
  function ($scope, $firebaseArray, $stateParams, $q, $ionicLoading, $ionicPopup, $state, FirebaseUrl) {

      //console.log($stateParams.selected);
      var selectedOptions = $stateParams.selected;
      $scope.totalStudents = 0;
      $scope.selected = [];

      var getNo = function(){
          var deferred = $q.defer();
          $ionicLoading.show({ template: 'Loading student count..' });

          var ref = new Firebase(FirebaseUrl.root);
          ref.child("studentCount").on("value", function (snapshot) {
              
              snapshot.forEach(function (data) {
                  if (selectedOptions.dept.id == data.val().dept && selectedOptions.year.id == data.val().year) //add batch code later
                      $scope.totalStudents = data.val().count;
              });

              deferred.resolve();
          }, function (error) {
              console.log("error:" + error.code);
              deferred.reject();
          });

          return deferred.promise;
      }
      var promise = getNo();

      promise.then(function () {
          $ionicLoading.hide();
          $scope.setval($scope.totalStudents);
      }, function (reason) {
          $ionicLoading.hide();
          alert('Failed: ' + reason);
      }, function (update) {
          $ionicLoading.hide();
          alert('Got notification: ' + update);
      });

      $scope.showConfirm = function () {
          var confirmPopup = $ionicPopup.confirm({
              title: 'Confirm Submit',
              template: 'Are you sure you want to submit this list?'
          });
          confirmPopup.then(function (res) {
              if (res) {
                  console.log('You are sure');
                  $ionicLoading.show({ template: 'Updating attendance...' });
                  $scope.updateAttendance();
                  $state.go("viewAttendance", { selected: selectedOptions, totalStudents:$scope.totalStudents });
              } else {
                  console.log('You are not sure');
              }
          });
      };

      $scope.updateAttendance = function () {
          var absent = $scope.selected.sort();


          var ref = new Firebase(FirebaseUrl.root);
          ref.child("attendances").push({
              absentno: absent,
              batch: "2012-16",     //change later
              date: selectedOptions.date,
              dept: selectedOptions.dept.id,
              semester: selectedOptions.semester.id,
              subid: selectedOptions.subject.id,
              type: selectedOptions.type.id,
              year: selectedOptions.year.id
          });

          $ionicLoading.hide();
          console.log("successfully took attendance");
          
      };

      $scope.setval = function (rollno) {
          $scope.items = [];
          for (var i = 0; i < rollno ; i++)
              $scope.items.push(i + 1);
      };

      $scope.toggle = function (item, list) {
          var idx = list.indexOf(item);
          if (idx > -1) {
              list.splice(idx, 1);
          }
          
          else {
              list.push(item);
          }
      };

      $scope.exists = function (item, list) {
          return list.indexOf(item) > -1;
      };

  }])

.controller("ViewAttendanceCtrl", function ($scope, $firebaseArray, $stateParams, $ionicPopup, FirebaseUrl, $q, $ionicLoading, $ionicPlatform, $state) {

    var selectedOptions = $stateParams.selected;
    var totalStudents = $stateParams.totalStudents;
    //console.log(selectedOptions);

    $scope.subjectName = selectedOptions.subject.value;

    var cumulativeAttendance = [];

    for (var i = 0; i < totalStudents; i++)
        cumulativeAttendance.push(0);

    //console.log(cumulativeAttendance);

    var totalLectures = 0;
    var computeAttendance = function () {
        var defer = $q.defer();
        $ionicLoading.show({ template: "Getting data..." });

        var ref = new Firebase(FirebaseUrl.root);
        ref.child("attendances").on("value", function (snapshot) {
            snapshot.forEach(function (data) {

                if (selectedOptions.dept.id == data.val().dept && selectedOptions.year.id == data.val().year && selectedOptions.semester.id == data.val().semester && selectedOptions.subject.id == data.val().subid && selectedOptions.type.id == data.val().type)
                {
                    totalLectures++;
                    for (var i = 0; i < totalStudents; i++)
                        cumulativeAttendance[i]++;

                    var absentno = data.val().absentno;
                    //console.log(absentno);

                    var arraylength = absentno.length;
                    for (var i = 0; i < absentno.length ; i++)
                        cumulativeAttendance[absentno[i] - 1]--;
                }

            });
            defer.resolve();

        }, function (error) {
            console.log("some error occured: " + error.code);
            defer.reject();
        });

        return defer.promise;
    };


    var promise = computeAttendance();

    promise.then(function () {
        $ionicLoading.hide();
        $scope.totalLectures = totalLectures;
        $scope.items = cumulativeAttendance;
    }, function (reason) {
        $ionicLoading.hide();
        console.log(reason);
    });

    $ionicPlatform.registerBackButtonAction(function (event) {

        $state.go('select');

    },100);
        

});

