'use strict';

simgImageApp

.controller('simgImageAppCtrl', [ '$scope', '$window', '$http', '$state', '$interval',
                                      function($scope, $window, $http, $state, $interval) {
    $scope.submitted = false;
    $scope.file = {};
    $scope.params = {
        randomized_location : false,
        randomized_scale : false
    };

    var GROUP_SIZE = 3; // A group contains an array of no more than 3 items.
    var items = []; // store all images in the result
    $scope.imageGroups = [];
    $scope.state = {
        totalImages: 0
    }

    /*
     * handles a single file from input[file] element
     */
    $scope.fileNameChanged = function(ele) {
        var files = ele.files;

        if(files && files.length > 0) {
            var f = files[0];

            $scope.file =  {
                url: $window.URL.createObjectURL(f),
                content: f,
                name: f.name,
                size: fileSizeSI(f.size),
                path : undefined
            }

            $scope.$apply();
        }
    }

    function fileSizeSI(a,b,c,d,e){
         return (b=Math,c=b.log,d=1e3,e=c(a)/c(d)|0,a/b.pow(d,e)).toFixed(2) +' '+(e?'kMGTPEZY'[--e]+'B':'Bytes');
    }

    var apiUrl = 'http://127.0.0.1:5050/api';
    var apiImage = apiUrl + '/image';

    $scope.onFormSubmit = function() {
        if($scope.submitted)
            return;

        $scope.submitted = true;
        NProgress.start();

        // construct the formdata
        var formData = new FormData();
        formData.append('file', $scope.file.content);
        formData.append('path', $scope.file.path);
        formData.append('name', $scope.file.name);
        formData.append('randomized_location', $scope.params.randomized_location);
        formData.append('randomized_scale', $scope.params.randomized_scale);

        // Angular’s default transformRequest function will try to serialize
        // our FormData object, so we override it with the identity function to
        // leave the data intact.
        var request = {
            method: 'POST',
            url: apiImage,
            data: formData,
            transformRequest: angular.identity, 
            headers: {
                'Content-Type': undefined
            }
        };

        $http(request)
        .then(function(success){

            // new request to retrieve the result
            var data = { // the reqeust data
                resource_url : '',
                _id : ''};
            var list = success.data.result.href.split('/');
            if(list.length == 2) {
                data.resource_url = list[0];
                data._id = list[1];
            } else {
                console.warn("Can\'t obtain URL from '" + $stateParams.data.result.href + "'");
            }
            request = {
                method: 'GET',
                url: apiUrl + '/' + data.resource_url + '?where={"_id":"'+data._id+'"}', // FIXME use transformRequest to process the data instead
                data: {
                    where: {
                        _id : data._id
                    }
                },
            };

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
                                url: e[0],
                                score: e[1]
                            }
                            imgs.push(img);
                        });

                        // sort by score in ascending order
                        items = imgs.sort(function(a, b){
                            return a.score - b.score;
                        });

                        $scope.state.totalImages = items.length;
                        $scope.addMoreItems(12);
                        $interval.cancel(stop);
                        NProgress.done();
                        $scope.submitted = false;
                    }

                }, function(error){
                    clearImages();

                    console.error(error);
                    $interval.cancel(stop);
                    NProgress.done();
                    $scope.submitted = false;
                });
            }, delayMs);

        }, function(error){

            NProgress.done();
            console.error(error);
            $scope.submitted = false;
        });

    }

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

    /**
     * convert a comma separated number string to an array of number pairs.
     */
    function str2path (s) {
        if(!s)
            return [];

        var re = /\s*,\s*/;
        var numList = s.split(re);
        var num = [];
        for(var i=0; i<numList.length; i+=2) {
            var x = parseInt(numList[i], 10);
            var y = parseInt(numList[i+1], 10);
            num.push([x,y]);
        }
        return num;
    };

    $scope.onFormReset = function() {
        $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
    }

}]);
