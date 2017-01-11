'use strict';

/**
 * @ngdoc directive
 * @name ycBookingApp.directive:nextButton
 * @description
 * # nextButton
 */
angular.module('ycBookingApp')
  .directive('nextButton', function () {
    return {
      scope: {
        callback: '='

      },
      template: '<button class="btn btn-default pull-right" ng-click="proceed()" type="submit">{{\'continue\' | translate}} »</button>',
      replace: true,
      controller: function ($scope, $state, tab) {
        function proceed() {
          if (window._paq) {
            window._paq.push(['trackEvent',
              'continue',
              $state.current.name
            ]);
          }
          for (var i = 0; i < $scope.tabs.length; i++) {
            var tab = $scope.tabs[i];
            if (tab.id === $state.current.name) {
              var nextIndex = i + 1;
              if (nextIndex < $scope.tabs.length) {
                $state.go($scope.tabs[nextIndex].id, {}, {
                  location: true
                });
              }
            }

          }
        }
        $scope.tabs = tab.tabs;
        $scope.proceed = proceed;

      },

      restrict: 'E',
    };
  });
