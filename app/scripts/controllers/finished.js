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
        $scope.error = false;

        ycRestfrontend.confirmOrder({
            orderId: $stateParams.orderid,
            contractId: $stateParams.contractid
        }).$promise.then(function (response) {
            $scope.setupFinished = true;
            $scope.error = false;
            $scope.mandatorid = response.createdMandators;
        }, function(error){
        	console.log(error);
        	$scope.setupFinished = true;
        	$scope.errorCode = ['order_confirmation_error'];
        	$scope.error = true;
        });


    });