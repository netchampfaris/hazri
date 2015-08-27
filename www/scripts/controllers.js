
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

.controller("SelectCtrl", function ($scope, $ionicLoading, $ionicActionSheet, $ionicPopup) {
    $ionicLoading.hide();
    
    $scope.dept = "Computer";
    $scope.year = "First Year";
    $scope.subject = "Subject 1";
    $scope.time = "9.30 - 10.30";
    var options = [];
    $scope.list = function (type, title) {

        switch (type) {
            case 1:
                options = [
              { text: ' Computer' },
              { text: ' Information Technology' },
              { text: ' Mechanical' },
              { text: ' Chemical' },
              { text: ' Instrumentation' },
              { text: ' Electronics and Telecommunication' }
              ]; break;

            case 2:
                options = [
                { text: ' First Year' },
                { text: ' Second Year' },
                { text: ' Third Year' },
                { text: ' Final Year' }
                ]; break;

            case 3:
                options = [
                { text: ' Subject 1' },
                { text: ' Subject 2' },
                { text: ' Subject 3' },
                { text: ' Subject 4' },
                { text: ' Subject 5' },
                { text: ' Subject 6' }
                ]; break;

            case 4:
                options = [
                { text: ' 9.30 - 10.30' },
                { text: ' 10.30 - 11.30' },
                { text: ' 11.30 - 12.30' },
                { text: ' 1.00 - 2.00' },
                { text: ' 2.00 - 3.00' },
                { text: ' 3.00 - 4.00' },
                { text: ' 4.00 - 5.00'}
                ]; break;
        };

        // Show the action sheet
        var actionSheet = $ionicActionSheet.show({
            buttons: options,
            titleText: 'Select '+title,
            buttonClicked: function (index, button) {
                switch (type) {
                    case 1: $scope.dept = button.text;
                        break;
                    case 2: $scope.year = button.text;
                        break;
                    case 3: $scope.subject = button.text;
                        break;
                    case 4: $scope.time = button.text;
                        break;
                };
                return true;
            }
        });

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

.controller('AttendanceCtrl', ["$scope", "$firebaseArray",
  function ($scope, $firebaseArray) {

      var ref = new Firebase("https://hazri.firebaseio.com/absentroll");
      var fb = $firebaseArray(ref);

      $scope.no = $firebaseArray(ref);
      
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
      
       $scope.upload=function (){
        var final=$scope.selected;
        final = final.sort(function(a, b){return a-b});
        ref.child("roll").set(final);
      };

  }

]);
