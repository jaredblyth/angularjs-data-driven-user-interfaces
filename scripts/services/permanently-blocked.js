'use strict';

angular.module('services.permanentlyBlocked', []).service('permanentlyBlockedService', ['$http', '$q', function ($http, $q) {

    console.log('create permanently blocked service');

    this.initialisePermanentlyBlocked = function () {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/permanently/blocked/init/').success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.batchUpdatePermanentlyBlocked = function (updates) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/permanently/blocked/update', updates).success(
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