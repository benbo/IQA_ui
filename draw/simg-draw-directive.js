'use strict';

imageMap
/**
 * a wrapper of jquery-canvas-area-draw
 */
.directive('imageMap', ['$timeout', function($timeout){
    return {
        scope : {
            imageMap : '=',
        },
        link: function(scope, element, attrs){
            scope.$watch('imageMap', function (newValue) {
                if(newValue) {
                    $(element).canvasAreaDraw({
                        imageUrl: newValue
                    });
                }
            });

        }
    }
}]);
