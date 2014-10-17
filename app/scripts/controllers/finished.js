/**
 * @ngdoc function
 * @name ycBookingApp.controller:FinishedCtrl
 * @description
 * # FinishedCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('FinishedCtrl', function ($scope, $stateParams, $timeout, ycRestfrontend) {
        'use strict';

        $scope.contractid = $stateParams.contractid;
        $scope.customerid = $stateParams.customerid;
        $scope.orderid = $stateParams.orderid;

        $scope.setupFinished = false;

        ycRestfrontend.confirmOrder({
            orderId: $stateParams.orderid,
            contractId: $stateParams.contractid
        }).$promise.then(function (response) {
            $scope.setupFinished = true;
            $scope.mandatorid = response;
        });


    });