
angular.module('hazri.controllers', ['ionic', 'firebase', 'hazri.services'])

.controller("LoginCtrl", function ($scope, $state, $ionicLoading, $ionicHistory, $ionicPopup, $q, FirebaseUrl, $ionicPlatform, $cordovaNetwork, $ionicViewService) {
    var ref = new Firebase(FirebaseUrl.root);

    $scope.login = function (user) {

        if (user && user.email && user.password) {

            var isOnline;
            $ionicPlatform.ready(function () {
                isOnline = $cordovaNetwork.isOnline();
            });

            var log = function () {

                if (isOnline) {
                    var deferred = $q.defer();
                    $ionicLoading.show({
                        template: 'Signing in<br><br><ion-spinner icon="spiral" class="custom-icon"></ion-spinner>',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 500
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
                }
                else
                    $scope.showAlert("No Internet");
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

    $scope.showAlert = function (title, message) {

        var alertPopup = $ionicPopup.alert({
            title: title,
            template: message,
            okType: 'default-primary-color text-primary-color'
        });
        alertPopup.then(function (res) {
            console.log('ok clicked alert');
        });
    };

    $ionicViewService.nextViewOptions({
        disableBack: true
    });

})

.controller("MainCtrl", function ($scope, Firebase, FirebaseUrl, AttendanceService, $ionicPlatform, $ionicPopup, $ionicLoading, $state, $ionicScrollDelegate, $rootScope, $timeout) {

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

    $scope.gotoDetails = function (att) {
        $state.go('details', { att: att });
    }


})

.controller("DetailCtrl", function ($scope, $stateParams, $state) {

    $scope.att = $stateParams.att;

    $scope.showCumAtt = function (att) {

        console.log(att);

        var selectedOptions = {
            absentno: att.absentno,
            batch: att.batch,
            batchno: att.batchno || null,
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

.controller("SelectCtrl", function ($scope, $ionicLoading, $ionicPopup, $q, $state, $ionicScrollDelegate, $timeout, FirebaseUrl) {

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

    function formatDate() {
        var d = new Date(),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    $scope.selected.date = formatDate();
    $scope.showDate = false;
    $scope.toggleDate = function () {
        $scope.showDate = !($scope.showDate);
        if ($scope.showDate)
            $timeout(function () {
                $ionicScrollDelegate.scrollBottom(true);
            }, 200);
        else
            $timeout(function () {
                $ionicScrollDelegate.scrollTop(true);
            }, 200);
    }
    $scope.hideDate = function () {
        $scope.showDate = false;
        $timeout(function () {
            $ionicScrollDelegate.scrollTop(true);
        }, 200);
    }

    $scope.showBatchOptions = function () {

        var batchCount = 0;
        var getBatch = function () {

            var defer = $q.defer();
            $ionicLoading.show({ template: "Getting Batch info..." });
            var ref = new Firebase(FirebaseUrl.root);
            ref.child("studentCount/"+$scope.selected.dept.id).on("value",
            function (snapshot) {
                snapshot.forEach(function (data) {
                    if ($scope.selected.year.id == data.val().year) {
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
            ref.child("subjects/" + $scope.selected.dept.id).on("value",
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
        if (option.id == 'dept') {
            $scope.toggleOption(option);
        }

        else if (option.id == 'year') {
            if ($scope.selected.dept) {
                $scope.toggleOption(option);
            }
            else
                $scope.showAlert('Uh uh..', 'Please select dept');
        }

        else if (option.id == 'semester') {
            if ($scope.selected.year) {
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
        else if (option.id == 'type') {
            if ($scope.selected.semester) {
                $scope.toggleOption(option);
            }
            else
                $scope.showAlert('Uh uh..', 'Please select semester');
        }

        else if (option.id == 'batchno') {
            if ($scope.selected.type) {
                if ($scope.selected.type.id == 'pr') {
                    $scope.options[4].values = [];
                    $scope.showBatchOptions();
                    $scope.toggleOption(option);
                }
            }
            else
                $scope.showAlert('Uh uh..', 'Please select type');
        }
        else if (option.id == 'subject') {
            if (($scope.selected.type && $scope.selected.type.id == 'th') || ($scope.selected.type && $scope.selected.type.id == 'pr' && $scope.selected.batchno)) {
                $scope.options[5].values = [];
                $scope.showSubOptions();
                $scope.toggleOption(option);
            }
            else
                $scope.showAlert('Uh uh..', 'Please select above fields');

        }

    };

    $scope.setSelected = function (item, option) {

        $scope.selected[option.id] = { id: item.id, value: item.value };

        $scope.toggleOption(option);

        if ($scope.selected.type && $scope.selected.type.id == 'pr')
            $scope.options[4].show = true;
        if ($scope.selected.type && $scope.selected.type.id == 'th') {
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
            template: message,
            okType: 'default-primary-color text-primary-color'
        });
        alertPopup.then(function (res) {
            console.log('ok clicked alert');
        });
    };

    $scope.gotoAtt = function (selected) {
        $state.go("attendance", { selected: selected });
    };

})

.controller("AttendanceCtrl", function ($scope, $rootScope, $stateParams, $q, $ionicLoading, $ionicPopup, $ionicPopover, $state, FirebaseUrl, $ionicPlatform, $cordovaNetwork, $ionicViewService) {
    var selectedOptions;
    var batchStart, batchEnd;

    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state take attendance");
        $scope.students  = [];
        batchStart = batchEnd = undefined;
        selectedOptions = $stateParams.selected;
        $scope.totalStudents = 0;

        var getNo = function () {
            var deferred = $q.defer();
            $ionicLoading.show({ template: 'Loading student count..' });

            var ref = new Firebase(FirebaseUrl.root);
            ref.child("studentCount/"+selectedOptions.dept.id).on("value", function (snapshot) {
                snapshot.forEach(function (data) {
                    if (selectedOptions.year.id == data.val().year) //add batch code later
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
        }, function (reason) {
            $ionicLoading.hide();
            alert('Failed: ' + reason);
        }, function (update) {
            $ionicLoading.hide();
            alert('Got notification: ' + update);
        });


        var getStudentInfo = function () {
            var deferred = $q.defer();
            $ionicLoading.show({ template: 'Loading student info..' });

            var ref = new Firebase(FirebaseUrl.root);
            ref.child("students/" + selectedOptions.dept.id).on("value", function (snapshot) {

                snapshot.forEach(function (data) {
                    if (selectedOptions.year.id == data.val().year) //add batch code later
                    {
                        if (selectedOptions.type.id == 'pr') {
                            if(data.val().rollno >= batchStart && data.val().rollno <= batchEnd)
                                $scope.students.push({ id: data.key(), name: data.val().name, rollno: data.val().rollno, absent:false });
                        }
                        else
                                $scope.students.push({ id: data.key(), name: data.val().name, rollno: data.val().rollno, absent:false });
                    }
                });

                deferred.resolve();
            }, function (error) {
                console.log("error:" + error.code);
                deferred.reject();
            });

            return deferred.promise;
        };

        var promise = getStudentInfo();

        promise.then(function () {
            $ionicLoading.hide();
        }, function (reason) {
            $ionicLoading.hide();
            alert('Failed: ' + reason);
        }, function (update) {
            $ionicLoading.hide();
            alert('Got notification: ' + update);
        });

    });

    $scope.showConfirm = function () {
        console.log($scope.students);
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm Submit',
            template: 'Are you sure you want to submit?',
            okType: 'default-primary-color text-primary-color',
            okText: 'Yes',
            cancelText: 'No'
        });
        confirmPopup.then(function (res) {
            if (res) {
                console.log('You are sure');
                $ionicLoading.show({ template: 'Updating attendance...' });
                updateAttendance();
                $state.go("main");

            } else {
                console.log('You are not sure');
            }
        });
    };

    var updateAttendance = function () {
        var absent = [];
        for (var i = 0 ; i < $scope.students.length ; i++)
            if ($scope.students[i].absent === true)
                absent.push($scope.students[i].rollno);
        console.log(absent);
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
            totalStudents: $scope.totalStudents,
            batchno: (selectedOptions.batchno) ? selectedOptions.batchno : null,
            bStart: (batchStart) ? batchStart : null,
            bEnd: (batchEnd) ? batchEnd : null,
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
                year: attInfo.year.id,
                uploaded: true
            };
            var ref = new Firebase(FirebaseUrl.root);
            ref.child("attendances").push(att);
            storeLocal(attInfo);
        }
        else {
            $ionicPopup.confirm({
                title: "No Internet",
                content: "Please ensure that you're connected to the internet.",
                okType: 'default-primary-color text-primary-color'
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

    $scope.showInfo = function ($event,student) {
        var template = '<ion-popover-view><ion-header style="text-align:center;color:white;"><strong>'+student.name+'</strong></ion-header></ion-popover-view>';
        $scope.popover = $ionicPopover.fromTemplate(template, {
             scope: $scope
        });
        $scope.popover.show($event);
    };

    $scope.toggle = function (student) {
       student.absent = !student.absent;
    };

    $ionicViewService.nextViewOptions({
        disableBack: true
    });


})

.controller("ViewAttendanceCtrl", function ($scope, $stateParams, FirebaseUrl, $q, $ionicLoading, $ionicPlatform, $state) {
    var selectedOptions;
    var totalStudents;
    var cumulativeAttendance;
    var totalLectures;
    var bStart, bEnd;
    $scope.batchinfo = { pr: false };

    $scope.$on('$ionicView.beforeEnter', function () {

        selectedOptions = $stateParams.selected;
        totalStudents = $stateParams.totalStudents;
        bStart = $stateParams.bStart;
        bEnd = $stateParams.bEnd;

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

        var getStudentInfo = function () {
            var deferred = $q.defer();
            $ionicLoading.show({ template: 'Loading student info..' });
            var ref = new Firebase(FirebaseUrl.root);
            ref.child("students/" + selectedOptions.dept.id).on("value", function (snapshot) {

                snapshot.forEach(function (data) {
                    if (selectedOptions.year.id == data.val().year) //add batch code later
                    {
                        var studentObj = {rollno:data.val().rollno, name:data.val().name, att:0};
                        if (selectedOptions.type.id == 'pr') {
                            if (studentObj.rollno >= bStart && studentObj.rollno <= bEnd)
                                cumulativeAttendance.push(studentObj);
                        }
                        else
                            cumulativeAttendance.push(studentObj);
                    }
                });

                deferred.resolve();
            }, function (error) {
                console.log("error:" + error.code);
                deferred.reject();
            });

            return deferred.promise;
        };

        var promise = getStudentInfo();

        promise.then(function () {
            $ionicLoading.hide();
        }, function (reason) {
            $ionicLoading.hide();
            console.log('Failed: ' + reason);
        });

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
                        else {
                            if (selectedOptions.batchno.id == data.val().batchno) {
                                totalLectures++;
                                var i;
                                for (i = 0; i < bEnd - bStart + 1; i++)
                                    cumulativeAttendance[i].att++;
                                var absentno = data.val().absentno;
                                if (absentno !== undefined) //absentno undefined means all present
                                {
                                    var arraylength = absentno.length;
                                    for (i = 0; i < arraylength ; i++)
                                        cumulativeAttendance[absentno[i] - bStart].att--;
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

});

