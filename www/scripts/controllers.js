
angular.module('hazri.controllers', ['ionic', 'firebase', 'hazri.services', 'pickadate', 'highcharts-ng'])


.controller("LoginCtrl", function ($scope, $ionicModal, $state, $ionicLoading, $ionicHistory, $ionicPopup, $q, FirebaseUrl) {
    var ref = new Firebase(FirebaseUrl.root);


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
            $scope.showAlert("Error", "Enter email and password");
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

.controller("SelectCtrl", function ($scope, $ionicLoading, $ionicModal, $ionicPopup, $q, $state, FirebaseUrl, ionicMaterialInk, ionicMaterialMotion, $timeout) {

    $scope.selected = {};

    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state select");
        //initialize values
        $scope.options = [];
        $scope.allSelected = false;
        if ($scope.selected.type) $scope.selected.type = undefined;
        if ($scope.selected.batchno) $scope.selected.batchno = undefined;
        if ($scope.selected.subject) $scope.selected.subject = undefined;

    });

    var materialEffects = function () {

        $timeout(function () {
            ionicMaterialInk.displayEffect();
            ionicMaterialMotion.ripple();
        }, 0);
    };
    materialEffects();

    $ionicModal.fromTemplateUrl('templates/options_modal.html', function (modal) {
        $scope.modal = modal;

    }, {
        scope: $scope,
        animation: 'slide-in-right'
    });

    $ionicModal.fromTemplateUrl('templates/date_modal.html',
        function (modal) {
            $scope.datemodal = modal;
        },
    {
        scope: $scope,
        animation: 'slide-in-up'
    });

    $scope.opendateModal = function () {
        $scope.datemodal.show();
    };

    $scope.closedateModal = function (date) {
        $scope.datemodal.hide();
        $scope.selected.date = date;
    };

    $scope.showDeptOptions = function () {

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
            }
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

    $scope.showBatchOptions = function () {
        if ($scope.selected.type) {
            var batchCount = 0;
            var getBatch = function () {

                var defer = $q.defer();
                $ionicLoading.show({ template: "Getting Batch info..." });
                var ref = new Firebase(FirebaseUrl.root);
                ref.child("studentCount").on("value",
                function (snapshot) {
                    snapshot.forEach(function (data) {
                        //console.log(data.key() + " : " + JSON.stringify(data.val()));
                        if ($scope.selected.dept.id == data.val().dept && $scope.selected.year.id == data.val().year) {
                            batchCount = Object.keys(data.val().batchno).length;
                        }
                    });
                    defer.resolve();
                }, function (error) {
                    console.log(error.code);
                    defer.reject();
                });
                return defer.promise;
            };

            var promise = getBatch();

            promise.then(function () {
                $ionicLoading.hide();

                if (batchCount > 0) {
                    for (var i = 1 ; i <= batchCount; i++) {
                        $scope.options.push({ id: i, name: "batchno", value: "Batch " + i });
                    }
                }

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

    $scope.showSubOptions = function () {
        console.log(JSON.stringify($scope.selected));
        $scope.options = [];

        //proceed only if type field is selected and if type is practical then make sure that batch field is selected
        if (($scope.selected.type && $scope.selected.type.id == 'th') || ($scope.selected.type && $scope.selected.type.id == 'pr' && $scope.selected.batchno)) {
            var getSub = function () {
                var defer = $q.defer();
                $ionicLoading.show({ template: "Getting subject list..." });
                var ref = new Firebase(FirebaseUrl.root);
                ref.child("subjects").on("value",
                function (snapshot) {
                    snapshot.forEach(function (data) {
                        console.log(data.key() + " : " + JSON.stringify(data.val()));
                        if ($scope.selected.dept.id == data.val().dept_id && $scope.selected.year.id == data.val().year && $scope.selected.semester.id == data.val().sem) {
                            if ($scope.selected.type.id == "th" && data.val().theory)
                                $scope.options.push({ id: data.key(), name: "subject", value: data.val().fullname });
                            if ($scope.selected.type.id == "pr" && data.val().practical)
                                $scope.options.push({ id: data.key(), name: "subject", value: data.val().fullname });
                        }
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
            $scope.showAlert("Uh uh..", "Please select above fields first");

    };

    $scope.setSelected = function (option) {

        $scope.selected[option.name] = { id: option.id, value: option.value };
        $scope.options = [];    //required to flush values
        $scope.modal.hide();

        if (option.name == 'year') {
            $scope.selected.semester = undefined;
        }
        if (option.name == 'type') {
            $scope.selected.batchno = undefined;
        }

        console.log(JSON.stringify($scope.selected));
        //show button when all options are selected
        if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester && $scope.selected.type && $scope.selected.subject)
            $scope.allSelected = true;
    };

    $scope.hideModal = function () {
        $scope.modal.hide();
        $scope.options = [];    //required to flush values
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

    $scope.gotoAtt = function (selected) {
        $state.go("attendance", { selected: selected});
    };

})

.controller('AttendanceCtrl', function ($scope, $stateParams, $q, $ionicLoading, $ionicPopup, $state, FirebaseUrl, ionicMaterialInk, ionicMaterialMotion, $timeout) {
    var selectedOptions;
    var batchStart, batchEnd;

    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state take attendance");
        $scope.items = [];
        $scope.selected = [];
        batchStart = batchEnd = undefined;
        selectedOptions = $stateParams.selected;
        console.log(selectedOptions);
        $scope.totalStudents = 0;

        var getNo = function () {
            var deferred = $q.defer();
            $ionicLoading.show({ template: 'Loading student count..' });

            var ref = new Firebase(FirebaseUrl.root);
            ref.child("studentCount").on("value", function (snapshot) {

                snapshot.forEach(function (data) {
                    if (selectedOptions.dept.id == data.val().dept && selectedOptions.year.id == data.val().year) //add batch code later
                    {
                        $scope.totalStudents = data.val().count;
                        if (selectedOptions.batchno) {
                            batchStart = data.val().batchno[selectedOptions.batchno.id];
                            if (selectedOptions.batchno.id == Object.keys(data.val().batchno).length) //if batch selected is last batch
                                batchEnd = $scope.totalStudents;
                            else
                                batchEnd = data.val().batchno[selectedOptions.batchno.id + 1] - 1;
                        }
                    }
                });

                deferred.resolve();
            }, function (error) {
                console.log("error:" + error.code);
                deferred.reject();
            });

            return deferred.promise;
        };

        var promise = getNo();

        promise.then(function () {
            $ionicLoading.hide();
            materialEffects();
            $scope.setval($scope.totalStudents, batchStart, batchEnd);
        }, function (reason) {
            $ionicLoading.hide();
            alert('Failed: ' + reason);
        }, function (update) {
            $ionicLoading.hide();
            alert('Got notification: ' + update);
        });

    });

    var materialEffects = function () {

        $timeout(function () {
            ionicMaterialInk.displayEffect();
            ionicMaterialMotion.ripple();
        }, 0);
    };
    materialEffects();

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
                $state.go("viewAttendance", { selected: selectedOptions, totalStudents: $scope.totalStudents, bStart:batchStart, bEnd:batchEnd });
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
            batchno:(selectedOptions.batchno)?selectedOptions.batchno.id:null,
            year: selectedOptions.year.id
        });


        $ionicLoading.hide();
        console.log("successfully took attendance");

    };

    $scope.setval = function (rollno, bStart, bEnd) {
        $scope.items = [];
        var i;
        if (bStart && bEnd)
            for (i = bStart; i <= bEnd ; i++)
                $scope.items.push(i);
        else
            for (i = 1; i <= rollno ; i++)
                $scope.items.push(i);
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

})

.controller("ViewAttendanceCtrl", function ($scope, $stateParams, FirebaseUrl, $q, $ionicLoading, $ionicPlatform, $state) {
    var selectedOptions;
    var totalStudents;
    var cumulativeAttendance;
    var totalLectures;
    var bStart ,bEnd;
    $scope.batchinfo = {pr:false};
    $scope.$on('$ionicView.beforeEnter', function () {
        
        selectedOptions = $stateParams.selected;
        totalStudents = $stateParams.totalStudents;
        bStart = $stateParams.bStart;
        bEnd = $stateParams.bEnd;
        console.log(selectedOptions);
        
        if (selectedOptions.type.id == 'pr')
            $scope.batchinfo = {
                pr: true,
                bno: selectedOptions.batchno.id,
                bstart: bStart,
                bend: bEnd
            };
        else
            $scope.batchinfo = { pr: false };

        $scope.subjectName = selectedOptions.subject.value;
        cumulativeAttendance = [];
        totalLectures = 0;

        for (var i = 1; i <= totalStudents; i++)
            cumulativeAttendance.push({roll:i,att:0});
        
        var computeAttendance = function () {
            var defer = $q.defer();
            $ionicLoading.show({ template: "Getting data..." });

            var ref = new Firebase(FirebaseUrl.root);
            ref.child("attendances").on("value", function (snapshot) {
                snapshot.forEach(function (data) {

                    if (selectedOptions.dept.id == data.val().dept && selectedOptions.year.id == data.val().year
                        && selectedOptions.semester.id == data.val().semester && selectedOptions.subject.id == data.val().subid
                        && selectedOptions.type.id == data.val().type) {
                            //for theory
                        if (selectedOptions.type.id == 'th') {
                            totalLectures++;
                            var i;
                            for (i = 0; i < totalStudents; i++)
                                cumulativeAttendance[i].att++;
                            var absentno = data.val().absentno;
                            if (absentno !== undefined) //absentno undefined means all present
                            {
                                var arraylength = absentno.length;
                                for (i = 0; i < arraylength ; i++)
                                    cumulativeAttendance[absentno[i] - 1].att--;
                            }
                            //else all present
                        }
                            //for practicals, show only the specific batch selected
                        else
                        {
                            if(selectedOptions.batchno.id == data.val().batchno)
                            {
                                totalLectures++;
                                var i;
                                for (i = bStart-1; i < bEnd; i++)
                                    cumulativeAttendance[i].att++;
                                var absentno = data.val().absentno;
                                if (absentno !== undefined) //absentno undefined means all present
                                {
                                    var arraylength = absentno.length;
                                    for (i = 0; i < arraylength ; i++)
                                        cumulativeAttendance[absentno[i] - 1].att--;
                                }
                                //else all present
                            }
                        }
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
            cumulativeAttendance = []; //flush values
        }, function (reason) {
            $ionicLoading.hide();
            console.log(reason);
            cumulativeAttendance = []; //flush values
        });
    });

    $ionicPlatform.registerBackButtonAction(function (event) {
        $state.go('select');
    }, 100);

})

.controller("StudentViewCtrl", function($scope, $ionicModal, $ionicPopup, ionicMaterialInk,ionicMaterialMotion,$timeout) {
    
    //var materialEffects = function () {

    //    $timeout(function () {
    //        ionicMaterialInk.displayEffect();
    //        ionicMaterialMotion.ripple();
    //    }, 0);
    //};

    //materialEffects();

    //$ionicModal.fromTemplateUrl('templates/options_modal.html', function (modal) {
    //    $scope.modal = modal;

    //}, {
    //    scope: $scope,
    //    animation: 'slide-in-right'
    //});


    ////initialize values
    //$scope.options = [];
    //$scope.selected = {};

    //$scope.showDeptOptions = function () {

    //    $scope.options = [
    //        { id: "ch", name: "dept", value: "Chemical" },
    //        { id: "cs", name: "dept", value: "Computer" },
    //        { id: "extc", name: "dept", value: "Electronics and Telecommunication" },
    //        { id: "is", name: "dept", value: "Instrumentation" },
    //        { id: "it", name: "dept", value: "Information Technology" },
    //        { id: "me", name: "dept", value: "Mechanical" },
    //    ];

    //    $scope.modal.show();
    //    materialEffects();
    //};

    //$scope.showYearOptions = function () {
    //    if ($scope.selected.dept) {
    //        $scope.options = [
    //                        { id: "fe", name: "year", value: "First Year" },
    //                        { id: "se", name: "year", value: "Second Year" },
    //                        { id: "te", name: "year", value: "Third Year" },
    //                        { id: "be", name: "year", value: "Final Year" }];
    //        $scope.modal.show();
    //        materialEffects();
    //    }
    //    else
    //        $scope.showAlert("Uh uh..", "Please select department first");

    //};

    //$scope.showSemOptions = function () {

    //    if ($scope.selected.year) {
    //        switch ($scope.selected.year.id) {
    //            case "fe": $scope.options = [{ id: 1, name: "semester", value: "Semester 1" }, { id: 2, name: "semester", value: "Semester 2" }]; break;
    //            case "se": $scope.options = [{ id: 3, name: "semester", value: "Semester 3" }, { id: 4, name: "semester", value: "Semester 4" }]; break;
    //            case "te": $scope.options = [{ id: 5, name: "semester", value: "Semester 5" }, { id: 6, name: "semester", value: "Semester 6" }]; break;
    //            case "be": $scope.options = [{ id: 7, name: "semester", value: "Semester 7" }, { id: 8, name: "semester", value: "Semester 8" }]; break;
    //        }
    //        $scope.modal.show();
    //        materialEffects();
    //    }
    //    else
    //        $scope.showAlert("Uh uh..", "Please select year field first");
    //};

    //$scope.setSelected = function (option) {

    //    $scope.selected[option.name] = { id: option.id, value: option.value };
    //    $scope.options = [];    //required to flush values
    //    $scope.modal.hide();

    //    if (option.name == 'year') {
    //        $scope.selected.semester = undefined;
    //    }

    //    console.log(JSON.stringify($scope.selected));
    //    //show button when all options are selected
    //    if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester && $scope.selected.rollno)
    //        $scope.allSelected = true;
    //    else
    //        $scope.allSelected = false;
    //};

    //$scope.hideModal = function () {
    //    $scope.modal.hide();
    //    $scope.options = [];    //required to flush values
    //};

    //$scope.showAlert = function (title, message) {

    //    var alertPopup = $ionicPopup.alert({
    //        title: title,
    //        template: message
    //    });
    //    alertPopup.then(function (res) {
    //        console.log('ok clicked alert');
    //    });
    //};

    //$scope.showGraph = function () {

    //    var getAttendance = function () {
    //        var defer = $q.defer();
    //        $ionicLoading.show({ template: "Getting attendance list..." });
    //        var ref = new Firebase(FirebaseUrl.root);
    //        ref.child("attendance").on("value",
    //        function (snapshot) {
    //            snapshot.forEach(function (data) {
                    
    //            });
    //            defer.resolve();
    //        }, function (error) {
    //            console.log(error.code);
    //            defer.reject();
    //        });
    //        return defer.promise;
    //    };

    //    var promise = getAttendance();

    //    promise.then(function () {
    //        $ionicLoading.hide();
    //        console.log("success retrieving attendance");
    //        $scope.modal.show();
    //        materialEffects();
    //    }, function (reason) {
    //        $ionicLoading.hide();
    //        console.log(reason);
    //    });

    //};

    $scope.addPoints = function () {
        var seriesArray = $scope.highchartsNG.series
        var rndIdx = Math.floor(Math.random() * seriesArray.length);
        seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
    };

    $scope.addSeries = function () {
        var rnd = []
        for (var i = 0; i < 10; i++) {
            rnd.push(Math.floor(Math.random() * 20) + 1)
        }
        $scope.highchartsNG.series.push({
            data: rnd
        })
    }

    $scope.removeRandomSeries = function () {
        var seriesArray = $scope.highchartsNG.series
        var rndIdx = Math.floor(Math.random() * seriesArray.length);
        seriesArray.splice(rndIdx, 1)
    }

    $scope.options = {
        type: 'line'
    }

    $scope.swapChartType = function () {
        if (this.highchartsNG.options.chart.type === 'line') {
            this.highchartsNG.options.chart.type = 'bar'
        } else {
            this.highchartsNG.options.chart.type = 'line'
        }
    }

    $scope.highchartsNG = {
        options: {
            chart: {
                type: 'line'
            }
        },
        series: [{
            data: [10, 15, 12, 8, 7]
        }],
        title: {
            text: 'Hello'
        },
        loading: false
    }

});
