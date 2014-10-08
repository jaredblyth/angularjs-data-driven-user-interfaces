'use strict';

angular.module('services.selfManaged', []).service('selfManagedService', ['$http', '$q', function ($http, $q) {

    console.log('create self managed service');

    this.initialiseSelfManaged = function () {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/sm/init/').success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.batchUpdateSelfManaged = function (updates) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/sm/update', updates).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.generateReport = function (emailAddress) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/sm/generatereport',{emailAddress:emailAddress}).success(
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