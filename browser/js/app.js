'use strict';
window.app = angular.module('InteractiveResume', ['ui.router']);

app.config(($urlRouterProvider, $locationProvider) => {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

app.constant('APP_VARS', {
    MOBILE_WIDTH : 786
});
