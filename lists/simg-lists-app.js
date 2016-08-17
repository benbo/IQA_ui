'use strict';

simgListsApp

.controller('simgListsAppCtrl', [ '$scope', '$window', '$http', '$sce', '$stateParams', '$location', '$interval',
                                      function($scope, $window, $http, $sce, $stateParams, $location, $interval) {

    var GROUP_SIZE = 3; // A group contains an array of no more than 3 items.
    var items = []; // store all images in the result
    $scope.imageGroups = [];
    $scope.state = {
        totalImages: 0
    }

    var data = { // the reqeust data
        resource_url : '',
        _id : ''
    };
    if ($stateParams.data && $stateParams.data.result && $stateParams.data.result.href) {
        var list = $stateParams.data.result.href.split('/');
        if(list.length == 2) {
            data.resource_url = list[0];
            data._id = list[1];
        } else {
            console.warn("Can\'t obtain URL from '" + $stateParams.data.result.href + "'");
        }
    } else {
        console.log("Blank response. Use 5744645ee3c45379ae86f2cc");
        data = {resource_url: 'result', 
            _id:'5744645ee3c45379ae86f2cc'}; // XXX for debugging only
    }

    var apiUrl = 'http://127.0.0.1:5050/api';

    var request = {
        method: 'GET',
        url: apiUrl + '/' + data.resource_url + '?where={"_id":"'+data._id+'"}', // FIXME use transformRequest to process the data instead
        data: {
            where: {
                _id : data._id
            }
        },
    };

    /**
     * TODO make this more robust: meaning no string based fiddling, no hard coded string, etc.
     *
     * fs: /mnt/xfsdata/simg/images/12/19/Indiana_2015_12_19_1450508893000_8_4.jpg
     *
     * @returns /image/12/19/Indiana_2015_12_19_1450508893000_8_4.jpg
     */
    function mkImgUrl(fs) {
        var fsUrl = '';
        if(fs) {
            fsUrl = fs.replace('/mnt/xfsdata/simg', '');
        }
        return fsUrl;
    }

    /*
     * images = success.data._items
     */
    function drawBase64Images(images) {
        if(images) {
            images.forEach(function(obj){
                var url = undefined;
                if(obj.file) {
                    var contentType = 'image/jpeg';
                    var content = "data:" + contentType + ";base64," + obj.file;
                    url = content;
                }

                var img = {
                    name: obj.name,
                    url: url
                };

                $scope.images.push(img);
            });
        }
    };

    /**
     * clear image array
     */
    function clearImages () {
        items = [];
        $scope.imageGroups = [];
        $scope.state = {
            totalImages: 0
        };
    }

    /**
     * Returns the number of items in display
     */
    $scope.itemCount = function () {
        var len = $scope.imageGroups.length;
        var start = 0; 
        if(len > 1) {
            start = (len-1) * GROUP_SIZE + $scope.imageGroups[len-1].length;
        } else if(len == 0) {
            start = 0;
        } else { // len == 1
            start = $scope.imageGroups[len-1].length;
        }
        return start;
    }

    /**
     * dynamically add more items to the list.
     *
     * @param size - int, max number of items to add
     */
    $scope.addMoreItems = function(size) {
        var len = $scope.imageGroups.length;
        var start = $scope.itemCount(); 
        for (var i = start; i < items.length && i-start < size; ++i) {
            var len = $scope.imageGroups.length;
            if($scope.imageGroups[len-1] && $scope.imageGroups[len-1].length < GROUP_SIZE) {
                $scope.imageGroups[len-1].push(items[i]);
            } else { // if the last array is full, create a new array
                $scope.imageGroups.push([items[i]]);
            }
        }
    }

    /**
     * Stop the query
     */
    $scope.cancel = function () {
        if(stop) {
            $interval.cancel(stop);
            NProgress.done();
        }
    }

    /**************************************************************
     *
     *                          MAIN 
     *
     *************************************************************/
    NProgress.start();

    var delayMs = 1000;
    var stop;
    stop = $interval(function(){
        $http(request)
        .then(function(success){
            clearImages();

            var rs = success.data._items;
            if (rs && rs[0]  && rs[0].status && rs[0].result)  { 
                var imgs = [];
                rs[0].result.forEach(function(e){
                    var img = {
                        url: mkImgUrl(e[0]),
                        score: e[1]
                    }
                    imgs.push(img);
                });

                // sort by score in ascending order
                items = imgs.sort(function(a, b){
                    return a.score - b.score;
                });

                $scope.state.totalImages = items.length;
                $scope.addMoreItems(6);
                $interval.cancel(stop);
                NProgress.done();
            }
            //drawBase64Images(success.data._items);

        }, function(error){
            clearImages();

            console.error(error);
            $interval.cancel(stop);
            NProgress.done();
        });
    }, delayMs);
}]);

