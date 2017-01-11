'use strict';

/**
 * @ngdoc directive
 * @name ycBookingApp.directive:error
 * @description
 * # error
 */
angular.module('ycBookingApp')
  .directive('error', function () {
    return {
      template: '<div class="col-sm-12" ><div class="alert alert-danger"><ul style="margin-bottom: 15px;"><li ng-repeat="error in cause" translate="{{error}}" translate-compile translate-values="{{variables}}" ></li></ul><div ng-if="message" class="panel panel-warning"><div class="panel-heading">Message</div><div class="panel-body">{{message}}</div></div><div ng-if="details" class="panel panel-warning"><div class="panel-heading">Details</div><div class="panel-body">{{details}}</div></div></div></div></div>',
      restrict: 'E',
      scope: {
        cause: '=',
        variables: '=',
        message: '=',
        details: '='
      },

      controller: function ($scope, $stateParams) {

        if (!$scope.cause instanceof Array) {
          $scope.cause = [$scope.cause];
        }
        for (var i = 0; i < $scope.cause.length; i++) {
          if ($scope.cause[i] === '') {
            $scope.cause[i] = 'UnmappedError';
          }
        }
        if (window._paq) {
          window._paq.push(['trackEvent',
            'error-displayed',
            JSON.stringify([$scope.cause, $scope.message, $scope.details])
          ]);
        }
      }
    };
  });
