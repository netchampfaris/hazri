
angular.module('hazri.controllers', ['ionic', 'firebase', 'hazri.services'])

.controller("LoginCtrl", function ($scope, $state, $ionicLoading, $ionicHistory, $ionicPopup, $q, FirebaseUrl, $ionicPlatform, $cordovaNetwork, $cordovaGoogleAds) {

    $scope.$on('$ionicView.enter', function () {
        if (AdMob) AdMob.hideBanner();
    });

    $scope.$on('$ionicView.leave', function () {
        if (AdMob) AdMob.showBanner(AdMob.AD_POSITION.BOTTOM_CENTER);
    });

    var ref = new Firebase(FirebaseUrl.root);

    $scope.login = function (user) {

        cordova.plugins.Keyboard.close();

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

    $ionicHistory.nextViewOptions({
        disableBack: true
    });

})

.controller("MainCtrl", function ($scope, Firebase, FirebaseUrl, AttendanceService, DBService, $ionicPopup, $ionicLoading, $ionicModal, $timeout, $state, $rootScope, $q, $cordovaGoogleAds, $cordovaAppVersion, $cordovaToast, $ionicPlatform, $cordovaNetwork) {

    $rootScope.slideHeader = false;
    $rootScope.slideHeaderPrevious = 0;
    $scope.attendances = [];

    $scope.$on('$ionicView.beforeEnter', function () {
        $ionicLoading.show({
            content: 'Loading',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        AttendanceService.getAttendances().then(function(data){
            $scope.attendances = data;
            //$scope.$apply();
            $ionicLoading.hide();
        },function(){
            console.log('error retrieving attendances');
        });
    });

    $scope.$on('$ionicView.enter', function () {
        console.log("in main a");

    });

    $scope.syncFb = function (att, key) {

        var attFb = {
            absentno: att.absentno,
            date: att.date,
            dept: att.dept.id,
            semester: att.semester.id,
            subid: att.subid.id,
            topic: att.topic,
            type: att.type.id,
            noofhours: att.noofhours,
            batchno: (att.batchno) ? att.batchno.id : null,
            year: att.year.id,
            timestamp: Firebase.ServerValue.TIMESTAMP,
            teacher: $rootScope.authData.uid
        };

        var isOnline;
        $ionicPlatform.ready(function () {
            isOnline = $cordovaNetwork.isOnline();
        });

        var sync = function () {

            var defer = $q.defer();
            if (isOnline) {
                //reject promise after 60 secs, for conditions when wifi is connected but internet is not working
                $timeout(function () {
                    defer.reject();
                },60000);
                var ref = new Firebase(FirebaseUrl.root);
                ref.child("attendances/" + att.dept.id).push(attFb, function (error) {
                    if (error) {
                        console.log("firebase push error");
                        defer.reject();
                    }
                    else {
                        console.log('fb pushed');

                        localforage.getItem('attendances').then(function (attendances) {
                            attendances[key]['uploaded'] = true;
                            att.uploaded = true;
                            localforage.setItem('attendances', attendances).then(function () {
                                console.log('updated attendance successfully');
                            });
                            defer.resolve();
                        });
                    }
                });
            }
            else {
                defer.reject();
            }
            return defer.promise;
        };

        $ionicLoading.show({template:'Syncing..'});
        sync().then(function () {
            $ionicLoading.hide();
            console.log("sucessfull");
        }, function (error) {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: "No Internet",
                content: "Cannot connect to internet. This attendance will not be synced to database. Make sure to sync when internet is available.",
                okType: 'default-primary-color text-primary-color'
            });
        });

    };

    $scope.deleteAtt = function(key) {
        localforage.getItem('attendances').then(function (attendances) {
            console.log(key);
            delete attendances[key];
            delete $scope.attendances[key];
            $scope.$apply();
            localforage.setItem('attendances', attendances).then(function () {
                console.log('deleted '+key+' attendance successfully');
            });
        });
    }

    $scope.gotoDetails = function (att) {
        $state.go('details', { att: att });
    };

    $scope.newAtt = function () {
        localforage.getItem('hazridata').then(function (data) {
            if(data === null)
            {
                $ionicPopup.confirm({
                    title: "No data",
                    content: "In order to take attendance you need to download the student data from server",
                    okType: 'default-primary-color text-primary-color',
                    okText: 'Download',
                    cancelText: 'Cancel'
                }).then(function (res) {
                    if(res) {
                        $ionicLoading.show({template:"Downloading.."});
                        DBService.fetchData().then(function () {
                            $ionicLoading.hide();
                            $state.go('select');
                        }, function () {
                            alert('error downloading data');
                        });
                        console.log('yes');
                    }
                });
            }
            else $state.go('select');
        });
    };

    $ionicModal.fromTemplateUrl('templates/settings.html', function($ionicModal) {
        $scope.modal = $ionicModal;
    }, {
        scope: $scope,
        animation: 'slide-in-up'
    });

    $scope.clear = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Attendance data from device?',
            template: 'Note: Both synced and unsynced attendances will be deleted. If there are unsynced attendances, please sync them first.',
            okType: 'accent-color text-primary-color',
            okText: 'Delete',
            cancelText: 'Cancel'
        });
        confirmPopup.then(function (res) {
            if (res) {
                localforage.removeItem('attendances').then(function () {
                    $scope.attendances = {};
                    console.log('data deleted successfully');
                });
            } else {
                console.log('delete cancelled');
            }
        });
    };

    $scope.download = function () {
        $ionicLoading.show({
            template: 'Downloading<br><ion-spinner icon="android" class="spinner-balanced"></ion-spinner>',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 250
        });
        DBService.fetchData().then(function() {
            $ionicLoading.hide();
        });
    };

    $scope.about = function () {

        var appVersion = $rootScope.appVersion;
        
        var alertPopup = $ionicPopup.alert({
            title: "About",
            template: "<p style='text-align:center'>Attendr v"+appVersion+"<br>codename: hazri<br> Copyright &copy 2015</p>",
            okType: 'default-primary-color text-primary-color'
        });
        alertPopup.then(function (res) {
            console.log('ok clicked alert');
        });
    };

})

