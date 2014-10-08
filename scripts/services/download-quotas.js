'use strict';

angular.module('services.downloadQuotas', [])


.run(function($rootScope) {
    $rootScope.rows =  [];
	$rootScope.selected =  [];
})


.service('downloadQuotasService', ['$http', '$q', function ($http, $q) {

    console.log('create download quotas service');

    this.initDownloadQuotas = function (centreCode) {
        var deferred = $q.defer();
        $http.get('/edge-api/edge/v1/downloadquotas/init/' + centreCode).success(
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
        console.log('invoking remote update download quota service');

        var deferred = $q.defer();
        $http.post('/edge-api/edge/v1/downloadquotas/update/', updates).success(
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

