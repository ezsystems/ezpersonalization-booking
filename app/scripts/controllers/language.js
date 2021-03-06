/**
 * @ngdoc function
 * @name ycBookingApp.controller:LanguageCtrl
 * @description
 * # LanguageCtrl
 * Controller of the ycBookingApp
 */
angular.module('ycBookingApp')
    .controller('LanguageCtrl', function ($scope, $translate, ycRestfrontend) {
        'use strict';
        $scope.languages = [{
            code: 'en',
            flag: 'us'
        }, {
            code: 'de',
            flag: 'de'
        }];
        $scope.changeLanguage = function (langKey) {
            $translate.use(langKey);
            $scope.account.lang = langKey;
			ycRestfrontend.updateLang(langKey);
        };

    });