angular.module('hazri.services', ['firebase'])


.factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
        var ref = new Firebase("https://hazri.firebaseio.com/");
        return $firebaseAuth(ref);
    }])

.factory("getAllData", function ($firebaseObject) {
        var dataref = new Firebase("https://hazri.firebaseio.com/Department/");
        var dataobj = $firebaseObject(dataref);
        var dataObj = {};
        return {
            getData: function () {
                    dataobj.$loaded().then(function () {       
                    return dataobj;
                    });
            }
        }    
});