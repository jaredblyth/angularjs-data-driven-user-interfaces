'use strict';

angular.module('services.schoolMessages', []).service('schoolMessagesService', ['$http', '$q', function ($http, $q) {

    console.log('create school messages service');

    this.findSchoolMessages = function () {
        var deferred = $q.defer();
        $http.get('/edge/v1/schoolmsg/init').success(
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
        $http.post('/edge/v1/schoolmsg/update', updates).success(
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