﻿
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

.controller("MainCtrl", function ($scope, Firebase, FirebaseUrl, AttendanceService, $ionicPlatform, $ionicPopup, $ionicLoading, $state, $ionicScrollDelegate, $rootScope, $cordovaNetwork) {

    $rootScope.slideHeader = false;
    $rootScope.slideHeaderPrevious = 0;
    
    $scope.$on('$ionicView.enter', function () {
        console.log("in main");
        $ionicLoading.show({
            content: 'Loading Data',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 500
        });

        AttendanceService.getAttendances().then(function (attendances) {
            $scope.attendances = attendances;
            $ionicLoading.hide();
        });
    });

    $scope.clearData = function () {

        localforage.clear();
    };

    
    $scope.showCumAtt = function (att) {

        console.log(att);

        var selectedOptions = {
            absentno : att.absentno,
            batch : att.batch,
            batchno : att.batchno || null,
            date: att.date,
            dept: att.dept,
            semester: att.semester,
            subject: att.subid,
            type: att.type,
            year: att.year
        };
        
        $state.go("viewAttendance", { selected: selectedOptions, totalStudents: att.totalStudents, bStart: att.bStart, bEnd: att.bEnd });
    };
    
})

.controller("SelectCtrl", function ($scope, $ionicLoading, $ionicModal, $ionicPopup, $q, $state, FirebaseUrl) {
    
    $scope.selected = {};

    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state select");
        //initialize values
        
        $scope.options = [
            {
                id: "dept",
                name: "Department",
                values: [
                    { id: "ch", value: "Chemical" },
                    { id: "cs", value: "Computer" },
                    { id: "extc", value: "Electronics and Telecommunication" },
                    { id: "is", value: "Instrumentation" },
                    { id: "it", value: "Information Technology" },
                    { id: "me", value: "Mechanical" }
                ]
            },

            {
                id: "year",
                name: "Year",
                values: [
                    { id: "fe", value: "First Year" },
                    { id: "se", value: "Second Year" },
                    { id: "te", value: "Third Year" },
                    { id: "be", value: "Final Year" }
                ]
            },

            {
                id: "semester",
                name: "Semester",
                values: [{ id: 1, value: "Semester 1" }, { id: 2, value: "Semester 2" }]
            },

            {
                id: "type",
                name: "Type",
                values: [
                    { id: "th", value: "Theory" },
                    { id: "pr", value: "Practical" }
                ]
            },

            {
                id: "batchno",
                name: "Batch",
                values: [],
                show: false
            },

            {
                id: "subject",
                name: "Subject",
                values: []
            }

        ];

        

        $scope.allSelected = false;
        if ($scope.selected.type) $scope.selected.type = undefined;
        if ($scope.selected.batchno) $scope.selected.batchno = undefined;
        if ($scope.selected.subject) $scope.selected.subject = undefined;

    });

    $scope.toggleOption = function (option) {
        if ($scope.isOptionShown(option)) {
            $scope.shownOption = null;
        } else {
            $scope.shownOption = option;
        }
    };

    $scope.isOptionShown = function (option) {
        return $scope.shownOption === option;
    };

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
    
    $scope.showBatchOptions = function () {
        
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
                        $scope.options[4].values.push({ id: i, value: "Batch " + i });
                    }
                }
            }, function (reason) {
                $ionicLoading.hide();
                console.log(reason);
            });
       
    };

    $scope.showSubOptions = function () {
        
        //proceed only if type field is selected and if type is practical then make sure that batch field is selected
        
            var getSub = function () {
                var defer = $q.defer();
                $ionicLoading.show({ template: "Getting subject list..." });
                var ref = new Firebase(FirebaseUrl.root);
                ref.child("subjects").on("value",
                function (snapshot) {
                    snapshot.forEach(function (data) {
                        //console.log(data.key() + " : " + JSON.stringify(data.val()));
                        if ($scope.selected.dept.id == data.val().dept_id && $scope.selected.year.id == data.val().year && $scope.selected.semester.id == data.val().sem) {
                            if ($scope.selected.type.id == "th" && data.val().theory)
                                $scope.options[5].values.push({ id: data.key(), value: data.val().fullname });
                            if ($scope.selected.type.id == "pr" && data.val().practical)
                                $scope.options[5].values.push({ id: data.key(), value: data.val().fullname });
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
            }, function (reason) {
                $ionicLoading.hide();
                console.log(reason);
            });

       

    };

    $scope.showOptions = function (option) {
        if (option.id == 'dept')
        {
            $scope.toggleOption(option);
        }

        else if (option.id == 'year')
        {
            if ($scope.selected.dept) {
                $scope.toggleOption(option);
            }
            else
                $scope.showAlert('Uh uh..', 'Please select dept');
        }

        else if(option.id == 'semester')
        {
            if ($scope.selected.year){
                switch ($scope.selected.year.id) {
                    case "fe": $scope.options[2].values = [{ id: 1, value: "Semester 1" }, { id: 2, value: "Semester 2" }]; break;
                    case "se": $scope.options[2].values = [{ id: 3, value: "Semester 3" }, { id: 4, value: "Semester 4" }]; break;
                    case "te": $scope.options[2].values = [{ id: 5, value: "Semester 5" }, { id: 6, value: "Semester 6" }]; break;
                    case "be": $scope.options[2].values = [{ id: 7, value: "Semester 7" }, { id: 8, value: "Semester 8" }]; break;
                }
                $scope.toggleOption(option);
            }
            else
                $scope.showAlert('Uh uh..', 'Please select year');
        }
        else if(option.id == 'type')
        {
            if ($scope.selected.semester) {
                $scope.toggleOption(option);
            }
            else
                $scope.showAlert('Uh uh..', 'Please select semester');
        }

        else if (option.id == 'batchno')
        {
            if ($scope.selected.type) {
                if ($scope.selected.type.id == 'pr')
                {
                    $scope.options[4].values = [];
                    $scope.showBatchOptions();
                    $scope.toggleOption(option);
                }
            }
            else
                $scope.showAlert('Uh uh..', 'Please select type');
        }
        else if(option.id == 'subject')
        {
            if (($scope.selected.type && $scope.selected.type.id == 'th') || ($scope.selected.type && $scope.selected.type.id == 'pr' && $scope.selected.batchno)) {
                $scope.options[5].values = [];
                $scope.showSubOptions();
                $scope.toggleOption(option); 
            }
            else
                $scope.showAlert('Uh uh..', 'Please select above fields');

        }

    };

    $scope.setSelected = function (item,option) {

        $scope.selected[option.id] = { id: item.id, value: item.value };
        
        $scope.toggleOption(option);

        if ($scope.selected.type && $scope.selected.type.id == 'pr')
            $scope.options[4].show = true;
        if ($scope.selected.type && $scope.selected.type.id == 'th')
        {
            $scope.options[4].show = false;
            $scope.selected.batchno = undefined;
        }
        if (option.id == 'year') {
            $scope.selected.semester = undefined;
        }
        if (option.id == 'type') {
            $scope.options[5].values = [];
            $scope.selected.subject = undefined;
        }
        if ($scope.selected.dept && $scope.selected.year && $scope.selected.semester && $scope.selected.type && $scope.selected.subject)
            $scope.allSelected = true;

        console.log(JSON.stringify($scope.selected));
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

.controller("AttendanceCtrl", function ($scope, $rootScope, $stateParams, $q, $ionicLoading, $ionicPopup, $state, FirebaseUrl, $ionicPlatform, $cordovaNetwork) {
    var selectedOptions;
    var batchStart, batchEnd;
    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state take attendance");
        $scope.items = [];
        $scope.selected = [];
        batchStart = batchEnd = undefined;
        selectedOptions = $stateParams.selected;
        //console.log(selectedOptions);
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
            $scope.setval($scope.totalStudents, batchStart, batchEnd);
        }, function (reason) {
            $ionicLoading.hide();
            alert('Failed: ' + reason);
        }, function (update) {
            $ionicLoading.hide();
            alert('Got notification: ' + update);
        });

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
                updateAttendance();
                //$state.go("viewAttendance", { selected: selectedOptions, totalStudents: $scope.totalStudents, bStart:batchStart, bEnd:batchEnd });
                $state.go("main");

            } else {
                console.log('You are not sure');
            }
        });
    };

    var updateAttendance = function () {
        var absent = $scope.selected;

        //Natural sort
        function compareNumbers(a, b) {
            return a - b;
        }
        absent.sort(compareNumbers);

        var attInfo = {
            absentno: absent,
            batch: "2012-16",     //change later
            date: selectedOptions.date,
            dept: selectedOptions.dept,
            semester: selectedOptions.semester,
            subid: selectedOptions.subject,
            type: selectedOptions.type,
            totalStudents:$scope.totalStudents,
            batchno: (selectedOptions.batchno) ? selectedOptions.batchno : null,
            bStart:(batchStart)?batchStart:null,
            bEnd: (batchEnd)?batchEnd:null,
            year: selectedOptions.year
        };

        syncFb(attInfo); //sync to firebase

        $ionicLoading.hide();
        console.log("successfully took attendance");
    };

    //sync to firebase
    var syncFb = function (attInfo) {

        var isOnline;
        $ionicPlatform.ready(function () {
            isOnline = $cordovaNetwork.isOnline();
        });

        if (isOnline) {
            var att = {
                absentno: attInfo.absentno,
                batch: attInfo.batch,
                date: attInfo.date,
                dept: attInfo.dept.id,
                semester: attInfo.semester.id,
                subid: attInfo.subid.id,
                type: attInfo.type.id,
                batchno: (attInfo.batchno) ? attInfo.batchno.id : null,
                year: attInfo.year.id
            };
            var ref = new Firebase(FirebaseUrl.root);
            ref.child("attendances").push(att);
            storeLocal(attInfo);
        }
        else {
            $ionicPopup.confirm({
                title: "No Internet",
                content: "Cannot send data without Internet"
            });
        }
    };

    var storeLocal = function (attInfo) {
        localforage.getItem('attendances').then(function (data) {
            if (data == null || data.length == 0) {
                var arr = [];
                arr.push(attInfo);
                localforage.setItem('attendances', arr).then(function () {
                    localforage.getItem('attendances').then(function (data) {
                        console.log("1st value pushed");
                        console.log(data);
                    });
                });
            }
            else {
                localforage.getItem('attendances').then(function (data) {
                    data.push(attInfo);
                    localforage.setItem('attendances', data).then(function () {
                        localforage.getItem('attendances').then(function (data) {
                            console.log(data.length + " value pushed");
                            console.log(data);
                        });
                    });
                });
            }
        });
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
        //console.log($stateParams);
        
        if (selectedOptions.type.id == 'pr')
            $scope.batchinfo = {
                pr: true,
                bno: selectedOptions.batchno.id,
                start: bStart,
                end: bEnd
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
        $state.go('main');
    }, 100);

})

.controller("StudentViewCtrl", function($scope, $ionicModal, $ionicPopup) {

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
    //};

    //$scope.showYearOptions = function () {
    //    if ($scope.selected.dept) {
    //        $scope.options = [
    //                        { id: "fe", name: "year", value: "First Year" },
    //                        { id: "se", name: "year", value: "Second Year" },
    //                        { id: "te", name: "year", value: "Third Year" },
    //                        { id: "be", name: "year", value: "Final Year" }];
    //        $scope.modal.show();
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
