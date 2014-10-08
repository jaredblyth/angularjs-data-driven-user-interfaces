'use strict';

angular.module('services.shell', []).factory('shellService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    console.log('create shell service');

    var _currentEntity;
    var _currentUser;
    var _functions = [];
    var _availableRoles = [];
    var _schoolMessage = [];

    return {

        getCurrentEntity: function () {
            return _currentEntity;
        },
        getCurrentUser: function () {
            return _currentUser;
        },
        getAvailableRoles: function(){
            return _availableRoles;
        },
        getSchoolMessage: function() {
            return _schoolMessage;
        },
        initialise: function () {
            var deferred = $q.defer();
            $http.get('/edge/v1/shell/init').success(
                function (data) {
                    _currentEntity = data.hierarchy;
                    _currentUser = data.authenticatedUser;
                    _functions = data.functions;
                    _availableRoles = data.roles;
                    _schoolMessage = data.schoolMessage;
                    deferred.resolve(data);
                }
            ).error(function (data) {
                    console.log(JSON.stringify(data));
                    deferred.reject();
                });
            return deferred.promise;
        },

        hasRole: function (roleName) {
            return _.contains(_currentUser.roles, roleName);
        },

        hasFunction: function (functionName) {
            return _.contains(_functions, functionName);
        },

        notify: function (message, isError) {
            var humaneParams = {msg: message};
            if (isError) {
                humaneParams.level = 'error';
            }
            $rootScope.$broadcast('notify', humaneParams);
        },

        saveComplete: function (message, isError) {
            if (message) {
                this.notify(message, isError);
            }
            $rootScope.$broadcast('stopSpinner');

        },

        swapSchoolContext: function (centreCode) {
            var deferred = $q.defer();
            $http.get('/edge/v1/shell/swapSchoolContext/'  + centreCode).success(
                function (data) {
                    deferred.resolve(data);
                }
            ).error(function (data) {
                    console.log(JSON.stringify(data));
                    $rootScope.messageError = 'Unable to swap schools at this time';
                    $rootScope.$broadcast('toastMessageUpdateError');
                    deferred.reject();
                });
            return deferred.promise;
        }

    };

}]);