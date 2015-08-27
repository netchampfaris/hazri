
angular.module('hazri.controllers', ['ionic','firebase'])


.controller("LoginCtrl", function ($scope, $ionicModal, $state, $ionicLoading, $ionicHistory, $ionicPopup) {
      var ref = new Firebase("https://hazri.firebaseio.com");
        
      $scope.user = {};

      $ionicModal.fromTemplateUrl('templates/signup.html', function (modal) {
          $scope.modal = modal;
      }, {
          scope: $scope,
          animation: 'slide-in-up'
      });

      $scope.login = function (user) {

          if (user && user.email && user.password) {
              
              $ionicLoading.show({
                  template: 'Signing in<br><br><ion-spinner icon="android"></ion-spinner>'
              });

              ref.authWithPassword({
                  "email": user.email,
                  "password": user.password
              }, function (error, authData) {
                  if (error) {
                      $scope.showAlert("Error","Login Failed!");
                  } else {
                      console.log("Authenticated successfully with payload:", authData);
                      user = null;
                      $ionicHistory.nextViewOptions({
                          disableAnimate: true,
                          disableBack: true,
                          historyRoot: true
                      });
                      $state.go('select');
                  }
                });
          }
          else {
              $scope.showAlert("Error","Enter email and password");
          }

      };

      $scope.signup = function (user) {

          if (user && user.email && user.password) {

              $ionicLoading.show({
                  template: 'Signing up<br><br><ion-spinner icon="android"></ion-spinner>'
              });

              ref.createUser({
                  email: user.email,
                  password: user.password
              }, function (error, userData) {
                  if (error) {
                      switch (error.code) {
                          case "EMAIL_TAKEN":
                              $scope.showAlert("Error","The new user account cannot be created because the email is already in use.");
                              break;
                          case "INVALID_EMAIL":
                              $scope.showAlert("Error", "The specified email is not a valid email.");
                              break;
                          default:
                              $scope.showAlert("Error", "Error creating user: ", error);
                      }
                  } else {
                      $scope.hideModal();
                  }
              });
          }
          else
              $scope.showAlert("Error","Enter email and password");

      };

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

.controller("SelectCtrl", function ($scope, $ionicLoading, $ionicActionSheet, $ionicPopup, $q) {
    $ionicLoading.hide();

    //load all data from firebase at login successfull, to be done later
    

    //default values for options
    $scope.dept = "Computer";
    $scope.year = "Final Year";
    $scope.semester = "Semester 7";
    $scope.type = "Theory";
    $scope.subject = "";
    $scope.date = "";
    $scope.lectures = "";
    
    $scope.list = function (type, title) {

            var options = [];

        // Show the action sheet
            var actionSheet = function () {
                $ionicActionSheet.show({
                    buttons: options,
                    titleText: 'Select ' + title,
                    cssClass: 'custom-action-sheet',
                    buttonClicked: function (index, button) {
                        switch (type) {
                            case 1: $scope.dept = button.text;
                                break;
                            case 2: $scope.year = button.text;
                                break;
                            case 3: $scope.semester = button.text;
                                break;
                            case 4: $scope.type = button.text;
                                break;
                            case 5: $scope.subject = button.text;
                                break;
                            case 6: $scope.date = button.text;
                                break;
                            case 7: $scope.lectures = button.text;
                                break;
                        };
                        return true;
                    }
                });
            };

            switch (type) {
            case 1:
                options = [
              { text: 'Computer' },
              { text: 'Information Technology' },
              { text: 'Mechanical' },
              { text: 'Chemical' },
              { text: 'Instrumentation' },
              { text: 'Electronics and Telecommunication' }
                ];
                actionSheet();
                break;

            case 2:
                options = [
                { text: 'First Year' },
                { text: 'Second Year' },
                { text: 'Third Year' },
                { text: 'Final Year' }
                ];
                actionSheet();
                break;

            case 3:
                options = [
                { text: 'Semester 7' },
                { text: 'Semester 8' }
                ];
                actionSheet();
                break;

            case 4:
                options = [
                { text: 'Theory' },
                { text: 'Practical' }
                ];
                actionSheet();
                break;

            case 5:

                var getSubjects = function () {
                    var deferred = $q.defer();
                    $ionicLoading.show({ template: 'Getting Subject List..' });
                    var dept = $scope.dept.replace(" ", "%20");
                    var year = $scope.year.replace(" ", "%20");
                    var sem = $scope.semester.replace(" ", "%20");
                    var type = $scope.type.replace(" ", "%20");
                    var str = "https://hazri.firebaseio.com/Department/" + dept + "/" + year + "/" + sem + "/" + type + "/";
                    var ref = new Firebase(str);

                    ref.orderByKey().on("value", function (snapshot) {
                        snapshot.forEach(function (data) {
                            options.push({ text: data.key() });
                        });
                        deferred.resolve();
                    }, function (errorObject) {
                        console.log("The read failed: " + errorObject.code);
                        deferred.reject();
                    });

                    return deferred.promise;
                };

                var promise = getSubjects();

                promise.then(function () {
                    $ionicLoading.hide();
                    actionSheet();
                }, function (reason) {
                    $ionicLoading.hide();
                    alert('Failed: ' + reason);
                }, function (update) {
                    $ionicLoading.hide();
                    alert('Got notification: ' + update);
                });
                break;


            case 6:
                options = [
                    { text: '25-08-2015' },
                    { text: '26-08-2015' },
                    { text: '27-08-2015' },
                    { text: '28-08-2015' }
                ];
                actionSheet();
                break;

            case 7:
                options = [
                { text: '1' },
                { text: '2' }
                ];
                actionSheet();
                break;

            };

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

.controller('AttendanceCtrl', ["$scope", "$firebaseArray", "$stateParams","$q","$ionicLoading","$ionicPopup",
  function ($scope, $firebaseArray, $stateParams, $q, $ionicLoading,$ionicPopup) {


      var dept = $stateParams.dept;
      var year = $stateParams.year;
      var sem = $stateParams.semester;
      var type = $stateParams.type;
      var subject = $stateParams.subject;
      var date = $stateParams.date;
      $scope.totalStudents = 0;


      var getNo = function(){
          var deferred = $q.defer();
          $ionicLoading.show({ template: 'Loading student count..' });

          var ref = new Firebase("https://hazri.firebaseio.com/Department/" + dept + "/" + year + "/" + sem + "/");
          ref.on("value", function (snapshot) {
              snapshot.forEach(function (data) {
                  if (data.key() == "totalstudents")
                      $scope.totalStudents = data.val();
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
                  $scope.updateAttendance();
              } else {
                  console.log('You are not sure');
              }
          });
      };

      $scope.updateAttendance = function () {

          var str = "https://hazri.firebaseio.com/Department/" + dept + "/" + year + "/" + sem + "/" + type + "/" + subject +"/";
          var ref = new Firebase(str);
          $scope.selected = $scope.selected.sort();
          var absent = "";
          for (var i = 0; i < $scope.selected.length; i++)
              absent += $scope.selected[i] + ",";
          ref.push({ date: date, absentno: absent });

          console.log("successfull");

      };


      $scope.setval = function (rollno) {
          $scope.items = [];
          for (var i = 0; i < rollno ; i++)
              $scope.items.push(i + 1);
      };


      $scope.selected = [];
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
      

  }

]);
