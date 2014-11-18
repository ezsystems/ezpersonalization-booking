/**
 * @ngdoc service
 * @name ycBookingApp.ycRestfrontend
 * @description
 * # ycRestfrontend
 * Provider in the ycBookingApp.
 */
angular.module('ycBookingApp.rest', ['ngResource'])
    .provider('ycRestfrontend', function () {
        'use strict';
        // Private variables
        var baseUrl = '/api';

        function getBaseUrl() {
            return baseUrl;
        }
        // Private constructor
        function RestService($resource, $translate, $location, $window, $sessionStorage) {

            var restfrontend = $resource(baseUrl, {}, {
                getMe: {
                    url: baseUrl + '/v4/profile/get_me',
                    params: {
                        'no-realm': 'true',
                        'withAuthenticationInformation': 'true'
                    },
                    cache: true,
                    timeout: 10000
                },
                getPlans: {
                    url: baseUrl + '/v4/registration/get_sister_products/:product_id',
                    isArray: true,
                    cache: true,
                    timeout: 10000
                },
                getPlan: {
                    url: baseUrl + '/v4/registration/get_product/:product_id',
                    cache: true,
                    timeout: 10000
                },
                createOrder: {
                    method: 'POST',
                    url: baseUrl + '/v4/order/create_order',
                    cache: false,
                    timeout: 10000

                },
                confirmOrder: {
                    method: 'POST',
                    url: baseUrl + '/v4/order/confirm_order',
                    cache: false,
                    timeout: 20000
                },
                changePassword: {
                    method: 'POST',
                    url: baseUrl + '/v4/profile/change_password',
                    cache: false,
                    timeout: 20000
                },
                updateLang: {
                    method: 'POST',
                    url: baseUrl + '/v4/profile/update_lang',
                    cache: false,
                    timeout: 20000
                },
                updateProfile: {
                    url: baseUrl + '/v4/profile/update_local_profile/:provider/:user_id',
                    method: 'POST',
                    params: {
                        provider: '@provider',
                        user_id: '@user_id'
                    },
                    cache: false,
                    timeout: 10000,
                    transformRequest: function (data, header) {
                        delete data.provider;
                        delete data.user_id;
                        return angular.toJson(data);
                    }

                }

            });

            function redirect() {
            	var url = '/login.html?returnUrl=' + $window.location;
            	if ($sessionStorage.productcode !== undefined && $sessionStorage.productcode !== null){
            		url = url + '&product=' +$sessionStorage.productcode
            	} 
                $window.location.href = url +'&lang='+$translate.use(); //$location.url();//'/login.html' + $location.search();
            }

            this.getMe = function () {
                return restfrontend.getMe(function () {}, redirect);
            };
            this.updateProfile = restfrontend.updateProfile;
            this.getBaseUrl = getBaseUrl;
            this.confirmOrder = restfrontend.confirmOrder;
            this.createOrder = restfrontend.createOrder;
            this.changePassword = restfrontend.changePassword;
            this.updateLang = function(lang) {
            	restfrontend.updateLang({'lang': lang});
            }
            this.getPlans = function (productCode) {
                return restfrontend.getPlans({
                    'product_id': productCode,
                    'lang': $translate.use()
                });
            };
            this.getPlan = function (productCode) {
                return restfrontend.getPlan({
                    'product_id': productCode,
                    'lang': $translate.use()
                });
            };

            this.redirectToLogin = redirect;
        }

        // Public API for configuration
        this.setBaseUrl = function (url) {
            baseUrl = url;
        };


        this.getBaseUrl = getBaseUrl;

        // Method for instantiating
        this.$get = function ($resource, $translate, $location, $window, $sessionStorage) {
            //      var myInjector = angular.injector(["ng", "ngResource", 'pascalprecht.translate']);
            //      var $translate = myInjector.get("$translate");
            //      var $resource = myInjector.get("$resource");

            return new RestService($resource, $translate, $location, $window, $sessionStorage);
        };
    });