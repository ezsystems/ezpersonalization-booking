/**
 * @ngdoc function
 * @name ycBookingApp.controller:CheckoutCtrl
 * @description
 * # CheckoutCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
  .controller('CheckoutCtrl', function ($scope, $state, $timeout, $location, $sessionStorage, ycRestfrontend, ENV, $translate, $modal) {
    'use strict';
    var self = this;

    $scope.openRetryModal = function () {

      var modalInstance = $modal.open({
        template:
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h4 class="modal-title">Ooops!</h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="row">'+
        '<error cause="errorCode" message="errorMessage" details="errorDetails"></error>' +
        '</div>'+
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-primary" ui-sref="billing" ng-click="$close()" type="submit"></i>' + "{{'retry_button' | translate}}" + '</button>' +
        '</div>' +
        '</div>',
        scope: $scope
      });

      modalInstance.result.then(function () {
        $state.go('billing');
      }, function () {
        $state.go('billing');
      });

    };

    $scope.openCouponInvalidMessage = function () {

      var modalInstance = $modal.open({
        template:
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h3 class="modal-title">' + "{{'invalid_coupon_code' | translate}}" + '</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<div class="row">'+
        '<p align="center">'+'<b>'+   "{{'invalid_coupon_code_error_message' | translate}}" + '</b>' +'</p>' +
        '</div>'+
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-primary" ng-click="$close()" type="submit"></i>OK</button>' +
        '</div>' +
        '</div>',
        scope: $scope
      });
    };

    $scope.couponCodeValidator = true;

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
      $scope.openRetryModal();
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

    $scope.trackPaymentSelect = function() {
      if (window._paq){
        window._paq.push(['trackEvent',
          'payment-selected',
          $scope.payment.bearer
        ]);
      }
    }



    $scope.validateCouponCode = function() {
      return $scope.payment.couponValidator;
    }


    function checkout(cartData, billingData, paymentData) {
      delete $scope.errorCode;

      var cart = {
        planVariantId: cartData.planVariantId,
        couponCode: $scope.payment.coupon.code,
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
      try{
        signup.createOrder(cart, customerData, function (order) {
            // Coupon Code validation
            if( order.hasOwnProperty('Code') ) {
              $scope.checkoutInProgress = false
              $scope.openCouponInvalidMessage();
            }
            else {
              $scope.checkoutInProgress = true
              // link contract and login here
              var ycOrder = {
                orderId: order.OrderId,
                customerId: order.CustomerId,
                productId: cartData.productcode,
                timeZone: cartData.timezone,
                websiteUrl: cartData.website,
                currency: cartData.currency
              };
              if (window._paq){
                window._paq.push(['trackEvent',
                  'pactas-order-created',
                  order.OrderId,
                  cartData.productcode
                ]);
              };
              if (window._paq){
                window._paq.push(['trackEvent',
                  'pactas-customer-created',
                  order.CustomerId
                ]);
              };

              var ycOrderCreated = ycRestfrontend.createOrder(ycOrder).$promise;
              ycOrderCreated.catch(function(){$timeout(function(){$scope.errorCode = ["order_placement_error"]})});



              //continue to payment
              signup.paySignupInteractive(self.iteroJSPayment, paymentData, order, function (data) {
                // This callback will be invoked when the signup succeeded (or failed)
                // Note that the callback must use $apply, otherwise angularjs won't notice we changed something:
                $scope.$apply(function () {
                  if (!data.Url) {
                    if (window._paq){
                      window._paq.push(['trackEvent',
                        'pactas-contract-created',
                        data.ContractId
                      ]);
                    };
                    if (window._paq){
                      window._paq.push(['setCustomVariable',
                        4,
                        "contractId",
                        data.ContractId,
                        "visit"
                      ]);
                    }
                    ycOrderCreated.then(function(){
                      if (window._paq){
                        window._paq.push(['trackEvent',
                          'yc-order-created',
                          data.OrderId
                        ]);
                      };
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
                      if (window._paq){
                        window._paq.push(['trackEvent',
                          'yc-order-created',
                          data.OrderId
                        ]);
                      };
                      if (window._paq){
                        window._paq.push(['trackEvent',
                          'payment-redirect',
                          paymentData.bearer
                        ]);
                      };
                      window.location = data.Url; // redirect required, e.g. paypal, skrill
                    });
                  }
                });
              }, function (error) {
                $scope.$apply(function () {
                  console.log(error);
                  $scope.errorMessage = error['errorMessage'];
                  $scope.errorDetails = error['details'];
                  $scope.errorCode = error['errorCode'];
                  for (var i in $scope.errorCode) {
                    if ($scope.errorCode[i] === "") {
                      $scope.errorCode[i] = "UnmappedError";
                    }
                  }
                  if (window._paq){
                    window._paq.push(['trackEvent',
                      'pactas-error',
                      JSON.stringify(error)
                    ]);
                  };
                  $scope.openRetryModal();
                })
              });

            }},
          function (error) {
            $scope.$apply(function () {
              console.log(error);
              $scope.errorMessage = error['errorMessage'];
              $scope.errorDetails = error['details'];
              $scope.errorCode = error['errorCode'];
              for (var i in $scope.errorCode) {
                if ($scope.errorCode[i] === "") {
                  $scope.errorCode[i] = "UnmappedError";
                }
              }

              if (window._paq){
                window._paq.push(['trackEvent',
                  'pactas-error',
                  JSON.stringify(error)
                ]);
              };
              $scope.openRetryModal();
            })
          });
      }catch (error){
        console.log("error:", error)
        $scope.errorMessage = error.message;
        //$scope.errorDetails = error['details'];
        $scope.errorCode = [error.name]
        for (var i in $scope.errorCode) {
          if ($scope.errorCode[i] === "") {
            $scope.errorCode[i] = "UnmappedError";
          }
        }

        if (window._paq){
          window._paq.push(['trackEvent',
            'pactas-error',
            JSON.stringify(error)
          ]);
        };
        $scope.openRetryModal();

      }
    }



    $scope.checkout = function () {
      if (window._paq){
        window._paq.push(['trackEvent',
          'checkout-triggered',
          $scope.payment.bearer
        ]);
      }
      if ($scope.payment.form.$valid) {

        ycRestfrontend.getPlan($scope.booking.productcode).$promise.then(function (reponse) {
          $scope.booking.planVariantId = reponse.comaId.variant;

          checkout($scope.booking, $scope.billing, $scope.payment);

        });
      } else {
        var s = "";
        for (var i in $scope.payment.form.$error) {
          var names = "";
          for (var j in $scope.payment.form.$error[i]) {
            names = names + $scope.payment.form.$error[i][j].$name + ","
          }
          s += ''+ i +':' + names + ";";

        }
        if (window._paq){
          window._paq.push(['trackEvent',
            'payment-data-invalid',
            s
          ]);
        }
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
