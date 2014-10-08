'use strict';

angular.module('services.deviceFiltering', [])

.run(function($rootScope) {
    $rootScope.rows =  '';
	$rootScope.selected =  [];
})

.service('deviceFilteringService', ['$http', '$q', function ($http, $q) {

    console.log('create device filtering service');

    this.initDeviceFiltering = function (centreCode) {
        var deferred = $q.defer();
        $http.get('/edge-api/edge/v1/devicefiltering/init/' + centreCode).success(
            function (data) {
                deferred.resolve(data);
            }
        ).error(function (data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.saveUpdates = function (updates) {
        console.log('invoking remote update device filtering service');

        var deferred = $q.defer();
        $http.post('/edge-api/edge/v1/devicefiltering/update/', updates).success(
            function (data) {
                console.log('update successful');
                deferred.resolve(data);
            }
        ).error(function(data) {
                console.warn('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };
	
}]);