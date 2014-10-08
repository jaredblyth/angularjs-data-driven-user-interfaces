'use strict';

angular.module('services.listTypes', []).service('listTypesService', ['$http', '$q', function ($http, $q) {

    console.log('create list types service');

    this.findListTypes = function () {
        var deferred = $q.defer();
        $http.get('/edge/v1/ext/types/init').success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.saveUpdates = function (updates) {
        var deferred = $q.defer();
        $http.post('/edge/v1/ext/types/update', updates).success(
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