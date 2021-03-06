'use strict';

/**
 * @ngdoc function
 * @name ycBookingApp.controller:TabCtrl
 * @description
 * # TabCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('TabCtrl', function ($state, $rootScope, $scope, tab, $sessionStorage, $location) {

        function getTabIndexById(id) {
            for (var i = 0;
                (i < $scope.tabs.length); i++) {
                var tab = $scope.tabs[i];
                if (tab.id === id) {
                    return i;
                }
            }
            return -1;
        }

        function isEnabled(id) {
            var max = getTabIndexById(id);
            for (var i = 0;
                (i < $scope.tabs.length && i < max); i++) {
                var tab = $scope.tabs[i];
                if (tab.id === id) {
                    break;
                }

                if (!$scope[tab.id].valid) {
                    return false;
                }
            }
            return true;

        }

        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                var _form_error = "";
                if ($scope[fromState.name] !== undefined && $scope[fromState.name].form !== undefined) {
                    $scope[fromState.name].valid = $scope[fromState.name].form.$valid;
                    var s = "";
                    for (var i in $scope[fromState.name].form.$error) {
                        var names = "";
                        for (var j in $scope[fromState.name].form.$error[i]) {
                            names = names + $scope[fromState.name].form.$error[i][j].$name + ","
                        }
                        s += ''+ i +':' + names + ";";
                        
                    }
                    _form_error = s;
                }
                if (!isEnabled(toState.name)) {
                    $scope.$broadcast('show-errors-check-validity');
                    event.preventDefault();
                }
                if (window._paq){
                    window._paq.push(['trackEvent',
                        'state-change:' + fromState.name + '->' + toState.name,
                        isEnabled(toState.name),
                        _form_error
                    ]);
                }
            });

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                if (window._paq){
                    window._paq.push(['setDocumentTitle', toState.name]);
                    window._paq.push(["trackPageView"]);
                }

            });

	$scope.$location = $location;
        $scope.tabs = tab.tabs;

        if ($scope.booking === undefined && $sessionStorage.booking !== undefined) {
            $scope.booking = $sessionStorage.booking;
            delete $sessionStorage.booking;
        } else {
            $scope.booking = {
                valid: false
            };
        }
        if ($scope.account === undefined && $sessionStorage.account !== undefined) {
            $scope.account = $sessionStorage.account;
            delete $sessionStorage.account;
        } else {
            $scope.account = {
                valid: false
            };
        }
        if ($scope.billing === undefined && $sessionStorage.billing !== undefined) {
            $scope.billing = $sessionStorage.billing;
            delete $sessionStorage.billing;
        } else {
            $scope.billing = {
                valid: false
            };
        }

        $scope.payment = {
            valid: false,
            opendatepicker: false,

            ready: false,
            methods: {},
            methodEnum: [],
            data: {
                bearer: ''
            },
            pickdate: function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                this.opendatepicker = !this.opendatepicker;
            },
            dateOptions: {
                minMode: 'month',

                datepickerMode: 'month',
                'min-mode': 'month',

                'datepicker-mode': 'month',
                formatMonth: 'MM',
            },
            today: new Date(),
        };






        function go(id) {
            $state.go(id, {}, {
                location: true
            });
        }
        $scope.go = go;






    });
