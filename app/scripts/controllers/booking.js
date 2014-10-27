/**
 * @ngdoc function
 * @name ycBookingApp.controller:BookingCtrl
 * @description
 * # BookingCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('BookingCtrl', function ($scope, $sessionStorage, ycRestfrontend, $translate, ENV, $sce) {
        'use strict';
        //var plans = $resource('assets/plans.json',{},{});
        var plans = ycRestfrontend.getPlans($sessionStorage.productcode);
        $scope.timezones = moment.tz.names();
        $scope.booking.timezone = jstz.determine().name();

        $scope.currencies = ["EUR", "USD", "NOK", "GBP", "CHF"];

        function transformResponse(data) {
            var result = {};
            for (var i = 0; i < data.length; i++) {
                var product = data[i];
                if (product.notAvailable) {
                    continue;
                }
                result[product.name] = product.id;
                if ($sessionStorage.productcode === product.id && !$scope.booking.productcode) {
                    $scope.booking.productcode = product.id;
                }
            }
            $scope.plans = result;
            return result;
        }

        plans.$promise.then(transformResponse, function(error){
        	$timeout(function(){$scope.errorCode=["plans_not_found_error"]})
        });


        $scope.storeSession = function () {
            $sessionStorage.booking = $scope.booking;
        }

        $scope.getIframeUrl = function() {
        	var url = ENV.pricingBaseUrl + '/product-iframe/' +$translate.use() +'/' + $scope.booking.productcode;
        	return $sce.trustAsResourceUrl(url)
        }
    });