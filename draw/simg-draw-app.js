'use strict';

simgDrawApp

.controller('simgDrawAppCtrl', [ '$scope', '$window', '$http', 
    function($scope, $window, $http) {

        $scope.image = {
            url: 'https://www.petfinder.com/wp-content/uploads/2012/11/99233806-bringing-home-new-cat-632x475.jpg',
            path : undefined
        };

}]);
