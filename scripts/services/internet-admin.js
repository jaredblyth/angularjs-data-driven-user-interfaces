'use strict';

angular.module('services.internetAdmin', []).service('internetAdminService', ['$http', '$q', function ($http, $q) {

    console.log('create internet admin service');

    this.saveUpdates = function (updates) {
            console.log('invoking remote update internet details service');

            var deferred = $q.defer();
            $http.post('/intadmin/edge/v1/internetdetails/update/', updates).success(
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