'use strict';

angular.module('services.policyTypes', []).service('policyTypesService', ['$http', '$q', function ($http, $q) {

    console.log('created policy types service');

    this.initPolicyTypes = function () {
        var deferred = $q.defer();
        $http.get('/edge/v1/policy/types/init').success(
            function (data) {
                console.log(JSON.stringify(data));
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.saveUpdates = function (updates) {
        console.log('invoking remote update policy types service');

        var deferred = $q.defer();
        $http.post('/edge/v1/policy/types/update', updates).success(
            function (data) {
                console.log('update successful');
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

}]);