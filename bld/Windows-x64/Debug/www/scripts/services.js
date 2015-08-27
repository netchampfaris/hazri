angular.module('hazri.services', ['firebase'])


        .factory("Auth", ["$firebaseAuth",
         function ($firebaseAuth) {
             var ref = new Firebase("https://hazri.firebaseio.com/");
             return $firebaseAuth(ref);
         }]);