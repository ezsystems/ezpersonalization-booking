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
    if (!$scope.billing.country) {
      $scope.billing.country = location;
    }

    if (!$scope.billing.email) {
      $scope.billing.email = $scope.account.email;
    }
    if (!$scope.billing.firstname) {
      $scope.billing.firstname = $scope.account.firstname;
    }
    if (!$scope.billing.lastname) {
      $scope.billing.lastname = $scope.account.lastname;
    }

    $scope.storeSession = function () {
      $sessionStorage.billing = $scope.billing;
    };

    $scope.validateVatId = function (vatId) {
      if (vatId) {
        return IteroJS.validateVatId(vatId);
      }
      return true;
    };

    $scope.$on('$stateChangeStart',
      function (event, toState, toParams, fromState, fromParams) {
        $scope.storeSession();
      });
  });
