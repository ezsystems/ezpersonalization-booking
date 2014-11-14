/**
 * @ngdoc function
 * @name ycBookingApp.controller:InitCtrl
 * @description
 * # InitCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('InitCtrl', function ($state, $stateParams, $sessionStorage, $scope, $window, $location, $translate) {
        'use strict';
        if ($stateParams.directId !== undefined) {
            $sessionStorage.directId = $stateParams.directId;
        }
        if ($stateParams.product !== undefined) {
            $sessionStorage.productcode = $stateParams.product;
        }
        if ($sessionStorage.productcode === undefined) {
            $location.url('/pricing?lang=' + $translate.use());
            $window.location.href = $location.url();

        }
        if (window._paq){
            window._paq.push(['setCustomVariable',
                1,
                "product",
                $sessionStorage.productcode,
                "visit"
            ]);
        }
        $location.url('/');
        $state.go($scope.tabs[0].id, {}, {
            location: true
        });
    });