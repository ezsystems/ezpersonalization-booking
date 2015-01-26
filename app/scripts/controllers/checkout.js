/**
 * @ngdoc function
 * @name ycBookingApp.controller:CheckoutCtrl
 * @description
 * # CheckoutCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('CheckoutCtrl', function ($scope, $state, $timeout, $location, $sessionStorage, ycRestfrontend, ENV, $translate) {
        'use strict';
        var self = this;
    

        $scope.checkoutInProgress = false;
        $scope.opendatepicker = false;

        $scope.ready = false;
        $scope.paymentMethods = {};
        $scope.paymentMethodEnum = [];
        $scope.paymentMethodNames = {
            'CreditCard:Wirecard': 'credit_card',
            'Debit:Wirecard': 'direct_debit',
            'PayPal': 'paypal_payment_select'
        }
        $scope.payment = {
            bearer: ''
        };
        /*
        if ($sessionStorage.payment && $sessionStorage.payment.emailAddress) {
            $scope.payment.emailAddress = $sessionStorage.payment.emailAddress;
        } else {
            $scope.payment.emailAddress = $scope.billing.email
        }
        */
        $scope.payment.emailAddress = '';

        $scope.storeSession = function () {
            $sessionStorage.payment = {
                "emailAddress": $scope.payment.emailAddress
            };
        };


        $scope.pickdate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            this.opendatepicker = !this.opendatepicker;
        };
        $scope.dateOptions = {
            datepickerMode: 'month',
            minMode: 'month',
            maxMode: 'month',
            formatMonth: 'MM'
        };



        $scope.isSuccess = false;

        var paymentConfig = {
            // REQUIRED. The initial order to be displayed. This will be requested immediately upon load
            publicApiKey: ENV.pactasApiKey,//'53f1f9371d8dd00714634bf0',
            // REQUIRED. After payment user will be redirected to this URL.
            providerReturnUrl: $state.href('paymentDone', {}, {
                absolute: true
            })
        };
        self.iteroJSPayment = new IteroJS.Payment(paymentConfig, function () {
            $timeout(function () {
                $scope.$apply(function () {
                    // When IteroJS is ready, copy the payment methods and initial order
                    $scope.ready = true;
                    $scope.paymentMethods = self.iteroJSPayment.getAvailablePaymentMethods();
                    $scope.paymentMethodEnum = self.iteroJSPayment.getAvailablePaymentMethodEnum();
                    $scope.payment.bearer = $scope.paymentMethodEnum[0];
                });
            });
        }, function (errorData) {
        	$scope.errorCode = ["payment_init_error"]
        });

        $scope.isDebit = function () {
            return $scope.payment.bearer === 'Debit:Wirecard' || $scope.payment.bearer === 'Debit:FakePSP';
        };

        $scope.isCreditCard = function () {
            return $scope.payment.bearer === 'CreditCard:Wirecard' || $scope.payment.bearer === 'CreditCard:FakePSP';
        };

        $scope.needsEmail = function () {
            return $scope.payment.bearer === 'Paypal' || (!$scope.isDebit() && !$scope.isCreditCard());
        };

        


        function checkout(cartData, billingData, paymentData) {
            delete $scope.errorCode;
            $scope.checkoutInProgress = true

            var cart = {
                planVariantId: cartData.planVariantId,
                customFields: {
                    website: cartData.website
                }
            };
            var customerData = {
                emailAddress: billingData.email,
                firstName: billingData.firstname,
                lastName: billingData.lastname,
                tag: billingData.tag,
                companyName: billingData.company,
                vatId: billingData.vatid,
                DefaultBearerMedium: 'Email',
                customFields: {
                    phone: billingData.phone
                },
                address: {
                    'addressLine1': billingData.addressline,
                    'street': billingData.street,
                    'houseNumber': billingData.number,
                    'postalCode': billingData.postalcode,
                    'city': billingData.city,
                    'country': billingData.country
                },
                locale: $translate.use(),
                Language: $translate.use(),
            };
            if (paymentData.validto !== undefined) {
                paymentData.expiryMonth = extractMonth(paymentData.validto);
                paymentData.expiryYear = extractYear(paymentData.validto);
            }
            //paymentData.emailAddress = customerData.emailAddress;
            
            var signup = new IteroJS.Signup();

            signup.createOrder(cart, customerData, function (order) {
                    // link contract and login here
                    var ycOrder = {
                        orderId: order.OrderId,
                        customerId: order.CustomerId,
                        productId: cartData.productcode,
                        timeZone: cartData.timezone,
                        websiteUrl: cartData.website,
                        currency: cartData.currency
                    };
                    var ycOrderCreated = ycRestfrontend.createOrder(ycOrder).$promise;
                    ycOrderCreated.catch(function(){$timeout(function(){$scope.errorCode = ["order_placement_error"]})});



                    //continue to payment
                    signup.paySignupInteractive(self.iteroJSPayment, paymentData, order, function (data) {
                        // This callback will be invoked when the signup succeeded (or failed)
                        // Note that the callback must use $apply, otherwise angularjs won't notice we changed something:
                        $scope.$apply(function () {
                            if (!data.Url) {
                            	ycOrderCreated.then(function(){
	                                $scope.isSuccess = true; //done
	                                var params = {
	                                    contractid: data.ContractId,
	                                    customerid: data.CustomerId,
	                                    orderid: data.OrderId
	                                };
	                                $state.go('finished', params, {
	                                    location: true
	                                });
                            	})
                            } else {
                            	ycOrderCreated.then(function(){
                                	window.location = data.Url; // redirect required, e.g. paypal, skrill
                            	});
                            }
                        });
                    }, function (error) {
                        $scope.$apply(function () {
                            console.log(error);
                            $scope.errorCode = error['errorCode'];
                            $scope.errorMessage = error['errorMessage'];
                            $scope.errorDetails = error['details'];
                            for (var i in $scope.errorCode) {
                                if ($scope.errorCode[i] === "") {
                                    $scope.errorCode[i] = "UnmappedError";
                                }
                            }
                        })
                    });

                },
                function (error) {
                    $scope.$apply(function () {
                        console.log(error);
                        $scope.errorCode = error['errorCode'];
                        $scope.errorMessage = error['errorMessage'];
                        $scope.errorDetails = error['details'];
                        if ($scope.errorCode[i] === "") {
                            $scope.errorCode[i] = "UnmappedError";
                        }
                    })
                });
        }

        $scope.checkout = function () {
            if ($scope.payment.form.$valid) {
                $scope.checkoutInProgress = true;
                ycRestfrontend.getPlan($scope.booking.productcode).$promise.then(function (reponse) {
                    $scope.booking.planVariantId = reponse.comaId.variant;
                    checkout($scope.booking, $scope.billing, $scope.payment);
                });
            }
        };
    
    
        var normalizeYear = function( year) {
            year = parseInt(year,10)
            if (year < 0) {
                return year;
            }
            if (year < 100) {
                return 2000 + year;
            } else {
                return year;
            }
        }
        var extractMonth = function(input) {
            var pattern = /(\d\d)\/?(\d\d)?/
            
            var match = pattern.exec(input);
            if (match === null) {
                return -1;
            }
            return parseInt(match[1],10);
        }
        
        var extractYear = function(input) {
            var pattern = /(\d\d)\/?(\d\d)/
            
            var match = pattern.exec(input);
            if (match === null) {
                return -1;
            }
            return normalizeYear(match[2],10);
        }
        
        $scope.validateExpiry = function (maskedInput) {
            var date = new Date();
            var now = new Date();
            var year = extractYear(maskedInput);
            var month = extractMonth(maskedInput);
            date.setFullYear(year);
            date.setMonth(month -1)
            if (month < 0 || month > 12) {
                return false;
            }
            return now < date;
        }
        





    });