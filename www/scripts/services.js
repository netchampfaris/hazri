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
});