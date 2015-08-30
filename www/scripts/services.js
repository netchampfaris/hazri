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
})

.factory("firebaseNode", function () {
    
    return {

        getChildren: function (params) {
            var list = [];
            var str = "https://hazri.firebaseio.com/";
            for (var int = 0; i < params.length; i++)
                str += params[i] + "/";
            var ref = new Firebase(str);
            ref.orderbyKey().on("value", function (snapshot) {
                snapshot.forEach(function (data) {
                    list.push({ text: data.key() });
                });
            }, function (error) {
                console.log(error);
            });
            return list;
        }

    }

});