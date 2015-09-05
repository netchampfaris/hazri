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
});