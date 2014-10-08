'use strict';

angular.module('services.preferences', []).service('preferencesService', ['$http', '$q', function ($http, $q) {

    console.log('create school preferences service');

    this.initPreferences = function (preferenceName, qedUniqueId) {
        var deferred = $q.defer();
        $http.get('/intadmin/edge/v1/schoolpref/init/' + preferenceName + '/' + qedUniqueId).success(
            function (data) {
                deferred.resolve(data);
				console.log('school preferences service returned data successfully');
            }
        ).error(function(data) {
                console.log('failed to make remote call: ' + JSON.stringify(data));
                deferred.reject();
            });
        return deferred.promise;
    };

    this.saveUpdates = function (preferenceName, preferenceValue, qedUniqueId) {
        console.log('invoking remote update school preferences service');

        var deferred = $q.defer();
        $http.post('/intadmin/edge/v1/schoolpref/update/' + preferenceName + '/' + preferenceValue + '/' + qedUniqueId).success(
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