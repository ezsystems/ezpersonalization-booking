/**
 * @ngdoc function
 * @name ycBookingApp.controller:BillingCtrl
 * @description
 * # BillingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('BillingCtrl', function ($scope, tab, $sessionStorage, location) {
        'use strict';
        $scope.countries = tab.countries;
        if (!$scope.billing.country){
            $scope.billing.country = location;
        }
    
        $scope.storeSession = function () {
            $sessionStorage.billing = $scope.billing;
        };
    });