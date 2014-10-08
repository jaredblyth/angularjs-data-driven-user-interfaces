'use strict';

angular.module('services.lists', []).service('listsService', ['$http', '$q', function ($http, $q) {

    console.log('create list types service');

    this.findLists = function () {
        var deferred = $q.defer();
        $http.get('/edge/v1/ext/lists/init').success(
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
        $http.post('/edge/v1/ext/lists/update', updates).success(
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