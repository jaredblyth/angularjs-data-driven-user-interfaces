
'use strict';

angular.module('services.filterCheck', []).service('filterCheckService', ['$http', '$q', function ($http, $q) {

    console.log('create filter check service');

    this.initialiseFilterCheck = function () {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/filter/check/init').success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.test = function (filterCheckRequest) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/filter/check/test/', filterCheckRequest).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.proxyClientTest = function (proxyClientFilterCheckRequest) {
        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/filter/check/proxy/test/', proxyClientFilterCheckRequest).success(
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