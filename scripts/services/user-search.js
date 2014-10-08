'use strict';

angular.module('services.userSearch', []).service('userSearchService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    console.log('create user search service');

    this.getUserByMisId = function (misId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/usersearch/getUserByMisId/' + misId).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
                $rootScope.messageError = 'Unable to connect to the server at this time';
                $rootScope.$broadcast('toastMessageUpdateError');
            });
        return deferred.promise;
    };

    this.getStaffStudentByLastName = function (centreCode, lastName) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/usersearch/getStaffStudentByLastName/' + centreCode + '/' + lastName).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.getUsersInGroup = function (groupDn) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/usersearch/getUsersInGroup/' + groupDn).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

}]);