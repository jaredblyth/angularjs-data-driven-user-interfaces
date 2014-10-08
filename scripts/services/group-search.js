'use strict';

angular.module('services.groupSearch', []).service('groupSearchService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {

    console.log('create group search service');

    this.getDynamicGroups = function (centreCode) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/groupsearch/getDynamicGroups/' + centreCode).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.getGroup = function (groupDn) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/groupsearch/getGroup/' + groupDn).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.getGroupByCN = function (centreCode, groupCn) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/groupsearch/getGroupByCN/' + centreCode + '/' + groupCn).success(
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

}]);