angular.module('hazri.services', ['firebase'])


.factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
        var ref = new Firebase("https://hazri.firebaseio.com/");
        return $firebaseAuth(ref);
    }])

.factory("getData",
    function () {
        var ref = new Firebase("https://hazri.firebaseio.com/Department/");
        ref.on("value", function (snapshot) {
            return snapshot;
        }, function (error) {
            return {};
        });
        
});