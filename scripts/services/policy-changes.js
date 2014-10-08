'use strict';

angular.module('services.policyChanges', []).service('policyChangesService', ['$http', '$q', function ($http, $q) {

    console.log('create policy changes service');

    this.getChangeSets = function (queryData) {
        var deferred = $q.defer();
        $http.post('/edge/v1/cs/view/get', queryData).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.getChangeSetItems = function (id) {
        var deferred = $q.defer();
        $http.get('/edge/v1/cs/items/view/get/' + id).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();

            });
        return deferred.promise;
    };

    this.generateChangeSetReport = function (queryData) {
        var deferred = $q.defer();
        $http.post('/edge/v1/cs/report/generatechangesetreport', queryData).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();

            });
        return deferred.promise;
    };

    this.batchUpdateChangeSets = function (changeSets) {
        var deferred = $q.defer();
        $http.post('/edge/v1/cs/update', changeSets).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.batchUpdateChangeSetItems = function (changeSetItems) {
        var deferred = $q.defer();
        $http.post('/edge/v1/cs/items/update', changeSetItems).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

}]);
