
angular.module('hazri.controllers', ['ionic', 'firebase', 'hazri.services'])

.controller("LoginCtrl", function ($scope, $state, $ionicLoading, $ionicHistory, $ionicPopup, $q, FirebaseUrl, $ionicPlatform, $cordovaNetwork, $ionicViewService, $cordovaGoogleAds) {
    
    $scope.$on('$ionicView.enter', function () {

        if (AdMob) AdMob.hideBanner();

    });
    
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
                        template: 'Signing in<br><br><ion-spinner icon="android" class="spinner-balanced"></ion-spinner>',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 250,
                        showDelay: 100
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

.controller("MainCtrl", function ($scope, Firebase, FirebaseUrl, AttendanceService, DBService, $ionicPopup, $ionicLoading, $state, $rootScope, $cordovaGoogleAds,$ionicPlatform,$cordovaNetwork,$ionicPopup) {

    $rootScope.slideHeader = false;
    $rootScope.slideHeaderPrevious = 0;

    $scope.$on('$ionicView.enter', function () {
        console.log("in main");

        if(AdMob)
            AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);

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

        localforage.getItem('hazridata').then(function (data) {
            if(!data)
            {
                console.log('no data');
                DBService.getData().then(function (data) {
                    console.log('getting data');
                    localforage.setItem('hazridata', data).then(function(){
                        console.log('firebase data retrieved successfully');
                    });
                });
            }
            else
            {
                console.log('yes data');
            }
        });
    });

    $scope.syncFb = function (att) {

        var isOnline;
        $ionicPlatform.ready(function () {
            isOnline = $cordovaNetwork.isOnline();
        });

        if (isOnline) {
            att = JSON.parse(angular.toJson(att));
            var ref = new Firebase(FirebaseUrl.root);
            ref.child("attendances").push(att);
            att.uploaded = true;

            localforage.getItem('attendances').then(function(attendances) {
                attendances.splice(att.id, 1); //remove item
                attendances.splice(att.id, 0, att); //add new item at the same position
                localforage.setItem('attendances',attendances).then(function(){
                    console.log('updated attendance successfully');
                });
            });
        }
        else {
            $ionicPopup.confirm({
                title: "No Internet",
                content: "Cannot connect to internet. This attendance will not by synced to database. Make sure to sync when internet is available.",
                okType: 'default-primary-color text-primary-color'
            });
        }
    };

    $scope.clear = function () {
        localforage.clear();
    }

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
    var hazridata;

    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state select");
        //initialize values
        
        localforage.getItem('hazridata').then(function (data) {
            hazridata = data;
        })

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
        var studentCount;

        $ionicLoading.show({ template: "Getting Batch info..." });
        studentCount = hazridata.studentCount[$scope.selected.dept.id];

        for (var key in studentCount) {
            if (studentCount.hasOwnProperty(key)) {
                var data = studentCount[key];
                if ($scope.selected.year.id == data.year) {
                    batchCount = Object.keys(data.batchno).length;
                }
            }
        }
                
        if (batchCount > 0) {
            for (var i = 1 ; i <= batchCount; i++) {
                $scope.options[4].values.push({ id: i, value: "Batch " + i });
            }
        }
        $ionicLoading.hide();

    };

    $scope.showSubOptions = function () {

        //proceed only if type field is selected and if type is practical then make sure that batch field is selected

        $ionicLoading.show({ template: "Getting subject list..." });
        
        subjects = hazridata.subjects[$scope.selected.dept.id];

        for (var key in subjects) {
            if (subjects.hasOwnProperty(key)) {
                var data = subjects[key];
                if ($scope.selected.dept.id == data.dept_id && $scope.selected.year.id == data.year && $scope.selected.semester.id == data.sem) {
                        if ($scope.selected.type.id == "th" && data.theory)
                            $scope.options[5].values.push({ id: key, value: data.fullname });
                        if ($scope.selected.type.id == "pr" && data.practical)
                            $scope.options[5].values.push({ id: key, value: data.fullname });
                }
            }
        }
                
        $ionicLoading.hide();

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

.controller("AttendanceCtrl", function ($scope, $rootScope, $stateParams, $q, $ionicLoading, $ionicPopup, $ionicPopover, $state, FirebaseUrl, $ionicPlatform, $cordovaNetwork, $ionicViewService, $timeout) {
    var selectedOptions;
    var batchStart, batchEnd;
    var hazridata;

    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state take attendance");
        $scope.students  = [];
        batchStart = batchEnd = undefined;
        selectedOptions = $stateParams.selected;
        $scope.totalStudents = 0;

        $ionicLoading.show({ template: "Loading student count..." });
        
        localforage.getItem('hazridata').then(function (data) {
            hazridata = data;

            studentCount = hazridata.studentCount[selectedOptions.dept.id];

            for (var key in studentCount) {
                if (studentCount.hasOwnProperty(key)) {
                    var data = studentCount[key];
                    if (selectedOptions.year.id == data.year) //add batch code later
                    {
                        $scope.totalStudents = data.count;
                        if (selectedOptions.batchno) {
                            batchStart = data.batchno[selectedOptions.batchno.id];
                            if (selectedOptions.batchno.id == Object.keys(data.batchno).length) //if batch selected is last batch
                                batchEnd = $scope.totalStudents;
                            else
                                batchEnd = data.batchno[selectedOptions.batchno.id + 1] - 1;
                        }
                    }
                }
            }

            students = hazridata.students[selectedOptions.dept.id];

            for (var key in students) {
                if (students.hasOwnProperty(key)) {
                    var data = students[key];
                    if (selectedOptions.year.id == data.year) //add batch code later
                    {
                        if (selectedOptions.type.id == 'pr') {
                            if(data.rollno >= batchStart && data.rollno <= batchEnd)
                                $scope.students.push({ id: key, name: data.name, rollno: data.rollno, absent:false });
                        }
                        else
                                $scope.students.push({ id: key, name: data.name, rollno: data.rollno, absent:false });
                    }
                }
            }

            $ionicLoading.hide();

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
                //$state.go("main"); //state.go moved to syncFb function

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
        syncFb(attInfo);
        $ionicLoading.hide();
        console.log("successfully took attendance");
    };

    //sync if internet is available, else store in local
    var syncFb = function (attInfo) {

        var isOnline;
        $ionicPlatform.ready(function () {
            isOnline = $cordovaNetwork.isOnline();
        });

        if (isOnline) {
            var att = attInfo;
            att.bStart = null;
            att.bEnd = null;
            att.uploaded = true;
            var ref = new Firebase(FirebaseUrl.root);
            ref.child("attendances").push(att);
            storeLocal(att);
        }
        else {
            var att = attInfo;
            att.bStart = null;
            att.bEnd = null;
            att.uploaded = false;
            storeLocal(att);

            var alertPopup = $ionicPopup.alert({
                title: "No Internet",
                template: "Cannot connect to internet. This attendance will not by synced to database. Make sure to sync when internet is available.",
                okType: 'default-primary-color text-primary-color'
            });
            alertPopup.then(function (res) {
                $state.go("main");
            });
        }
    };

    var storeLocal = function (attInfo) {
        localforage.getItem('attendances').then(function (data) {
            if (data == null || data.length == 0) {
                var arr = [];
                attInfo.id = arr.length;
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
                    attInfo.id = data.length;
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

