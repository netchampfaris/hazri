var att = angular.module('hazri', ['ngMaterial','firebase'] );
//att.requires.push('firebase');
att.controller('rollList', ["$scope", "$firebaseArray",
  function($scope, $firebaseArray) {

  var ref = new Firebase("https://hazri.firebaseio.com/absentroll");  
    var fb = $firebaseArray(ref);

    $scope.no = $firebaseArray(ref);

    //var abs = $scope.list || "none";
    //$scope.no.$add({ absent: abs});

  $scope.number = 50;

  $scope.setval=function()
  { 
  $scope.items= []; 
  for(var i=0; i< $scope.number ;i++)
    $scope.items.push(i+1);
    
  };
  
   $scope.selected = [];
      $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
          var newvar = fb.$indexFor(item.id);
          fb.$remove(newvar).then(function(ref) {
                 ref.key() === item.$id; // true
});
      }
        else 
          {
            list.push(item);
            fb.$add(item).then(function(ref) {
            $scope.data = item;
            $data.id= ref.key();            
            //fb.$indexFor(id);
          });
          }
      };

      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };

}

]);