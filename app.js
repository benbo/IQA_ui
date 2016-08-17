'use strict';

/** polygon drawing directive */
var imageMap = angular.module('imageMap', []);

/** image uploading */
var simgImageApp = angular.module('simgImageApp', []);

/** polygon drawing */
var simgDrawApp = angular.module('simgDrawApp', ['imageMap']);

/** results */
var simgListsApp = angular.module('simgListsApp', []);

/**
 * The master module
 */
var simgApp = angular.module('simgApp', [ 'ui.router', 'simgImageApp', 'simgDrawApp', 'simgListsApp']);

/**
 * Module configuration
 */
simgApp.
config([ '$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {

	$stateProvider
	.state('image', {
		url: '/image',
		templateUrl: 'image/simg-image-app.html',
        params : { data: null, idx: 0 }
    }).state('draw', {
		url: '/draw',
		templateUrl: 'draw/simg-draw-app.html'
    }).state('lists', {
		url: '/lists',
		templateUrl: 'lists/simg-lists-app.html',
        params : { data: null, idx: 0 }
	});

    $urlRouterProvider.otherwise('/image'); /** default */

    // hide the spiner of the progress bar
    NProgress.configure({ showSpinner: false });

} ]);
