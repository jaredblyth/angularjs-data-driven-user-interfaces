'use strict';

angular.module('config', []).config(['$locationProvider', '$routeProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $routeProvider, $stateProvider, $urlRouterProvider) {

        console.log('configuring matApp');

        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise('/intadmin');

        $stateProvider
            .state('default', {
                url: '/intadmin'
            })

            .state('preferences', {
                url: '/intadmin/preferences',
                templateUrl: '/intadmin/views/screens/preferences/preferences.html',
                controller: 'PreferencesCtrl'
            })

            .state('internet-admin', {
                url: '/intadmin/internet-admin',
                templateUrl: '/intadmin/views/screens/internet-admin/internet-admin.html',
                controller: 'InternetAdminCtrl'
            })

            .state('manage-schools', {
                url: '/intadmin/manage-schools',
                templateUrl: '/intadmin/views/screens/manage-schools/manage-schools.html',
                controller: 'ManageSchoolsCtrl'
            })

            .state('invalid', {
                url: '/intadmin/invalid',
                templateUrl: '/intadmin/views/templates/shell-invalid.html'
            });


}]).factory('matHttpInterceptor', ['$q', '$rootScope', function($q, $rootScope) {

        /**
         * Simple http interceptor which broadcasts an 'authRequired' event if it detects
         * that a response error occurred due to session timeout
         */

        console.log('creating mat http request interceptor');

        return {
            'responseError': function (rejection) {
                // if status is zero assume session timeout has occurred (don't have any
                // better way of telling unfortunately)
                if (rejection.status === 0) {
                    console.log('session timeout detected');
                    $rootScope.$broadcast('authRequired');
                }

                return $q.reject(rejection);
            }
        };

    }]).config(['$httpProvider', function ($httpProvider) {
        console.log('registering mat http interceptor');
        $httpProvider.interceptors.push('matHttpInterceptor');
    }]).run(['$http', '$templateCache', function ($http, $templateCache) {

        console.log('configuring app after module loading');

        // create humane error notifier
        humane.error = humane.spawn({ addnCls: 'humane-jackedup-error', timeout: 0, clickToClose:true });

        // grab timeout modal now to prevent issues once a users session has expired
        $http.get('views/modals/timeout.html', { cache: $templateCache });

    }]);