.controller("DetailCtrl", function ($scope, $stateParams, $state) {

    $scope.att = $stateParams.att;

    $scope.showCumAtt = function (att) {

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

        $scope.options = [
            {
                id: "dept",
                name: "Department",
                values: []
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

        localforage.getItem('hazridata').then(function (data) {
            hazridata = data;
            var depts = hazridata.departments;
            for (var key in depts) {
                if (depts.hasOwnProperty(key)) {
                    var value = depts[key]['name'];
                    $scope.options[0].values.push({id:key,value:value});
                }
            }
        });

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
    };
    $scope.hideDate = function () {
        $scope.showDate = false;
        $timeout(function () {
            $ionicScrollDelegate.scrollTop(true);
        }, 200);
    };

    $scope.showBatchOptions = function () {

        var batchCount = 0;
        var studentCount;

        //$ionicLoading.show({ template: "Getting Batch info..." });
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
        //$ionicLoading.hide();

    };

    $scope.showSubOptions = function () {

        //proceed only if type field is selected and if type is practical then make sure that batch field is selected

        //$ionicLoading.show({ template: "Getting subject list..." });

        var subjects = hazridata.subjects[$scope.selected.dept.id];

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

        //$ionicLoading.hide();

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

        if ($scope.selected.type && $scope.selected.type.id == 'pr') {
            $scope.options[4].show = true;
            $scope.selected.noofhours = 2;
        }
        if ($scope.selected.type && $scope.selected.type.id == 'th') {
            $scope.selected.noofhours = 1;
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

        $ionicLoading.show({template: "Loading.."});

        var students = [];
        var batchStart;
        var batchEnd;
        var totalStudents = 0;
        var selectedOptions = selected;

        localforage.getItem('hazridata').then(function (hdata) {
            hazridata = hdata;

            var studentCount = hazridata.studentCount[selectedOptions.dept.id];
            var key, data;
            //console.log(hazridata);

            for (key in studentCount) {
                if (studentCount.hasOwnProperty(key)) {
                    data = studentCount[key];
                    if (selectedOptions.year.id == data.year) //add batch code later
                    {
                        totalStudents = data.count;
                        if (selectedOptions.batchno) {
                            batchStart = data.batchno[selectedOptions.batchno.id];
                            if (selectedOptions.batchno.id == Object.keys(data.batchno).length) //if batch selected is last batch
                                batchEnd = totalStudents;
                            else
                                batchEnd = data.batchno[selectedOptions.batchno.id + 1] - 1;
                        }
                        //console.log(batchStart, batchEnd);
                    }
                }
            }

            var studentsNode = hazridata.students[selectedOptions.dept.id];

            for (key in studentsNode) {
                if (studentsNode.hasOwnProperty(key)) {
                    data = studentsNode[key];
                    if (selectedOptions.year.id == data.year) //add batch code later
                    {
                        if (selectedOptions.type.id == 'pr') {
                            data.rollno = parseInt(data.rollno);
                            if (data.rollno >= batchStart && data.rollno <= batchEnd){
                                students.push({ id: key, name: data.name, rollno: data.rollno, absent: false });
                            }
                        }
                        else
                            students.push({ id: key, name: data.name, rollno: data.rollno, absent: false });
                    }
                }
            }
            $ionicLoading.hide();

        });

        $state.go("attendance", { selected: selected, students: students, totalStudents: totalStudents, batchStart: batchStart, batchEnd: batchEnd });
    };

})

.controller("AttendanceCtrl", function ($scope, $rootScope, $stateParams, $q, $ionicLoading, $ionicPopup, $ionicPopover, $state, FirebaseUrl, $ionicPlatform, $cordovaNetwork, $ionicHistory, $timeout) {
    var selectedOptions;
    var batchStart, batchEnd;
    $scope.topic = {};
    $scope.topic.name = '';


    $scope.$on('$ionicView.beforeEnter', function () {
        console.log("entered state take attendance");
        $scope.students = $stateParams.students;
        batchStart = $stateParams.batchStart;
        batchEnd = $stateParams.batchEnd;
        selectedOptions = $stateParams.selected;
        $scope.totalStudents = $stateParams.totalStudents;

        console.log($stateParams);
    });

    $scope.askTopic = function() {
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="topic.name">',
            title: 'Would you like to enter the topic you just taught?',
            subTitle: 'Please use specific topic name',
            scope: $scope,
            buttons: [
                { text: 'No' },
                {
                    text: '<b>Yes</b>',
                    type: 'default-primary-color text-primary-color',
                    onTap: function (e) {
                        if(!$scope.topic.name){
                            e.preventDefault();
                        }
                        else
                        return $scope.topic.name;
                    }
                }
            ]
        });
        myPopup.then(function(res) {
            if(res)
                console.log('topic added:'+$scope.topic.name);
            else
                console.log('no topic');
            $scope.showConfirm();
        });
    };

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
                $timeout(function () {
                    updateAttendance();
                }, 1000);
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

        //attendance object to store in local
        var attLocal = {
            absentno: absent,
            date: selectedOptions.date,
            dept: selectedOptions.dept,
            semester: selectedOptions.semester,
            subid: selectedOptions.subject,
            topic: $scope.topic.name,
            type: selectedOptions.type,
            noofhours: selectedOptions.noofhours,
            totalStudents: $scope.totalStudents,
            batchno: selectedOptions.batchno || null,
            bStart: batchStart || null,
            bEnd: batchEnd || null,
            year: selectedOptions.year,
            uploaded: false
        };

        storeLocal(attLocal).then(function () {
            $state.go("main");
        });
        console.log("successfully took attendance");
    };

    var storeLocal = function (attInfo) {
        var defer = $q.defer();
        localforage.getItem('attendances').then(function (data) {
            if (data === null || data.length === 0) {
                var attendances = {};
                attendances['att0'] = attInfo;
                console.log(attendances);
                localforage.setItem('attendances', attendances).then(function () {
                    localforage.getItem('attendances').then(function (data) {
                        console.log("1st value pushed");
                        console.log(data);
                        defer.resolve();
                    });
                });
            }
            else {
                localforage.getItem('attendances').then(function (data) {
                    var newkey = 'att' + newIndex(data);
                    data[newkey] = attInfo;
                    localforage.setItem('attendances', data).then(function () {
                        localforage.getItem('attendances').then(function (data) {
                            console.log(newkey + " value pushed");
                            console.log(data);
                            defer.resolve();
                        });
                    });
                });
            }
        });
        return defer.promise;
    };

    var newIndex = function(object) {
        var max = 0;
        for(var key in object){
            if(object.hasOwnProperty(key)){
                var num = parseInt(key.slice(-1));
                if(num > max) max = num;
            }
        }
        return max + 1;
    };

    $scope.showInfo = function ($event, student) {
        var template = '<ion-popover-view><ion-header style="text-align:center;color:white;"><strong>' + student.name + '</strong></ion-header></ion-popover-view>';
        $scope.popover = $ionicPopover.fromTemplate(template, {
            scope: $scope
        });
        $scope.popover.show($event);
    };

    $scope.toggle = function (student) {
        student.absent = !student.absent;
    };

    $ionicHistory.nextViewOptions({
        disableBack: true
    });

})

.controller("ViewAttendanceCtrl", function ($scope, $stateParams, FirebaseUrl, $q, $ionicLoading, $ionicPlatform, $state, $http) {

    $ionicLoading.show({template: "Loading..."});
    var selectedOptions = $stateParams.selected;
    var dept = selectedOptions.dept.id;
    var year = selectedOptions.year.id;
    var sem = selectedOptions.semester.id;
    var sub = selectedOptions.subject.id;
    $scope.batchno = (selectedOptions.batchno)?selectedOptions.batchno.id: null;
    $http({
        method: 'GET',
        url: 'http://cors.io/?u=http://bvcoeportal.orgfree.com/api/subject_att_calc.php/' + dept + '/' + year + '/' + sem + '/' + sub
    }).then(function(response){

        if(selectedOptions.type.id == 'pr')
        {
            $scope.items = response.data.attDataPr[sub][$scope.batchno-1];
        }
        else
        {
            $scope.items = response.data.attDataTh[sub];
        }
        $ionicLoading.hide();
    },function(error){
        console.log(error);
    });

    $ionicPlatform.registerBackButtonAction(function (event) {
        $state.go('main');
    }, 100);

});
